"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
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
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-4">
      <div className="flex flex-col gap-6">
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
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-slate-100 text-slate-900 font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
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

                if (baseHref) {
                  return (
                    <Link
                      key={item.id}
                      href={`${baseHref}?tab=${item.id}`}
                      onClick={() => onSelect && onSelect(item.id)}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect && onSelect(item.id)}
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

      {/* Bottom Info Card */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          DOS TalentOS Enterprise
        </div>
        <div>Batch 3 Engineering Roster</div>
        <div className="text-[10px] text-slate-400 font-mono">v1.2 • Verified Audits</div>
      </div>
    </aside>
  );
}
