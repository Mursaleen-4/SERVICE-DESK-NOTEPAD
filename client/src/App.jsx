import React, { useState, useEffect, useCallback } from 'react';
import BackgroundVideo from './components/BackgroundVideo';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import CallTable from './components/CallTable';
import CallFormModal from './components/CallFormModal';
import RecordDetailsModal from './components/RecordDetailsModal';
import VideoSettingsModal from './components/VideoSettingsModal';
import Toast from './components/Toast';
import MessageBoxModal from './components/MessageBoxModal';
import { openOutlookDraft } from './utils/outlook';

export default function App() {
  // Database & Records State
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [currentOfficer, setCurrentOfficer] = useState(null);
  const [stats, setStats] = useState(null);
  const [dbStatus, setDbStatus] = useState({ connected: false });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals State
  const [isNewCallOpen, setIsNewCallOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [detailsRecord, setDetailsRecord] = useState(null);
  const [isVideoSettingsOpen, setIsVideoSettingsOpen] = useState(false);

  // Message Box Confirmation Modal State (No native browser alerts/confirms)
  const [messageBox, setMessageBox] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: null
  });

  // Background Video State
  const [videoTheme, setVideoTheme] = useState('ambient');
  const [opacity, setOpacity] = useState(0.72);
  const [isPlaying, setIsPlaying] = useState(true);

  // Message Box Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Database Health
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data && data.database) {
        setDbStatus(data.database);
      }
    } catch (err) {
      setDbStatus({ connected: false, error: err.message });
      showToast('error', 'Atlas Notice', 'Unable to reach backend API.');
    }
  }, [showToast]);

  // Fetch Officers from MongoDB Atlas
  const fetchOfficers = useCallback(async () => {
    try {
      const res = await fetch('/api/officers');
      const data = await res.json();
      if (data.success && Array.isArray(data.officers)) {
        setOfficers(data.officers);
        // Sync saved officer session from localStorage
        const savedEmail = localStorage.getItem('servicedesk_officer_email');
        if (savedEmail) {
          const matched = data.officers.find((o) => o.email === savedEmail);
          if (matched) setCurrentOfficer(matched);
        }
      }
    } catch (err) {
      showToast('error', 'Officers Sync', 'Could not load officers list from database.');
    }
  }, [showToast]);

  // Handle Officer selection
  const handleSelectOfficer = (email) => {
    const matched = officers.find((o) => o.email === email);
    if (matched) {
      setCurrentOfficer(matched);
      localStorage.setItem('servicedesk_officer_email', matched.email);
      showToast('info', 'Active Officer', `Session set to: ${matched.name} (${matched.email})`);
    }
  };

  // Fetch Departments dynamically from MongoDB Atlas
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.success && Array.isArray(data.departments)) {
        setDepartments(data.departments);
      }
    } catch (err) {
      showToast('error', 'Departments Sync', 'Could not load departments from database.');
    }
  }, [showToast]);

  // Fetch Stats Summary
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      // Handled silently
    }
  }, []);

  // Fetch Call Records
  const fetchRecords = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (departmentFilter !== 'All') params.append('department', departmentFilter);
      if (statusFilter !== 'All' && statusFilter !== 'Urgent') params.append('status', statusFilter);
      if (statusFilter === 'Urgent') params.append('priority', 'Urgent');
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/records?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
        if (showRefreshing) {
          showToast('success', 'Registry Synced', `${data.records.length} call records up-to-date.`);
        }
      }
    } catch (err) {
      showToast('error', 'Load Failed', 'Could not retrieve call records from Atlas.');
    } finally {
      setLoading(false);
      if (showRefreshing) setIsRefreshing(false);
    }
  }, [departmentFilter, statusFilter, searchQuery, showToast]);

  // Initial Load & periodic polling
  useEffect(() => {
    checkHealth();
    fetchOfficers();
    fetchDepartments();
    fetchStats();
    fetchRecords();

    const interval = setInterval(() => {
      checkHealth();
      fetchStats();
    }, 20000);
    return () => clearInterval(interval);
  }, [checkHealth, fetchOfficers, fetchDepartments, fetchStats, fetchRecords]);

  // Handle Open New Call (Validates that officer name is chosen first)
  const handleOpenNewCall = () => {
    if (!currentOfficer) {
      setMessageBox({
        isOpen: true,
        title: 'Officer Name Required',
        message: 'Please choose your name from the top-left dropdown before logging calls or forwarding issues.',
        confirmText: 'Understood',
        cancelText: null,
        type: 'warning',
        onConfirm: () => setMessageBox((prev) => ({ ...prev, isOpen: false }))
      });
      return;
    }
    setIsNewCallOpen(true);
  };

  // Handle Create or Update
  const handleSaveRecord = async (formData) => {
    try {
      let savedRecord = null;
      const payload = {
        ...formData,
        senderName: currentOfficer?.name,
        senderEmail: currentOfficer?.email
      };

      if (editingRecord) {
        // Update existing record
        const res = await fetch(`/api/records/${editingRecord._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Update failed');
        savedRecord = data.record || { ...editingRecord, ...payload };
      } else {
        // Create new record
        const res = await fetch('/api/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Creation failed');
        savedRecord = data.record || payload;
      }

      // Check if forwardIssue was selected - works seamlessly for BOTH new and edited records!
      if (formData.forwardIssue && formData.forwardToEmail) {
        openOutlookDraft({
          record: savedRecord || formData,
          recipientEmail: formData.forwardToEmail,
          senderOfficer: currentOfficer
        });

        showToast(
          'success',
          editingRecord ? 'Record Updated & Outlook Opened' : 'Saved & Outlook Opened',
          editingRecord
            ? `Changes saved to Atlas. New Outlook draft opened for ${formData.forwardToEmail}.`
            : `Saved to Atlas. New Outlook draft opened for ${formData.forwardToEmail}.`
        );
      } else {
        showToast(
          'success',
          editingRecord ? 'Record Updated' : 'Call Registered',
          editingRecord
            ? `Call record for ${formData.name} successfully updated.`
            : `Inbound call from ${formData.name} (${formData.exchangeNumber}) saved to Atlas.`
        );
      }

      await fetchRecords();
      await fetchStats();
      setEditingRecord(null);
    } catch (error) {
      showToast('error', 'Save Failed', error.message || 'Could not save record to Atlas.');
      throw error;
    }
  };

  // Dedicated Forward Handler for existing records
  const handleForwardEmail = async (recordId, recipientEmail) => {
    try {
      const res = await fetch('/api/records/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          recipientEmail,
          senderName: currentOfficer?.name || 'Service Desk Officer',
          senderEmail: currentOfficer?.email || 'servicedesk@tabbaheart.org'
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Forward failed');

      // Open pre-filled Outlook compose window
      const targetRecord = records.find((r) => r._id === recordId) || detailsRecord;
      if (targetRecord) {
        openOutlookDraft({
          record: targetRecord,
          recipientEmail,
          senderOfficer: currentOfficer
        });
      }

      showToast(
        'success',
        'Outlook Draft Opened',
        `Pre-filled email draft opened in New Outlook for ${recipientEmail}. Click Send in Outlook to dispatch.`
      );
      await fetchRecords();
      return data;
    } catch (err) {
      showToast('error', 'Forward Failed', err.message);
      throw err;
    }
  };

  // Dedicated Open in Outlook Desktop Handler
  const handleOpenOutlook = (recordId, recipientEmail) => {
    const targetRecord = records.find((r) => r._id === recordId) || detailsRecord;
    if (targetRecord) {
      openOutlookDraft({
        record: targetRecord,
        recipientEmail,
        senderOfficer: currentOfficer
      });
      showToast('info', 'Outlook Draft Opened', 'Composing incident draft directly in Microsoft Outlook.');
    }
  };

  // Handle Quick Status Toggle
  const handleToggleStatus = async (record) => {
    const cycle = {
      'Open': 'In Progress',
      'In Progress': 'Resolved',
      'Resolved': 'Open',
      'Escalated': 'In Progress'
    };
    const nextStatus = cycle[record.status] || 'Open';

    try {
      const res = await fetch(`/api/records/${record._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRecords((prev) =>
          prev.map((r) => (r._id === record._id ? { ...r, status: nextStatus } : r))
        );
        fetchStats();
        showToast('info', 'Status Updated', `${record.name} (${record.exchangeNumber}) set to ${nextStatus}.`);
      }
    } catch (err) {
      showToast('error', 'Status Update Failed', err.message);
    }
  };

  // Handle Delete Record via custom in-app Message Box Modal
  const handleDeleteRecord = (id) => {
    const rec = records.find((r) => r._id === id);
    setMessageBox({
      isOpen: true,
      title: 'Confirm Record Deletion',
      message: `Are you sure you want to delete the call record for "${rec?.name || 'this caller'}" (Exchange: ${rec?.exchangeNumber || 'N/A'}) from MongoDB Atlas? This action cannot be undone.`,
      confirmText: 'Delete Record',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setMessageBox((prev) => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            setRecords((prev) => prev.filter((r) => r._id !== id));
            fetchStats();
            showToast('success', 'Record Deleted', 'Call record permanently deleted from Atlas.');
          }
        } catch (err) {
          showToast('error', 'Delete Failed', err.message);
        }
      }
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (records.length === 0) {
      showToast('warning', 'Export Notice', 'No call records available in current filter to export.');
      return;
    }

    const headers = [
      'Time',
      'Date',
      'Exchange Number',
      'Caller Name',
      'Department',
      'Issue',
      'Priority',
      'Status',
      'Resolution Notes',
      'Forwarded To',
      'Forwarded By',
      'MongoDB Atlas ID',
    ];

    const rows = records.map((r) => [
      `"${r.time || ''}"`,
      `"${r.date || ''}"`,
      `"${r.exchangeNumber || ''}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.department || '').replace(/"/g, '""')}"`,
      `"${(r.issue || '').replace(/"/g, '""')}"`,
      `"${r.priority || ''}"`,
      `"${r.status || ''}"`,
      `"${(r.resolutionNotes || '').replace(/"/g, '""')}"`,
      `"${r.forwardedTo || ''}"`,
      `"${r.forwardedBy || ''}"`,
      `"${r._id || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `ServiceDesk_Calls_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'CSV Export Ready', `Successfully exported ${records.length} records to CSV.`);
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Floating Toast Message Boxes */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation & Alert Message Box Modal */}
      <MessageBoxModal
        isOpen={messageBox.isOpen}
        title={messageBox.title}
        message={messageBox.message}
        confirmText={messageBox.confirmText}
        cancelText={messageBox.cancelText}
        type={messageBox.type}
        onConfirm={messageBox.onConfirm}
        onCancel={() => setMessageBox((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Background HD Video Player & Tactical Backdrop */}
      <BackgroundVideo
        videoTheme={videoTheme}
        opacity={opacity}
        isPlaying={isPlaying}
      />

      {/* Top Navigation & Status Bar */}
      <Header
        dbStatus={dbStatus}
        onOpenNewCall={handleOpenNewCall}
        onRefresh={() => {
          checkHealth();
          fetchOfficers();
          fetchDepartments();
          fetchStats();
          fetchRecords(true);
        }}
        onOpenVideoSettings={() => setIsVideoSettingsOpen(true)}
        onExportCSV={handleExportCSV}
        isRefreshing={isRefreshing}
        officers={officers}
        currentOfficer={currentOfficer}
        onSelectOfficer={handleSelectOfficer}
      />

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* KPI Stats Bar */}
        <StatsCards stats={stats} onFilterStatus={setStatusFilter} />

        {/* Call Records Registry Table */}
        <CallTable
          records={records}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          departmentsList={departments}
          onEditRecord={(record) => setEditingRecord(record)}
          onDeleteRecord={handleDeleteRecord}
          onToggleStatus={handleToggleStatus}
          onViewDetails={(record) => setDetailsRecord(record)}
          onToast={({ type, title, message }) => showToast(type, title, message)}
        />
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0b0e14]/90 backdrop-blur-md border-t border-zinc-800/80 px-4 lg:px-8 py-3 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Local Service Desk Officer Terminal</span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-slate-400">Database: servicedesk</span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-slate-400">
            {currentOfficer ? `Logged in: ${currentOfficer.name}` : 'No Officer Selected'}
          </span>
        </div>
        <div className="text-slate-400 font-mono text-[11px]">
          Shortcuts: <span className="text-slate-300">Click Status Badge</span> to advance state
        </div>
      </footer>

      {/* Modal: Log New Call */}
      <CallFormModal
        isOpen={isNewCallOpen}
        onClose={() => setIsNewCallOpen(false)}
        onSubmit={handleSaveRecord}
        departments={departments}
        officers={officers}
        currentOfficer={currentOfficer}
      />

      {/* Modal: Edit Existing Call */}
      <CallFormModal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        onSubmit={handleSaveRecord}
        initialRecord={editingRecord}
        departments={departments}
        officers={officers}
        currentOfficer={currentOfficer}
      />

      {/* Modal: Record Details */}
      <RecordDetailsModal
        record={detailsRecord}
        onClose={() => setDetailsRecord(null)}
        onEdit={(rec) => setEditingRecord(rec)}
        officers={officers}
        currentOfficer={currentOfficer}
        onForward={handleForwardEmail}
        onOpenOutlook={handleOpenOutlook}
      />

      {/* Modal: Background Video Settings */}
      <VideoSettingsModal
        isOpen={isVideoSettingsOpen}
        onClose={() => setIsVideoSettingsOpen(false)}
        videoTheme={videoTheme}
        setVideoTheme={setVideoTheme}
        opacity={opacity}
        setOpacity={setOpacity}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />
    </div>
  );
}
