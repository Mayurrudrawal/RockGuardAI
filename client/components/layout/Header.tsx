import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useI18n } from "@/i18n/LanguageProvider";

const navItems = [
  { to: "/", label: "dashboard" },
  { to: "/risk-map", label: "riskMap" },
  { to: "/explainable-ai", label: "explainableAI" },
  { to: "/incidents", label: "incidents" },
  { to: "/maintenance", label: "maintenance" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0)"><path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"/></g>
            <defs><clipPath id="clip0"><rect fill="white" height="48" width="48"></rect></clipPath></defs>
          </svg>
          <span className="text-xl font-bold">RockGuard AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-foreground" : "text-foreground/60 hover:text-foreground"
                }`
              }
              end={item.to === "/"}
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <select
            aria-label="Language"
            onChange={(e) => setLocale(e.target.value as any)}
            className="hidden md:block bg-transparent border border-border rounded-md px-2 py-1 text-sm text-foreground/80 focus:outline-none"
            value={locale}
          >
            <option className="bg-background" value="en">EN</option>
            <option className="bg-background" value="hi">HI</option>
          </select>
          <button
            className="md:hidden p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-white/5"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div
            className="w-9 h-9 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD3gMKJlfu0925u3oszvJ8omEE_tTuKQsjCIpkg91_sEaTqrIJgZhviQnbthdTricN9GfLdkcoWR7M_BcFzJbg0t8n6bfU8YhDA4v005Efsx6GEXsqiCcUQwdMfVHDduWHMsxjoXjT7Emcw1U9aN3vXrQ-fi6MLo56DQlq2fxzanxgwT-pHsiu_ga_Tjy69-M_LvaOL70tTdBDgDpO3L65I48TVTlaJSBq4Bm3NDIJi4L3zcujuIJCZJQ1Hm22bes1kg6OZB5Fflsw")',
            }}
          />
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2 text-base font-medium ${
                    isActive ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                  }`
                }
                onClick={() => setOpen(false)}
                end={item.to === "/"}
              >
                {t(item.label)}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
