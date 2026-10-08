import React, { useState } from 'react';
import {
  X,
  Clock,
  PhoneCall,
  User,
  Building2,
  AlertCircle,
  FileText,
  CheckCircle2,
  Mail,
  Send,
  ExternalLink
} from 'lucide-react';

export default function RecordDetailsModal({
  record,
  onClose,
  onEdit,
  officers = [],
  currentOfficer = null,
  onForward = null,
  onOpenOutlook = null
}) {
  const [selectedOfficerEmail, setSelectedOfficerEmail] = useState('');
  const [sending, setSending] = useState(false);

  if (!record) return null;

  const otherOfficers = officers.filter(
    (o) => !currentOfficer || o.email.toLowerCase() !== currentOfficer.email.toLowerCase()
  );

  const targetEmail = selectedOfficerEmail || (otherOfficers.length > 0 ? otherOfficers[0].email : '');

  const handleSendEmail = async () => {
    if (!targetEmail || !onForward) return;
    setSending(true);
    try {
      await onForward(record._id, targetEmail);
    } finally {
      setSending(false);
    }
  };

  const handleLaunchDesktopOutlook = async () => {
    if (!onOpenOutlook) return;
    setSending(true);
    try {
      await onOpenOutlook(record._id, targetEmail);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-xl bg-[#0c1017] border border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-sky-400">
              <PhoneCall className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Call Incident Details
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                ID: {record._id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Key metadata grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div>
              <span className="text-slate-400 flex items-center gap-1 font-semibold uppercase text-[10px]">
                <Clock className="w-3 h-3 text-sky-400" /> Time & Date
              </span>
              <p className="font-mono text-slate-200 mt-0.5 text-sm font-bold">
                {record.time} <span className="text-xs text-slate-400 font-normal">({record.date})</span>
              </p>
            </div>
            <div>
              <span className="text-slate-400 flex items-center gap-1 font-semibold uppercase text-[10px]">
                <PhoneCall className="w-3 h-3 text-sky-400" /> Exchange No.
              </span>
              <p className="font-mono text-sky-300 mt-0.5 text-sm font-bold">
                {record.exchangeNumber}
              </p>
            </div>
            <div>
              <span className="text-slate-400 flex items-center gap-1 font-semibold uppercase text-[10px]">
                <User className="w-3 h-3 text-sky-400" /> Caller Name
              </span>
              <p className="text-slate-200 mt-0.5 font-semibold text-sm">
                {record.name}
              </p>
            </div>
            <div>
              <span className="text-slate-400 flex items-center gap-1 font-semibold uppercase text-[10px]">
                <Building2 className="w-3 h-3 text-sky-400" /> Department
              </span>
              <p className="text-slate-200 mt-0.5 font-semibold text-sm">
                {record.department}
              </p>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Current Status
              </span>
              <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-slate-200 font-semibold font-mono">
                {record.status}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Priority
              </span>
              <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-slate-200 font-semibold font-mono">
                {record.priority}
              </span>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-sky-400" /> Reported Issue
            </span>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
              {record.issue}
            </div>
          </div>

          {/* Resolution Notes */}
          {record.resolutionNotes && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resolution Notes
              </span>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-slate-300 text-xs leading-relaxed">
                {record.resolutionNotes}
              </div>
            </div>
          )}

          {/* Previous Forwarding Status */}
          {record.forwardedTo && (
            <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/60 flex items-center justify-between text-[11px]">
              <span className="text-sky-300 font-semibold flex items-center gap-1.5">
                Previously Forwarded to: <span className="font-mono text-slate-200">{record.forwardedTo}</span>
              </span>
              {record.forwardedBy && (
                <span className="text-slate-400 font-mono">By: {record.forwardedBy}</span>
              )}
            </div>
          )}

          {/* Interactive Outlook Organization Forward Section */}
          <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5 text-sky-400" /> Forward via Microsoft Outlook
              </span>
              {currentOfficer && (
                <span className="text-[11px] font-mono text-slate-400">
                  Officer: <strong className="text-slate-300">{currentOfficer.name}</strong>
                </span>
              )}
            </div>

            {otherOfficers.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Select Recipient Officer:</span>
                  <span className="font-mono text-slate-500">{otherOfficers.length} available</span>
                </div>
                <select
                  value={targetEmail}
                  onChange={(e) => setSelectedOfficerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {otherOfficers.map((o) => (
                    <option key={o.email} value={o.email} className="bg-zinc-900">
                      {o.name} &lt;{o.email}&gt;
                    </option>
                  ))}
                </select>

                <div className="pt-1">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={handleSendEmail}
                    className="w-full px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Opening Outlook...' : 'Forward in Microsoft Outlook'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Immediately opens New Outlook with this incident pre-filled. Review and click Send in Outlook to dispatch.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono">No other officers available to forward.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <span className="text-[11px] text-slate-500 font-mono">
            Recorded in Atlas Database: 'servicedesk'
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Edit Call
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
