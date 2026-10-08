import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PhoneCall,
  User,
  Building2,
  Clock,
  AlertCircle,
  FileText,
  Save,
  Search,
  Check,
  Mail,
  Send
} from 'lucide-react';

export default function CallFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialRecord = null,
  departments = [],
  officers = [],
  currentOfficer = null
}) {
  const [formData, setFormData] = useState({
    time: '',
    exchangeNumber: '',
    name: '',
    issue: '',
    status: 'Open',
    priority: 'Medium',
    resolutionNotes: ''
  });

  // Department selection states
  const [deptQuery, setDeptQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Email Forwarding states
  const [forwardIssue, setForwardIssue] = useState(false);
  const [forwardToEmail, setForwardToEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const dropdownRef = useRef(null);

  // Filter officers other than the logged-in user
  const otherOfficers = officers.filter(
    (o) => !currentOfficer || o.email.toLowerCase() !== currentOfficer.email.toLowerCase()
  );

  const getCurrentFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  useEffect(() => {
    if (initialRecord) {
      setFormData({
        time: initialRecord.time || getCurrentFormattedTime(),
        exchangeNumber: initialRecord.exchangeNumber || '',
        name: initialRecord.name || '',
        issue: initialRecord.issue || '',
        status: initialRecord.status || 'Open',
        priority: initialRecord.priority || 'Medium',
        resolutionNotes: initialRecord.resolutionNotes || ''
      });
      setDeptQuery(initialRecord.department || '');
      setSelectedDept(initialRecord.department || '');
      setForwardIssue(Boolean(initialRecord.forwardedTo));
      const targetOfficerEmail = otherOfficers.find(
        (o) => o.email.toLowerCase() === initialRecord.forwardedTo?.toLowerCase()
      )?.email;
      setForwardToEmail(targetOfficerEmail || initialRecord.forwardedTo || (otherOfficers.length > 0 ? otherOfficers[0].email : ''));
    } else {
      setFormData({
        time: getCurrentFormattedTime(),
        exchangeNumber: '',
        name: '',
        issue: '',
        status: 'Open',
        priority: 'Medium',
        resolutionNotes: ''
      });
      // NOTHING is selected or shown by default
      setDeptQuery('');
      setSelectedDept('');
      setForwardIssue(false);
      setForwardToEmail(otherOfficers.length > 0 ? otherOfficers[0].email : '');
    }
    setIsDropdownOpen(false);
    setErrorMsg(null);
  }, [initialRecord, isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter matching departments when user types
  const trimmedQuery = deptQuery.trim().toLowerCase();
  
  const startsWithMatches = trimmedQuery
    ? departments.filter((d) => d.toLowerCase().startsWith(trimmedQuery))
    : [];

  const containsMatches = trimmedQuery
    ? departments.filter(
        (d) =>
          !d.toLowerCase().startsWith(trimmedQuery) &&
          d.toLowerCase().includes(trimmedQuery)
      )
    : [];

  const matchedDepartments = [...startsWithMatches, ...containsMatches];

  const handleSelectDept = (deptName) => {
    setSelectedDept(deptName);
    setDeptQuery(deptName);
    setIsDropdownOpen(false);
    setErrorMsg(null);
  };

  const handleClearDept = () => {
    setDeptQuery('');
    setSelectedDept('');
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setDeptQuery(val);
    setSelectedDept(''); // Reset until explicitly selected or confirmed
    setIsDropdownOpen(val.trim().length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate exchange number
    if (!formData.exchangeNumber.trim()) {
      setErrorMsg('Exchange / Ext number is required.');
      return;
    }

    // Validate caller name
    if (!formData.name.trim()) {
      setErrorMsg('Caller name is required.');
      return;
    }

    // Validate department
    const finalDepartment = selectedDept || deptQuery.trim();
    if (!finalDepartment) {
      setErrorMsg('Please select or type a department.');
      return;
    }

    // Validate issue
    if (!formData.issue.trim()) {
      setErrorMsg('Issue description is required.');
      return;
    }

    // Validate forward recipient if checked
    if (forwardIssue && !forwardToEmail) {
      setErrorMsg('Please select an officer email to forward this issue to.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        time: formData.time.trim() || getCurrentFormattedTime(),
        exchangeNumber: formData.exchangeNumber.trim(),
        name: formData.name.trim(),
        department: finalDepartment,
        issue: formData.issue.trim(),
        status: formData.status,
        priority: formData.priority,
        resolutionNotes: formData.resolutionNotes.trim(),
        forwardIssue,
        forwardToEmail: forwardIssue ? forwardToEmail : null,
        senderName: currentOfficer?.name || 'Officer',
        senderEmail: currentOfficer?.email || 'servicedesk@tabbaheart.org'
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-xl bg-[#0c1017] border border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-950/80 border border-sky-800/80 flex items-center justify-center text-sky-400">
              <PhoneCall className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                {initialRecord ? 'Edit Call Record' : 'Log Inbound Call'}
              </h2>
              <p className="text-xs text-slate-400">
                Register call details into MongoDB Atlas
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Validation Message Box Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-[#1f0d11] border border-rose-600/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-rose-300 uppercase tracking-wider block text-[11px]">
                  Validation Notice
                </span>
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-rose-400 hover:text-rose-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Row 1: Time & Exchange Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field 1: Time */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Call Time
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, time: getCurrentFormattedTime() })}
                  className="text-[11px] font-mono text-sky-400 hover:text-sky-300 underline cursor-pointer"
                >
                  Set Now
                </button>
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g. 11:45 AM"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-slate-100 text-sm font-mono focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>

            {/* Field 2: Exchange Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-sky-400" /> Exchange / Ext No.
              </label>
              <input
                type="text"
                value={formData.exchangeNumber}
                onChange={(e) => setFormData({ ...formData, exchangeNumber: e.target.value })}
                placeholder="e.g. EXT-402, 1089, LINE-2"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-slate-100 text-sm font-mono focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Row 2: Caller Name & Interactive Department Autocomplete */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Field 3: Caller Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" /> Caller Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Salman / Staff Name"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>

            {/* Field 4: Department (Interactive Typeahead / Autocomplete) */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" /> Department
                </span>
                {selectedDept && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3 text-emerald-400" /> Selected
                  </span>
                )}
              </label>

              {/* Department Input Field */}
              <div className="relative">
                <input
                  type="text"
                  value={deptQuery}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (deptQuery.trim().length > 0) setIsDropdownOpen(true);
                  }}
                  placeholder="Type letter to search (e.g. 'H')..."
                  className={`w-full pl-3 pr-8 py-2 rounded-lg bg-zinc-900 border text-slate-100 text-sm focus:outline-none transition-colors ${
                    selectedDept
                      ? 'border-emerald-600/70 focus:border-emerald-500'
                      : 'border-zinc-700/80 focus:border-sky-500'
                  }`}
                />

                {/* Clear or Dropdown indicator */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                  {deptQuery ? (
                    <button
                      type="button"
                      onClick={handleClearDept}
                      className="text-slate-400 hover:text-white cursor-pointer"
                      title="Clear department"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <Search className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Dropdown Menu - ONLY APPARENT WHEN TYPING */}
              {isDropdownOpen && trimmedQuery.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg bg-[#0e131b] border border-zinc-700 shadow-2xl z-50 divide-y divide-zinc-800/60 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 bg-zinc-950/80 text-[10px] font-mono uppercase tracking-wider text-slate-400 sticky top-0 flex items-center justify-between">
                    <span>Matches for "{deptQuery}"</span>
                    <span className="text-slate-500">{matchedDepartments.length} found</span>
                  </div>

                  {matchedDepartments.length > 0 ? (
                    matchedDepartments.map((dept) => {
                      const isSelected = selectedDept === dept;
                      const startsWithQuery = dept.toLowerCase().startsWith(trimmedQuery);

                      return (
                        <div
                          key={dept}
                          onClick={() => handleSelectDept(dept)}
                          className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-sky-950/70 text-sky-200 font-semibold'
                              : 'hover:bg-zinc-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {startsWithQuery && (
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                            )}
                            <span>{dept}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                        </div>
                      );
                    })
                  ) : (
                    <div
                      onClick={() => handleSelectDept(deptQuery.trim())}
                      className="p-3 text-xs text-amber-300 hover:bg-zinc-800 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">No exact department match</div>
                        <div className="text-[11px] text-amber-400/90 mt-0.5">
                          Click to use "{deptQuery.trim()}" as a custom department
                        </div>
                      </div>
                      <PlusIcon className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Field 5: Issue Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" /> Issue Description
            </label>
            <textarea
              rows={3}
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="Describe issue (e.g. Printer offline in Emergency Room, Cath Lab network port down...)"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors resize-none"
              required
            />
          </div>

          {/* Operational Fields: Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['Low', 'Medium', 'High', 'Urgent'].map((p) => {
                  const isSelected = formData.priority === p;
                  let colorStyles = 'bg-zinc-900 border-zinc-800 text-slate-400';
                  if (isSelected) {
                    if (p === 'Low') colorStyles = 'bg-slate-800 border-slate-600 text-slate-200 font-bold';
                    if (p === 'Medium') colorStyles = 'bg-sky-950 border-sky-600 text-sky-300 font-bold';
                    if (p === 'High') colorStyles = 'bg-amber-950 border-amber-600 text-amber-300 font-bold';
                    if (p === 'Urgent') colorStyles = 'bg-rose-950 border-rose-600 text-rose-300 font-bold';
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-1.5 text-xs rounded-md border text-center transition-all cursor-pointer ${colorStyles}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Status
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Open', 'In Progress', 'Resolved'].map((s) => {
                  const isSelected = formData.status === s;
                  let colorStyles = 'bg-zinc-900 border-zinc-800 text-slate-400';
                  if (isSelected) {
                    if (s === 'Open') colorStyles = 'bg-sky-950 border-sky-600 text-sky-300 font-bold';
                    if (s === 'In Progress') colorStyles = 'bg-amber-950 border-amber-600 text-amber-300 font-bold';
                    if (s === 'Resolved') colorStyles = 'bg-emerald-950 border-emerald-600 text-emerald-300 font-bold';
                  }
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s })}
                      className={`py-1.5 text-xs rounded-md border text-center transition-all cursor-pointer ${colorStyles}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Resolution Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Resolution Notes (Optional)
            </label>
            <input
              type="text"
              value={formData.resolutionNotes}
              onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
              placeholder="e.g. Swapped network patch cable, resolved with on-duty technician..."
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Email Integration: Forward Issue Option */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={forwardIssue}
                  onChange={(e) => {
                    setForwardIssue(e.target.checked);
                    if (e.target.checked && otherOfficers.length > 0 && !forwardToEmail) {
                      setForwardToEmail(otherOfficers[0].email);
                    }
                  }}
                  className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-sky-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" /> Forward Issue via Email
                </span>
              </label>

              {currentOfficer && (
                <span className="text-[11px] font-mono text-slate-400">
                  From: <span className="text-slate-300">{currentOfficer.name}</span>
                </span>
              )}
            </div>

            {/* Forward Email Dropdown - Only shown when Forward Issue is selected */}
            {forwardIssue && (
              <div className="mt-2.5 p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="uppercase tracking-wider font-semibold text-slate-400">
                    Forward To Officer (Recipient Email):
                  </span>
                  <span className="text-slate-500 font-mono">
                    {otherOfficers.length} other officer(s)
                  </span>
                </div>

                {otherOfficers.length > 0 ? (
                  <select
                    value={forwardToEmail}
                    onChange={(e) => setForwardToEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
                    required={forwardIssue}
                  >
                    <option value="" disabled>-- Select Officer Email --</option>
                    {otherOfficers.map((off) => (
                      <option key={off.email} value={off.email} className="bg-zinc-900">
                        {off.name} &lt;{off.email}&gt;
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2 text-xs text-amber-400 bg-amber-950/40 rounded border border-amber-800">
                    No other officers found in database.
                  </div>
                )}
                <p className="text-[11px] text-slate-400 leading-snug">
                  Saving will log the incident to Atlas and immediately open New Outlook with recipient and details pre-filled so you can review and click Send.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 border border-sky-400/40 text-white text-xs font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {forwardIssue ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Saving to Atlas...' : initialRecord ? 'Update & Open Outlook' : 'Save & Open Outlook'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saving to Atlas...' : initialRecord ? 'Update Record' : 'Save Record'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
