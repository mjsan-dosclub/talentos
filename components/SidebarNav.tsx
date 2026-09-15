"use client";

import { useState } from "react";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  badge?: string;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

interface SidebarNavProps {
  groups: SidebarGroup[];
  activeId: string;
  onSelect?: (id: string) => void;
  baseHref?: string;
}

export default function SidebarNav({ groups, activeId, onSelect, baseHref }: SidebarNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id: string) => {
    onSelect?.(id);
    setMobileOpen(false); // close drawer on mobile after selecting
  };

  const SidebarContent = () => (
    <div className="flex flex-col gap-6 flex-1">
      {groups.map((group, idx) => (
        <div key={idx} className="flex flex-col gap-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            {group.title}
          </div>

          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = activeId === item.id;
              const content = (
                <div
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon && (
                      <span className="text-slate-400 shrink-0">{item.icon}</span>
                    )}
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}

                  {item.count !== undefined && (
                    <span className="text-[11px] font-semibold text-slate-400 font-mono">
                      {item.count}
                    </span>
                  )}
                </div>
              );

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className="w-full text-left"
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ── Mobile hamburger button (visible only on < md) ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-20 left-4 z-40 bg-slate-900 text-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border border-slate-700"
        aria-label="Open navigation"
      >
        {/* Three-bar hamburger icon */}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile slide-in drawer ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between p-4 pt-14 transition-transform duration-300 ease-in-out shadow-2xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Close navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <SidebarContent />

        {/* Bottom status card */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-500 flex flex-col gap-1 mt-4">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            DOS TalentOS Enterprise
          </div>
          <div>Batch 3 Engineering Roster</div>
          <div className="text-[10px] text-slate-400 font-mono">v1.2 • Verified Audits</div>
        </div>
      </aside>

      {/* ── Desktop permanent sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex w-56 lg:w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] flex-col justify-between p-4">
        <SidebarContent />

        {/* Bottom status card */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-500 flex flex-col gap-1">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            DOS TalentOS Enterprise
          </div>
          <div>Batch 3 Engineering Roster</div>
          <div className="text-[10px] text-slate-400 font-mono">v1.2 • Verified Audits</div>
        </div>
      </aside>
    </>
  );
}


