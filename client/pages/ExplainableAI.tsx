import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

export default function ExplainableAI() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-1">
            <div className="mb-8">
              <h2 className="text-4xl font-bold tracking-tight mb-2">Explainable AI & Action Recommendations</h2>
              <p className="text-foreground/60 text-lg">Detailed breakdown of risk factors and recommended actions for <span className="text-primary font-semibold">Sector 7G</span>.</p>
            </div>

            <div className="bg-red-900/30 border border-red-500/70 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="material-symbols-outlined text-red-400 text-4xl">warning</span>
                <h3 className="text-2xl font-bold">Evacuation Guidance</h3>
              </div>
              <ol className="space-y-3 list-decimal list-inside">
                <li>
                  <p className="font-semibold">Immediate Evacuation from Sector 7G</p>
                  <p className="text-foreground/70">Proceed calmly and quickly to the nearest designated escape route.</p>
                </li>
                <li>
                  <p className="font-semibold">Follow Primary Escape Route</p>
                  <p className="text-foreground/70">Use the southern ramp, marked in blue on the map. Avoid northern shafts.</p>
                </li>
                <li>
                  <p className="font-semibold">Shelter and Rally Points</p>
                  <p className="text-foreground/70">Check map for designated safe zones and high-risk areas.</p>
                </li>
              </ol>
            </div>

            <div className="bg-[#121212] rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-6">Contributing Factors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Factor color="red" icon="dangerous" title="Seismic Activity" level="High" note="Recent tremors detected" />
                <Factor color="yellow" icon="water_drop" title="Water Saturation" level="Moderate" note="Increased pore pressure" />
                <Factor color="green" icon="landscape" title="Geological Composition" level="Stable" note="Competent rock mass" />
              </div>
            </div>

            <div className="bg-[#121212] rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6">Recommended Safety Measures</h3>
              <div className="space-y-3">
                <Check label="Increase monitoring frequency in Sector 7G" badge={{ text: "High Priority", color: "red" }} defaultChecked />
                <Check label="Review and reinforce ground support" badge={{ text: "Medium Priority", color: "yellow" }} />
                <Check label="Conduct scheduled geological survey" badge={{ text: "Low Priority", color: "green" }} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#121212] rounded-2xl p-4 sticky top-8">
              <div className="relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAn09qxrs1BcVU7oRjeCFmQiwRAni8JpK0eIw5Mc1pRWphASeah8TAS3qaUP3lffcY3hO4Ylxrf5SL9_8LtvwflpjFxqeftaCKx9olv7v0jAbfa3pJl8WUfpHqu7J6t1XRUzDeTSWHmpzZZMr_C7TQ6klaAuz9oK3ZWo6y1NHWUI3MxffuWbiXetxY-5UEamAR1bi3lssMUXpClMfbjvBynAi1d2dlDgio4J2q9435_qjt0MY6cIKVsr8Zy46VWlhGSFDQ7h4sIro"
                  alt="Evacuation routes"
                  className="w-full h-auto rounded-xl object-cover"
                />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 667">
                  <defs>
                    <radialGradient id="red-grad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(239,68,68,0.7)" />
                      <stop offset="100%" stopColor="rgba(239,68,68,0)" />
                    </radialGradient>
                    <marker id="arrow-blue" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                      <polygon fill="#60a5fa" points="0 0, 10 3.5, 0 7" />
                    </marker>
                  </defs>
                  <ellipse cx="450" cy="350" rx="120" ry="80" fill="url(#red-grad)" transform="rotate(-15,450,350)" />
                  <text x="450" y="350" textAnchor="middle" alignmentBaseline="middle" fill="white" fontSize="24" fontWeight="bold">Sector 7G</text>
                  <path d="M 465 375 C 470 420, 520 440, 580 445 C 640 450, 700 480, 750 550" stroke="#60a5fa" strokeWidth="8" fill="none" strokeDasharray="15 10" markerEnd="url(#arrow-blue)" />
                </svg>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 p-2 bg-black/20 rounded-lg">
                <Legend color="bg-red-500" label="High Risk Zone" />
                <Legend dashed color="border-blue-400" label="Evacuation Route" />
                <Legend color="bg-blue-500" label="Safe Zone" />
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <button onClick={() => toast.success("Evacuation alert acknowledged. Safety protocols activated.")} className="w-full bg-primary text-black font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">task_alt</span>
                  Acknowledge Evacuation Alert
                </button>
                <button onClick={() => toast.message("Alert shared with all relevant personnel.")} className="w-full bg-[#264532] text-white font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">share</span>
                  Share Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {dashed ? (
        <div className={`w-4 h-4 border-2 ${color} border-dashed`} />
      ) : (
        <div className={`w-4 h-4 rounded-full ${color}`} />
      )}
      <span className="text-sm text-foreground/80">{label}</span>
    </div>
  );
}

function Factor({ color, icon, title, level, note }: { color: "red" | "yellow" | "green"; icon: string; title: string; level: string; note: string }) {
  const border = color === "red" ? "border-red-500/50" : color === "yellow" ? "border-yellow-500/50" : "border-green-500/50";
  const text = color === "red" ? "text-red-300" : color === "yellow" ? "text-yellow-300" : "text-green-300";
  return (
    <div className={`bg-black/20 p-4 rounded-lg border ${border}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`material-symbols-outlined ${text}`}>{icon}</span>
        <h4 className={`${text} font-medium`}>{title}</h4>
      </div>
      <p className="text-white text-2xl font-bold">{level}</p>
      <p className="text-white/60 text-sm">{note}</p>
    </div>
  );
}

function Check({ label, badge, defaultChecked }: { label: string; badge: { text: string; color: "red" | "yellow" | "green" }; defaultChecked?: boolean }) {
  const badgeClass = badge.color === "red" ? "bg-red-500/20 text-red-400" : badge.color === "yellow" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400";
  return (
    <label className="flex items-center gap-4 p-4 rounded-lg bg-black/20 border border-[#264532] hover:border-primary transition-colors cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="h-6 w-6 rounded-md border-[#366348] border-2 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary focus:outline-none" />
      <span className="font-medium">{label}</span>
      <span className={`ml-auto text-xs px-2 py-1 rounded-full ${badgeClass}`}>{badge.text}</span>
    </label>
  );
}
