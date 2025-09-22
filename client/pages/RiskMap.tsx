import Layout from "@/components/layout/Layout";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ZoneType = "high" | "medium" | "low" | "safe";

interface Zone {
  id: string;
  type: ZoneType;
  left: number; // %
  top: number; // %
  size: number; // px
  reason: string;
}

export default function RiskMap() {
  const [duration, setDuration] = useState(24);
  const [intensity, setIntensity] = useState(50);
  const [magnitude, setMagnitude] = useState(6.5);
  const [soil, setSoil] = useState(60); // % saturation
  const [wind, setWind] = useState(40); // km/h

  const [results, setResults] = useState<{ high: number; evac: number; prob: number; confidence: number; driver: string } | null>(null);
  const [lastSim, setLastSim] = useState<string>(new Date().toLocaleString());

  const rnd = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const dominantDriver = (r: number, m: number, s: number, w: number) => {
    const rain = 0.38 * (r / 200);
    const seis = 0.28 * (m / 9);
    const soilSat = 0.22 * (s / 100);
    const windG = 0.12 * (w / 120);
    const pairs: { k: string; v: number }[] = [
      { k: "Rainfall", v: rain },
      { k: "Seismic", v: seis },
      { k: "Soil Saturation", v: soilSat },
      { k: "Wind Gusts", v: windG },
    ];
    pairs.sort((a, b) => b.v - a.v);
    return pairs[0].k;
  };

  const reasonFor = (type: ZoneType, r: number, m: number, s: number, w: number) => {
    const driver = dominantDriver(r, m, s, w);
    const parts: string[] = [];
    if (driver === "Rainfall" || r > 80) parts.push(`heavy rainfall ${r.toFixed(0)} mm/hr`);
    if (driver === "Seismic" || m > 5) parts.push(`recent tremors M${m.toFixed(1)}`);
    if (driver === "Soil Saturation" || s > 65) parts.push(`soil saturation ${s.toFixed(0)}%`);
    if (driver === "Wind Gusts" || w > 70) parts.push(`gusts ${w.toFixed(0)} km/h`);
    if (type === "high" && parts.length < 2) parts.push("combined stressors");
    return parts.slice(0, 3).join("; ");
  };

  const zones = useMemo<Zone[]>(() => {
    const create = (count: number, type: ZoneType) =>
      Array.from({ length: Math.max(0, count) }).map((_, i) => {
        const seed = duration * 13 + intensity * 7 + magnitude * 11 + soil * 5 + wind * 3 + i * 17;
        const left = 10 + rnd(seed) * 80;
        const top = 10 + rnd(seed + 1) * 80;
        const base = type === "high" ? 80 : type === "medium" ? 60 : type === "low" ? 40 : 70;
        const size = base + rnd(seed + 2) * (type === "high" ? 40 : type === "medium" ? 30 : type === "low" ? 20 : 30);

        // Slight per-zone variation of inputs to diversify reasons
        const r = Math.max(0, intensity + (rnd(seed + 3) - 0.5) * 20);
        const m = Math.max(0, magnitude + (rnd(seed + 4) - 0.5) * 0.6);
        const s = Math.min(100, Math.max(0, soil + (rnd(seed + 5) - 0.5) * 20));
        const wv = Math.max(0, wind + (rnd(seed + 6) - 0.5) * 20);
        const reason = reasonFor(type, r, m, s, wv);

        return { id: `${type}-${i}`, type, left, top, size, reason } satisfies Zone;
      });

    // Counts incorporate multiple stressors
    const high = Math.floor(intensity / 15 + magnitude * 1.6 + soil / 22 + wind / 45 + duration / 12);
    const med = Math.floor(intensity / 10 + magnitude * 1.1 + soil / 18 + wind / 35 + duration / 10);
    const low = Math.floor(intensity / 8 + magnitude * 0.8 + soil / 15 + wind / 30 + duration / 8);
    const safe = Math.max(2, 8 - Math.floor(duration / 24 + intensity / 60 + magnitude / 3));

    return [...create(high, "high"), ...create(med, "medium"), ...create(low, "low"), ...create(safe, "safe")];
  }, [duration, intensity, magnitude, soil, wind]);

  const run = () => {
    const highRisk = Math.max(0, Math.min(50, Math.floor(intensity / 10 + magnitude * 2.2 + soil / 25 + wind / 50 + duration / 8)));
    const evacTime = Math.max(3, Math.floor(35 - intensity / 5 - magnitude * 2.8 - soil / 40));
    const probability = Math.min(98, Math.floor(duration / 1.6 + intensity / 3.5 + magnitude * 9 + soil / 4 + wind / 6));
    const driver = dominantDriver(intensity, magnitude, soil, wind);
    const confidence = Math.min(95, 55 + Math.round((intensity / 2 + magnitude * 6 + soil / 2 + wind / 3) / 4));

    setResults({ high: highRisk, evac: evacTime, prob: probability, confidence, driver });
    setLastSim(new Date().toLocaleString());
    toast.success(`Simulation completed. Dominant driver: ${driver}.`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Simulated Risk Map</h2>
            <p className="text-sm text-foreground/60">Last simulation: <span>{lastSim}</span></p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm">
            <LegendDot className="bg-red-500" label="High Risk" />
            <LegendDot className="bg-yellow-500" label="Medium Risk" />
            <LegendDot className="bg-green-500" label="Low Risk" />
            <LegendDot className="bg-blue-500" label="Safe Zone" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="w-full bg-black rounded-lg overflow-hidden relative group h-96">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCSmjf0MNdEB702n2RRpGz-dPm3SW_PgAv0_OsFIMFpL9Nqt_LfgshLN9GUrldZ3vqDH8C4UBd_rmt-hbWsDI4Kduo8N80ilCvxdx3Bk8JeGHHVN2yBrEUGzowp65wUQhKps7nI_aRZQJ4f7cX0anwZj8ZYNkWxd2Y7Piv9W_UlngXmbvWr1N5wxSpM8eraM6RYc9wvFFDapH3fnXPQtrhf33vnfhpQFuuA5RnFg_0OogQtYTZeJKgG7hLfFXQs_mGLe35QX9vJlY"
                alt="Mine terrain risk map"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {zones.map((z) => (
                <div
                  key={z.id}
                  className={
                    "risk-zone absolute rounded-full opacity-70 border-2" +
                    (z.type === "high"
                      ? " bg-[radial-gradient(circle,rgba(239,68,68,0.7)_0%,rgba(239,68,68,0)_70%)] border-red-500/80"
                      : z.type === "medium"
                      ? " bg-[radial-gradient(circle,rgba(234,179,8,0.7)_0%,rgba(234,179,8,0)_70%)] border-yellow-500/80"
                      : z.type === "low"
                      ? " bg-[radial-gradient(circle,rgba(34,197,94,0.5)_0%,rgba(34,197,94,0)_70%)] border-green-500/60"
                      : " bg-[radial-gradient(circle,rgba(59,130,246,0.5)_0%,rgba(59,130,246,0)_70%)] border-blue-400/80 border-dashed")
                  }
                  style={{ left: `${z.left}%`, top: `${z.top}%`, width: z.size, height: z.size }}
                  title={z.type === "safe" ? "Safe zone" : `Reason: ${z.reason}`}
                />
              ))}

              <div className="absolute top-1/4 left-1/4 w-3.5 h-3.5 bg-red-500 rounded-full" title="Sector 7G (High)" />
              <div className="absolute top-1/2 left-2/3 w-3.5 h-3.5 bg-yellow-500 rounded-full" title="Sector 4B (Medium)" />
              <div className="absolute top-2/3 left-1/3 w-3.5 h-3.5 bg-green-500 rounded-full" title="Sector 2A (Low)" />
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-3">Dynamic Hazard Timeline</h3>
              <div className="flex items-center gap-6 bg-secondary p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <button
                    onClick={run}
                    className="flex size-10 items-center justify-center rounded-full bg-[#2A3C31] text-white hover:bg-primary hover:text-black transition-colors"
                    aria-label="Play"
                  >
                    <span className="material-symbols-outlined">play_arrow</span>
                  </button>
                  <p className="text-lg font-medium">Forecast:&nbsp;
                    <span className="font-bold text-primary">{new Date().toISOString().split("T")[0]}</span>
                  </p>
                </div>
                <div className="flex-1 flex items-center gap-4 text-foreground/50 text-sm">
                  <span>Past</span>
                  <div className="relative w-full h-2 rounded-full bg-[#2A3C31]">
                    <div className="absolute h-2 w-[75%] rounded-full bg-gradient-to-r from-primary/40 to-primary" />
                    <div className="absolute left-[75%] -translate-x-1/2 -top-1 h-4 w-4 rounded-full bg-white ring-4 ring-primary" />
                  </div>
                  <span>Future</span>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-sm text-foreground/60">
                <span>-3M</span>
                <span>-1M</span>
                <span className="bg-primary text-black rounded-full px-3 py-0.5 font-bold">Now</span>
                <span>+1M</span>
                <span>+3M</span>
                <span>+1Y</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-secondary p-6 rounded-xl border border-border">
              <h2 className="text-2xl font-bold mb-1">Climate Scenario Simulation</h2>
              <p className="text-foreground/60 text-sm mb-6">Define hypothetical extreme weather events to visualize potential vulnerabilities.</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-4">Rainfall Event</h3>
                  <div className="space-y-4">
                    <Range
                      id="duration"
                      label="Duration (hours)"
                      value={duration}
                      min={1}
                      max={72}
                      step={1}
                      onChange={setDuration}
                    />
                    <Range
                      id="intensity"
                      label="Intensity (mm/hr)"
                      value={intensity}
                      min={1}
                      max={200}
                      step={1}
                      onChange={setIntensity}
                    />
                    <Range
                      id="soil"
                      label="Soil Saturation (%)"
                      value={soil}
                      min={0}
                      max={100}
                      step={1}
                      onChange={setSoil}
                    />
                  </div>
                </div>

                <div className="border-t border-border my-6" />

                <div>
                  <h3 className="text-lg font-bold mb-4">Seismic & Wind</h3>
                  <Range
                    id="magnitude"
                    label="Magnitude (Richter scale)"
                    value={magnitude}
                    min={1}
                    max={9}
                    step={0.1}
                    onChange={setMagnitude}
                  />
                  <Range
                    id="wind"
                    label="Wind Gusts (km/h)"
                    value={wind}
                    min={0}
                    max={120}
                    step={1}
                    onChange={setWind}
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={run}
                  className="w-full flex items-center justify-center gap-2 rounded-full h-12 px-6 bg-primary text-black text-base font-bold hover:opacity-90 transition-colors"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <span>Run Simulation</span>
                </button>
              </div>
            </div>

            <div className="mt-6 bg-secondary p-6 rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-4">Simulation Results</h3>
              {results ? (
                <div className="space-y-3">
                  <Row label="Predicted High Risk Areas:" value={<span className="font-bold text-red-400">{results.high}</span>} />
                  <Row label="Estimated Evacuation Time:" value={<span className="font-bold text-yellow-400">{results.evac} min</span>} />
                  <Row label="Probability of Incident:" value={<span className="font-bold text-purple-400">{results.prob}%</span>} />
                  <Row label="Forecast Confidence:" value={<span className="font-bold text-blue-400">{results.confidence}%</span>} />
                  <Row label="Dominant Driver:" value={<span className="font-bold text-foreground">{results.driver}</span>} />
                </div>
              ) : (
                <p className="text-foreground/60 text-sm text-center">Run simulation to see results</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${className}`} />
      <span>{label}</span>
    </div>
  );
}

function Range({ id, label, value, min, max, step, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground/70 mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
        />
        <span className="text-sm font-semibold w-16 text-right">{value}</span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      {value}
    </div>
  );
}
