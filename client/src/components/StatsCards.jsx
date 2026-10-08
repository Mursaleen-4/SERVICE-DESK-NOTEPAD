import React from 'react';
import { PhoneCall, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

export default function StatsCards({ stats, onFilterStatus }) {
  const cards = [
    {
      id: 'total',
      label: "Today's Calls",
      value: stats?.today ?? 0,
      subtext: `${stats?.total ?? 0} total calls in Atlas`,
      icon: PhoneCall,
      accentColor: 'text-sky-400',
      badgeBg: 'bg-sky-950/60',
      badgeBorder: 'border-sky-800/60',
      onClick: () => onFilterStatus('All'),
    },
    {
      id: 'active',
      label: 'Open / In-Progress',
      value: stats?.active ?? 0,
      subtext: 'Awaiting resolution',
      icon: AlertTriangle,
      accentColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/60',
      badgeBorder: 'border-amber-800/60',
      onClick: () => onFilterStatus('Open'),
    },
    {
      id: 'resolved',
      label: 'Resolved Calls',
      value: stats?.resolved ?? 0,
      subtext: 'Successfully closed',
      icon: CheckCircle,
      accentColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/60',
      badgeBorder: 'border-emerald-800/60',
      onClick: () => onFilterStatus('Resolved'),
    },
    {
      id: 'urgent',
      label: 'Urgent Incidents',
      value: stats?.urgent ?? 0,
      subtext: 'Critical priority items',
      icon: Flame,
      accentColor: 'text-rose-400',
      badgeBg: 'bg-rose-950/60',
      badgeBorder: 'border-rose-800/60',
      onClick: () => onFilterStatus('Urgent'),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className="group p-4 rounded-lg bg-[#0d1117]/85 backdrop-blur-md border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  {card.label}
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-2xl lg:text-3xl font-bold font-mono ${card.accentColor}`}>
                    {card.value}
                  </span>
                </div>
              </div>
              <div
                className={`w-9 h-9 rounded-md ${card.badgeBg} border ${card.badgeBorder} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${card.accentColor}`} />
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-medium">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
