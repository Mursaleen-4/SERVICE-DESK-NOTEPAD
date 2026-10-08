import React, { useState } from 'react';
import {
  Search,
  Filter,
  Copy,
  Check,
  Edit2,
  Trash2,
  Eye,
  PhoneCall,
  Clock,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

export default function CallTable({
  records,
  loading,
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter,
  departmentsList,
  onEditRecord,
  onDeleteRecord,
  onToggleStatus,
  onViewDetails,
  onGenerateSamples
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyExchange = (id, exchangeNumber) => {
    navigator.clipboard.writeText(exchangeNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return {
          bg: 'bg-emerald-950/70',
          border: 'border-emerald-700/80',
          text: 'text-emerald-300',
          dot: 'bg-emerald-400'
        };
      case 'In Progress':
        return {
          bg: 'bg-amber-950/70',
          border: 'border-amber-700/80',
          text: 'text-amber-300',
          dot: 'bg-amber-400'
        };
      case 'Escalated':
        return {
          bg: 'bg-rose-950/70',
          border: 'border-rose-700/80',
          text: 'text-rose-300',
          dot: 'bg-rose-400'
        };
      default: // Open
        return {
          bg: 'bg-sky-950/70',
          border: 'border-sky-700/80',
          text: 'text-sky-300',
          dot: 'bg-sky-400'
        };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'High':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'Low':
        return 'bg-zinc-800 text-slate-400 border-zinc-700';
      default:
        return 'bg-sky-950/80 text-sky-300 border-sky-800';
    }
  };

  return (
    <div className="w-full rounded-xl bg-[#0b0e14]/90 backdrop-blur-md border border-zinc-800/90 shadow-xl overflow-hidden flex flex-col">
      {/* Control Toolbar */}
      <div className="p-4 border-b border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-950/40">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by caller, exchange, dept, issue..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Dropdown Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-zinc-900">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d} value={d} className="bg-zinc-900">{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 text-xs">
            {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${statusFilter === st
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full min-h-[380px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-zinc-950/70 select-none">
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Exchange No.</th>
              <th className="py-3 px-4">Caller</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Issue Summary</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-xs">Synchronizing with MongoDB Atlas...</span>
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <div className="max-w-sm mx-auto flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-slate-500">
                      <PhoneCall className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">No Call Records Found</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {searchQuery || departmentFilter !== 'All' || statusFilter !== 'All'
                          ? 'No calls match the selected filters.'
                          : 'Your call log is currently empty. Click "+ LOG CALL" above to record a call.'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const badge = getStatusBadge(r.status);
                const priorityClass = getPriorityBadge(r.priority);

                return (
                  <tr
                    key={r._id}
                    className="hover:bg-zinc-900/60 transition-colors group text-slate-200"
                  >
                    {/* Time */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <span className="font-semibold">{r.time}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">{r.date}</span>
                    </td>

                    {/* Exchange Number */}
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-sky-300 text-xs font-semibold">
                        <span>{r.exchangeNumber}</span>
                        <button
                          onClick={() => handleCopyExchange(r._id, r.exchangeNumber)}
                          title="Copy Exchange Number"
                          className="hover:text-white transition-colors cursor-pointer ml-0.5"
                        >
                          {copiedId === r._id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 hover:text-slate-200" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Caller Name */}
                    <td className="py-3.5 px-4 font-medium text-slate-100 whitespace-nowrap">
                      <div>{r.name}</div>
                      <span className={`text-[10px] font-mono px-1 rounded border ${priorityClass}`}>
                        {r.priority || 'Medium'}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-slate-300 font-medium">
                        {r.department}
                      </span>
                    </td>

                    {/* Issue Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p
                        onClick={() => onViewDetails(r)}
                        className="truncate text-slate-300 hover:text-sky-300 cursor-pointer transition-colors"
                        title={r.issue}
                      >
                        {r.issue}
                      </p>
                      {r.resolutionNotes && (
                        <p className="truncate text-[10px] text-slate-500 mt-0.5">
                          Note: {r.resolutionNotes}
                        </p>
                      )}
                    </td>

                    {/* Status Badge (Quick Clickable Toggle) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onToggleStatus(r)}
                        title="Click to cycle status (Open -> In Progress -> Resolved)"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold cursor-pointer transition-transform active:scale-95 ${badge.bg} ${badge.border} ${badge.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        <span>{r.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewDetails(r)}
                          title="View Details"
                          className="p-1.5 rounded hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditRecord(r)}
                          title="Edit Call"
                          className="p-1.5 rounded hover:bg-zinc-800 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecord(r._id)}
                          title="Delete Call Record"
                          className="p-1.5 rounded hover:bg-zinc-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Record Count */}
      <div className="px-4 py-2.5 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <span className="font-mono text-slate-200">{records.length}</span> record{records.length === 1 ? '' : 's'}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>Tip: Click any status pill to quick-toggle status</span>
        </div>
      </div>
    </div>
  );
}
