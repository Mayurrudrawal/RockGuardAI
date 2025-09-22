import Layout from "@/components/layout/Layout";
import { useEffect, useMemo, useState } from "react";

interface Task {
  id: string;
  title: string;
  due: string; // e.g., 2024-08-15
  status: "Pending" | "Scheduled" | "In Progress";
  badge: "accent-sky" | "accent-purple" | "gray";
}

const seedTasks: Task[] = [
  { id: "1", title: "Slope stabilization in Sector 4", due: "2024-08-15", status: "In Progress", badge: "accent-sky" },
  { id: "2", title: "Equipment safety checks", due: "2024-08-20", status: "Scheduled", badge: "accent-purple" },
  { id: "3", title: "Update emergency response plan", due: "2024-08-25", status: "Pending", badge: "gray" },
];

export default function Maintenance() {
  const [tasks] = useState<Task[]>(seedTasks);
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth());
  const [year, setYear] = useState<number>(today.getFullYear());
  const [selected, setSelected] = useState<Task | null>(null);

  const monthName = useMemo(() => new Date(year, month).toLocaleString(undefined, { month: "long", year: "numeric" }), [month, year]);

  const grid = useMemo(() => buildCalendar(month, year), [month, year]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Predictive Maintenance Scheduler</h2>
            <p className="text-foreground/60 mt-1">Schedule, assign, and track maintenance tasks proactively.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-full bg-[hsl(var(--accent-sky))] px-5 py-2.5 text-sm font-semibold text-black hover:opacity-90">
              <span className="material-symbols-outlined text-base">add</span>
              Create Work Order
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card border border-card rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button
                    className="p-2 rounded-full hover:bg-gray-800"
                    onClick={() =>
                      setMonth((m) => {
                        if (m === 0) {
                          setYear((y) => y - 1);
                          return 11;
                        }
                        return m - 1;
                      })
                    }
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <h3 className="text-xl font-semibold">{monthName}</h3>
                  <button
                    className="p-2 rounded-full hover:bg-gray-800"
                    onClick={() =>
                      setMonth((m) => {
                        if (m === 11) {
                          setYear((y) => y + 1);
                          return 0;
                        }
                        return m + 1;
                      })
                    }
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-gray-700 p-1 text-sm">
                  <button className="px-3 py-1 rounded-full text-gray-300 hover:bg-gray-800">Month</button>
                  <button className="px-3 py-1 rounded-full bg-gray-700 text-white">Week</button>
                  <button className="px-3 py-1 rounded-full text-gray-300 hover:bg-gray-800">Day</button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-sm text-gray-400 border-t border-b border-card">
                {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
                  <div key={d} className="py-4">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 grid-rows-6 gap-px" id="calendar">
                {grid.map((cell, idx) => {
                  const isToday = cell.date.toDateString() === new Date().toDateString();
                  const dayTasks = tasks.filter((t) => sameDay(cell.date, new Date(t.due)));
                  return (
                    <div key={idx} className={`p-2 h-28 border-r border-b border-card ${cell.inMonth ? "text-white" : "text-gray-500"} ${isToday ? "bg-primary text-black font-bold" : ""}`}>
                      {cell.date.getDate()}
                      <div className="space-y-1 mt-1">
                        {dayTasks.map((t) => (
                          <div key={t.id} className={`text-xs rounded px-1 py-0.5 cursor-pointer ${badgeClass(t.badge)}`} onClick={() => setSelected(t)}>
                            {t.title.length > 16 ? t.title.slice(0, 16) + "…" : t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-card rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Upcoming Tasks</h3>
              <div className="space-y-4">
                {tasks.map((t) => (
                  <div key={t.id} className={`bg-[#191919] p-4 rounded-lg border-l-4 ${sideBarBorder(t.badge)} cursor-pointer`} onClick={() => setSelected(t)}>
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-foreground/60 mt-1">Due: {new Date(t.due).toDateString()}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusPill(t.status)}`}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-card rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Task Details</h3>
              {selected ? (
                <div className="space-y-3">
                  <h4 className="font-semibold">{selected.title}</h4>
                  <p className="text-sm text-foreground/60">Due: {new Date(selected.due).toDateString()}</p>
                  <p className="text-sm">Stabilization work required on the northern slope following recent seismic activity.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">Status:</span>
                    <span className="text-sm font-semibold">{selected.status}</span>
                  </div>
                  <button className="w-full bg-primary text-black font-bold py-2 px-4 rounded-full">Update Status</button>
                </div>
              ) : (
                <p className="text-foreground/60 text-sm text-center">Select a task to view details</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function buildCalendar(month: number, year: number) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  const day = (first.getDay() + 6) % 7; // Monday first
  start.setDate(first.getDate() - day);
  const cells = [] as { date: Date; inMonth: boolean }[];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function badgeClass(b: Task["badge"]) {
  if (b === "accent-sky") return "text-[hsl(var(--accent-sky))] bg-sky-900/50";
  if (b === "accent-purple") return "text-[hsl(var(--accent-purple))] bg-purple-900/50";
  return "text-gray-400 bg-gray-700/40";
}

function sideBarBorder(b: Task["badge"]) {
  if (b === "accent-sky") return "border-[hsl(var(--accent-sky))]";
  if (b === "accent-purple") return "border-[hsl(var(--accent-purple))]";
  return "border-gray-500";
}

function statusPill(s: Task["status"]) {
  if (s === "In Progress") return "bg-yellow-500/20 text-yellow-400";
  if (s === "Scheduled") return "bg-blue-500/20 text-blue-400";
  return "bg-gray-500/20 text-gray-400";
}
