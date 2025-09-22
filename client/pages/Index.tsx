import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
import Chart from "chart.js/auto";
import { useI18n } from "@/i18n/LanguageProvider";
import { NavLink } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type RiskLevel = "high" | "moderate" | "low";

interface Area {
  id: string;
  name: string;
  risk: RiskLevel;
  score: number; // 0-100
  reason: string;
}

export default function Index() {
  const { t } = useI18n();

  const [areas, setAreas] = useState<Area[]>([]);
  const [openDialog, setOpenDialog] = useState<null | RiskLevel | "systems">(null);

  const trendRef = useRef<HTMLCanvasElement | null>(null);
  const trendChart = useRef<Chart | null>(null);

  const counts = useMemo(() => {
    const high = areas.filter((a) => a.risk === "high").length;
    const moderate = areas.filter((a) => a.risk === "moderate").length;
    const low = areas.filter((a) => a.risk === "low").length;
    return { high, moderate, low };
  }, [areas]);

  // Seeded random helper for stable yet time-varying data
  const seeded = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generate per-area risk from environmental metrics
  const generateAreas = (baseTime: Date) => {
    const epochHour = Math.floor(baseTime.getTime() / 3_600_000); // change hour-by-hour
    const newAreas: Area[] = [];

    // 36 sectors across the site
    for (let i = 1; i <= 36; i++) {
      const sector = `Sector ${Math.ceil(i / 6)}${String.fromCharCode(64 + ((i - 1) % 6) + 1)}`;
      const s1 = seeded(epochHour * 31 + i * 7);
      const s2 = seeded(epochHour * 17 + i * 13);
      const s3 = seeded(epochHour * 11 + i * 19);
      const s4 = seeded(epochHour * 23 + i * 29);
      const s5 = seeded(epochHour * 3 + i * 37);

      const slopeDeg = 15 + s1 * 35; // 15°–50°
      const soilSat = s2; // 0–1
      const rainfall = s3 * 160; // mm/hr
      const wind = s4 * 100; // km/h (scaled)
      const seismic = s5 * 8; // Richter

      const cRain = rainfall / 160; // 0–1
      const cSeis = seismic / 8;
      const cSlope = slopeDeg / 50;
      const cSoil = soilSat;
      const cWind = wind / 100;

      const wRain = 0.35;
      const wSeis = 0.25;
      const wSlope = 0.2;
      const wSoil = 0.15;
      const wWind = 0.05;

      const score01 = wRain * cRain + wSeis * cSeis + wSlope * cSlope + wSoil * cSoil + wWind * cWind;
      const score = Math.min(100, Math.round(score01 * 100));

      let risk: RiskLevel = "low";
      if (score >= 70) risk = "high";
      else if (score >= 40) risk = "moderate";

      // Dominant driver
      const drivers: { key: string; val: number }[] = [
        { key: "rainfall", val: wRain * cRain },
        { key: "seismic", val: wSeis * cSeis },
        { key: "slope", val: wSlope * cSlope },
        { key: "soil saturation", val: wSoil * cSoil },
        { key: "wind", val: wWind * cWind },
      ];
      drivers.sort((a, b) => b.val - a.val);
      const top = drivers[0].key;

      const reasonParts: string[] = [];
      if (top === "rainfall" || cRain > 0.6) reasonParts.push(`heavy rainfall ${rainfall.toFixed(0)} mm/hr`);
      if (top === "seismic" || cSeis > 0.5) reasonParts.push(`recent tremors M${seismic.toFixed(1)}`);
      if (top === "slope" || cSlope > 0.6) reasonParts.push(`steep slope ${slopeDeg.toFixed(0)}°`);
      if (top === "soil saturation" || cSoil > 0.65) reasonParts.push(`high soil saturation ${(soilSat * 100).toFixed(0)}%`);
      if (top === "wind" || cWind > 0.7) reasonParts.push(`strong winds ${wind.toFixed(0)} km/h`);

      const reason = reasonParts.slice(0, 2).join("; ") || "combined environmental factors";

      newAreas.push({ id: `area-${i}`, name: sector, risk, score, reason });
    }

    return newAreas;
  };

  // Risk index baseline for a given hour offset (negative=past, 0=now)
  const riskIndexAtHour = (base: Date, hourOffset: number) => {
    const time = new Date(base.getTime() + hourOffset * 3_600_000);
    const hod = time.getHours();
    const season = 0.15 * Math.sin(((hod + 3) / 24) * Math.PI * 2); // diurnal cycle
    const daySeed = Math.floor(time.getTime() / 3_600_000);
    const noise = (seeded(daySeed * 7) - 0.5) * 0.08; // mild noise
    const trend = 0.05 * Math.sin((time.getTime() / (24 * 3_600_000)) * Math.PI * 2); // slow oscillation
    const baseLevel = 0.45 + season + trend + noise; // 0–1 approx
    return Math.max(0.05, Math.min(0.95, baseLevel)) * 100;
  };

  // Build 24h past + 24h future series with split datasets
  const rebuildChart = (base: Date) => {
    const labels: string[] = [];
    const past: (number | null)[] = [];
    const future: (number | null)[] = [];

    // Past 24h
    for (let k = 24; k > 0; k--) {
      const t = new Date(base.getTime() - k * 3_600_000);
      labels.push(t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      past.push(Math.round(riskIndexAtHour(base, -k)));
      future.push(null);
    }

    // Now marker
    labels.push("Now");
    const nowVal = Math.round(riskIndexAtHour(base, 0));
    past.push(nowVal);
    future.push(null);

    // Forecast next 24h via AR(1) around seasonal mean
    let prev = nowVal;
    for (let h = 1; h <= 24; h++) {
      const t = new Date(base.getTime() + h * 3_600_000);
      labels.push(t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      const seasonal = riskIndexAtHour(base, h);
      const eps = (seeded(Math.floor(t.getTime() / 3_600_000) * 13) - 0.5) * 10; // +-5
      const next = 0.7 * prev + 0.3 * seasonal + eps;
      prev = Math.max(5, Math.min(95, next));
      past.push(null);
      future.push(Math.round(prev));
    }

    const ctx = trendRef.current;
    if (!ctx) return;

    trendChart.current?.destroy();
    trendChart.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Past 24h Risk Index",
            data: past,
            borderColor: "#60a5fa",
            backgroundColor: "rgba(96, 165, 250, 0.1)",
            spanGaps: true,
            tension: 0.35,
            fill: true,
          },
          {
            label: "Next 24h Forecast",
            data: future,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.12)",
            spanGaps: true,
            tension: 0.35,
            borderDash: [6, 4],
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { color: "#e5e7eb" } },
          tooltip: { mode: "index", intersect: false },
        },
        interaction: { mode: "index", intersect: false },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#e5e7eb" } },
          x: { grid: { color: "rgba(255,255,255,0.1)" }, ticks: { color: "#e5e7eb" } },
        },
      },
    });
  };

  // Initialize and refresh data periodically
  useEffect(() => {
    const now = new Date();
    setAreas(generateAreas(now));
    rebuildChart(now);

    const chartTimer = setInterval(() => {
      const t = new Date();
      rebuildChart(t);
    }, 60_000); // refresh every minute

    const areasTimer = setInterval(() => {
      setAreas(generateAreas(new Date()));
    }, 60_000);

    return () => {
      clearInterval(chartTimer);
      clearInterval(areasTimer);
      trendChart.current?.destroy();
    };
  }, []);

  return (
    <Layout>
      <section className="py-20 md:py-28 bg-gradient-to-b from-black via-black to-secondary">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            {t("heroTitle")} <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">{t("heroPredictive")}</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-foreground/60 max-w-3xl mx-auto">
            {t("heroSubtitle")}
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground/80">{t("predictPreventProtect")}</p>
          <div className="mt-8 flex justify-center items-center gap-4">
            <NavButton to="/risk-map" label={t("viewRiskMap")} />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard color="red" title="High Risk Areas" value={counts.high} icon="warning" onClick={() => setOpenDialog("high")} />
          <StatCard color="yellow" title="Moderate Risk" value={counts.moderate} icon="trending_up" onClick={() => setOpenDialog("moderate")} />
          <StatCard color="green" title="Low Risk" value={counts.low} icon="check_circle" onClick={() => setOpenDialog("low")} />
          <StatCard color="blue" title="Systems Online" value="24/24" icon="monitoring" onClick={() => setOpenDialog("systems")} />
        </div>
      </section>

      <section className="container mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold mb-6">Unique Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Feature icon="psychology" title="AI Risk Prediction" to="/risk-map" desc="Uses DEMs, sensors, and weather to predict rockfall risk." />
          <Feature icon="map" title="Risk Map" to="/risk-map" desc="Real-time visualization of risk zones with overlays." />
          <Feature icon="insights" title="Explainable AI + Alerts" to="/explainable-ai" desc="Clear reasons, evacuation guidance, and Live Alerts." />
          <Feature icon="build" title="Predictive Maintenance" to="/maintenance" desc="Auto-schedule tasks and sync with calendar." />
          <Feature icon="thunderstorm" title="Climate Simulator" to="/risk-map" desc="Simulate rainfall and seismic scenarios." />
          <Feature icon="signpost" title="Evacuation Guidance" to="/explainable-ai" desc="Routes and safe zones mapped visually." />
          <Feature icon="translate" title="Multilingual UI" to="/" desc="English and Hindi supported; extendable." />
          <Feature icon="timeline" title="Hazard Timeline" to="/risk-map" desc="Interactive timeline for past and future forecasts." />
        </div>
      </section>

      <div className="container mx-auto px-4 pb-12 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-secondary p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4">Recent Incidents</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg">
                <div>
                  <h4 className="font-semibold">Conveyor Belt Malfunction</h4>
                  <p className="text-sm text-foreground/60">Section 7, Level 3 • 2024-03-15</p>
                </div>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Resolved</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg">
                <div>
                  <h4 className="font-semibold">Increased Seismic Activity</h4>
                  <p className="text-sm text-foreground/60">Sector 4G • 2024-03-12</p>
                </div>
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Monitoring</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-2">24h Past + 24h Forecast</h3>
            <p className="text-sm text-foreground/60 mb-4">Live risk index based on conditions. Dashed line indicates forecast.</p>
            <div className="h-64">
              <canvas ref={trendRef} />
            </div>
          </div>
        </div>
      </div>

      <RiskDetailsDialog
        openKey={openDialog}
        onOpenChange={setOpenDialog}
        areas={areas}
      />
    </Layout>
  );
}

function Feature({ icon, title, desc, to }: { icon: string; title: string; desc: string; to: string }) {
  return (
    <NavLink to={to} className="group feature-card bg-[#161B22] border border-[#30363D] p-5 rounded-lg flex gap-4 items-start hover:-translate-y-0.5 transition-all">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-foreground/70">{desc}</p>
      </div>
      <span className="ml-auto material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
    </NavLink>
  );
}

function StatCard({ title, value, icon, color, onClick }: { title: string; value: number | string; icon: string; color: "red" | "yellow" | "green" | "blue"; onClick?: () => void }) {
  const colorClasses = useMemo(() => {
    const map = {
      red: { bg: "bg-red-500/10", text: "text-red-400" },
      yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
      green: { bg: "bg-green-500/10", text: "text-green-400" },
      blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
    } as const;
    return map[color];
  }, [color]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-[#161B22] border border-[#30363D] p-6 rounded-lg text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <div className={`${colorClasses.bg} ${colorClasses.text} rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h5 className="text-xl font-bold">{title}</h5>
      <p className={`text-3xl font-bold mt-2 ${colorClasses.text}`}>{value}</p>
    </button>
  );
}

function NavButton({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-3 rounded-lg text-lg"
    >
      {label}
    </NavLink>
  );
}

function RiskDetailsDialog({ openKey, onOpenChange, areas }: { openKey: null | RiskLevel | "systems"; onOpenChange: (k: null | RiskLevel | "systems") => void; areas: Area[] }) {
  const title = openKey === "high" ? "High Risk Areas"
    : openKey === "moderate" ? "Moderate Risk Areas"
    : openKey === "low" ? "Low Risk Areas"
    : openKey === "systems" ? "Systems Status"
    : "";

  const filtered = areas
    .filter((a) => (openKey === "high" && a.risk === "high") || (openKey === "moderate" && a.risk === "moderate") || (openKey === "low" && a.risk === "low"))
    .sort((a, b) => b.score - a.score);

  return (
    <Dialog open={openKey !== null} onOpenChange={(v) => onOpenChange(v ? openKey : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {openKey === "systems" ? (
            <DialogDescription>All critical monitoring systems, gateways, and sensors are online and reporting nominal status (24/24).</DialogDescription>
          ) : (
            <DialogDescription>Tap an item to view why this area is categorized under this risk level.</DialogDescription>
          )}
        </DialogHeader>
        {openKey === "systems" ? (
          <div className="mt-2 space-y-2">
            <SystemRow label="Edge Gateways" value="8/8 online" status="ok" />
            <SystemRow label="Weather Stations" value="5/5 online" status="ok" />
            <SystemRow label="Seismic Sensors" value="6/6 online" status="ok" />
            <SystemRow label="CCTV & Lidar" value="5/5 online" status="ok" />
          </div>
        ) : (
          <div className="mt-3 max-h-[60vh] overflow-auto divide-y divide-border rounded-md border border-border">
            {filtered.length === 0 ? (
              <div className="p-4 text-sm text-foreground/60">No areas in this category right now.</div>
            ) : (
              filtered.map((a) => (
                <div key={a.id} className="p-4 flex items-start gap-3 hover:bg-white/5">
                  <span className={
                    "material-symbols-outlined mt-0.5 " +
                    (a.risk === "high" ? "text-red-400" : a.risk === "moderate" ? "text-yellow-400" : "text-green-400")
                  }>
                    location_on
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{a.name}</p>
                      <span className={
                        "text-xs px-2 py-0.5 rounded-full " +
                        (a.risk === "high"
                          ? "bg-red-500/20 text-red-300 border border-red-500/40"
                          : a.risk === "moderate"
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                          : "bg-green-500/20 text-green-300 border border-green-500/40")
                      }>
                        {a.risk.toUpperCase()} • {a.score}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/70 mt-1">Reason: {a.reason}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SystemRow({ label, value, status }: { label: string; value: string; status: "ok" | "warn" | "down" }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md border border-border">
      <div className="flex items-center gap-2">
        <span className={
          "w-2.5 h-2.5 rounded-full " +
          (status === "ok" ? "bg-green-500" : status === "warn" ? "bg-yellow-500" : "bg-red-500")
        }/>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm text-foreground/70">{value}</span>
    </div>
  );
}
