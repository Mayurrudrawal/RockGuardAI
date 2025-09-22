import Layout from "@/components/layout/Layout";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const reports = [
  { id: 12345, date: "2024-03-15", title: "Incident Report #12345" },
  { id: 12344, date: "2024-03-10", title: "Incident Report #12344" },
  { id: 12343, date: "2024-03-05", title: "Incident Report #12343" },
];

export default function Incidents() {
  const perfRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!perfRef.current) return;
    const c = new Chart(perfRef.current, {
      type: "line",
      data: {
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
        datasets: [
          {
            label: "Performance %",
            data: [92, 88, 85, 90, 87, 83, 80],
            borderColor: "#38e07b",
            backgroundColor: "rgba(56, 224, 123, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: false,
            min: 75,
            max: 100,
            grid: { color: "rgba(255,255,255,0.1)" },
            ticks: { color: "#e5e7eb" },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#e5e7eb" },
          },
        },
      },
    });
    return () => c.destroy();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          <aside className="flex flex-col border-r border-border bg-black rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Reports</h2>
            <div className="relative mb-4">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">search</span>
              <input className="form-input w-full rounded-full border border-transparent bg-[#1f2937] px-10 py-3 text-white placeholder:text-gray-400 focus:border-primary focus:ring-0" placeholder="Search reports" />
            </div>
            <nav className="flex-1 overflow-y-auto">
              {reports.map((r, i) => (
                <a key={r.id} className={`report-item flex items-center gap-4 px-6 py-4 justify-between hover:bg-[#1f2937] border-l-4 ${i === 0 ? "bg-[#1f2937] border-primary" : "border-transparent"}`} href="#">
                  <div className="flex flex-col justify-center">
                    <p className="text-base font-medium line-clamp-1">{r.title}</p>
                    <p className="text-foreground/60 text-sm">{r.date}</p>
                  </div>
                  <span className="material-symbols-outlined text-foreground/60">chevron_right</span>
                </a>
              ))}
            </nav>
          </aside>

          <section className="p-8 overflow-y-auto bg-black rounded-lg">
            <header className="mb-8">
              <h1 className="tracking-light text-4xl font-bold leading-tight mb-1">Incident Report #12345</h1>
              <p className="text-foreground/70">Generated on 2024-03-15</p>
            </header>

            <div className="bg-[#1f2937] rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Incident Summary</h3>
              <div className="grid grid-cols-[150px_1fr] gap-x-6 gap-y-3 text-sm">
                <span className="text-foreground/60">Date</span><span>2024-03-15</span>
                <span className="text-foreground/60">Time</span><span>14:30</span>
                <span className="text-foreground/60">Location</span><span>Section 7, Level 3</span>
                <span className="text-foreground/60">Incident Type</span><span>Equipment Malfunction</span>
                <span className="text-foreground/60">Severity</span><span>Moderate</span>
                <span className="text-foreground/60">Description</span><span>Malfunction of conveyor belt system, causing a temporary halt in operations. No injuries reported.</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">AI Prediction vs. Actual Outcome</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1f2937] rounded-2xl p-6">
                  <h4 className="text-lg font-medium mb-2">Conveyor Belt System Performance</h4>
                  <p className="text-5xl font-bold">85%</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-foreground/60 text-sm">Last 7 Days</p>
                    <div className="flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined text-base">trending_up</span>
                      <p className="text-sm font-medium">+5%</p>
                    </div>
                  </div>
                  <div className="mt-6 h-[150px]">
                    <canvas ref={perfRef} />
                  </div>
                </div>
                <div className="bg-[#1f2937] rounded-2xl p-6 flex items-center">
                  <p className="text-foreground/80 leading-relaxed">
                    The AI predicted a potential malfunction with the conveyor belt system within the next 24 hours based on performance data from the previous week. The actual malfunction occurred at 14:30 on 2024-03-15, aligning with the predicted timeframe.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Recommendations</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-x-4 p-4 bg-[#1f2937] rounded-lg cursor-pointer hover:bg-[#374151]">
                  <input type="checkbox" className="h-6 w-6 rounded-md border-[#4b5563] bg-transparent text-primary checked:bg-primary checked:border-transparent focus:ring-1 focus:ring-offset-0" />
                  <span>Conduct a thorough inspection of the conveyor belt system.</span>
                </label>
                <label className="flex items-center gap-x-4 p-4 bg-[#1f2937] rounded-lg cursor-pointer hover:bg-[#374151]">
                  <input type="checkbox" className="h-6 w-6 rounded-md border-[#4b5563] bg-transparent text-primary checked:bg-primary checked:border-transparent focus:ring-1 focus:ring-offset-0" />
                  <span>Implement a preventative maintenance schedule based on AI predictions.</span>
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
