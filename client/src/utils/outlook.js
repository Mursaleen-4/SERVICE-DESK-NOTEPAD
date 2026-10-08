// Utility to trigger pre-filled Microsoft Outlook compose window on desktop
export function openOutlookDraft({ record, recipientEmail, senderOfficer }) {
  if (!recipientEmail || !record) return;

  const subject = `[ICT Service Desk Message] Ext: ${record.exchangeNumber} | ${record.department} | ${record.name}`;

  const lines = [
    
    '𝐓𝐀𝐁𝐁𝐀 𝐇𝐄𝐀𝐑𝐓 𝐈𝐍𝐒𝐓𝐈𝐓𝐔𝐓𝐄-𝐈𝐂𝐓 𝐒𝐄𝐑𝐕𝐈𝐂𝐄-𝐃𝐄𝐒𝐊 𝐌𝐄𝐒𝐒𝐀𝐆𝐄',
    '',
    `Time & Date:    ${record.time || ''} (${record.date || new Date().toISOString().split('T')[0]})`,
    `Exchange / Ext: ${record.exchangeNumber || ''}`,
    `Caller Name:    ${record.name || ''}`,
    `Department:     ${record.department || ''}`,
    `Priority:       ${record.priority || 'Medium'}`,
    `Status:         ${record.status || 'Open'}`,
    '',
    'REPORTED ISSUE:',
    `${record.issue || ''}`
  ];

  if (record.resolutionNotes && record.resolutionNotes.trim()) {
    lines.push('');
    lines.push('RESOLUTION NOTES:');
    lines.push(record.resolutionNotes.trim());
  }

  lines.push('');
  lines.push(`Forwarded by: ${senderOfficer?.name || 'Service Desk Officer'} (${senderOfficer?.email || ''})`);
  lines.push('Tabba Heart Institute • ICT Service Desk Terminal');

  const body = lines.join('\r\n');
  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Create temporary anchor and click to invoke default Windows mail handler (New Outlook)
  const link = document.createElement('a');
  link.href = mailtoUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 200);
}
