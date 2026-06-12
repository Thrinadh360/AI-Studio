import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, AlertTriangle, CheckCircle2, Clock, Plus, PenTool, Clipboard, RefreshCw, UserCheck, Check, Trash } from 'lucide-react';
import { ClientDatabase } from '../clientDb';
import { StationIssue, MaintenanceActivity } from '../types';

interface ModuleMaintenanceProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
}

export const ModuleMaintenance: React.FC<ModuleMaintenanceProps> = ({ db, onRefreshAll }) => {
  const [issues, setIssues] = useState<StationIssue[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'issues' | 'schedules'>('issues');

  // Issue Form state
  const [issueStation, setIssueStation] = useState('CS-01');
  const [issueReporter, setIssueReporter] = useState('System (Auto)');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [issueFormOpen, setIssueFormOpen] = useState(false);

  // Maintenance Form state
  const [maintStation, setMaintStation] = useState('CS-01');
  const [maintDate, setMaintDate] = useState('');
  const [maintTech, setMaintTech] = useState('Suresh Kumar');
  const [maintNotes, setMaintNotes] = useState('');
  const [maintFormOpen, setMaintFormOpen] = useState(false);

  // Repair tracking state
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [repairStatus, setRepairStatus] = useState<'PENDING' | 'RESOLVED' | 'UNDER_REPAIR'>('UNDER_REPAIR');
  const [repairNotesInput, setRepairNotesInput] = useState('');

  // Maintenance status update state
  const [selectedMaintId, setSelectedMaintId] = useState<number | null>(null);
  const [maintStatusUpdate, setMaintStatusUpdate] = useState<'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('IN_PROGRESS');
  const [maintNotesUpdate, setMaintNotesUpdate] = useState('');

  useEffect(() => {
    // Populate form date cleanly with tomorrow's date by default
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setMaintDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const syncData = () => {
    setIssues([...db.getStationIssues()]);
    setSchedules([...db.getMaintenanceActivities()]);
  };

  useEffect(() => {
    syncData();
    // Keep in sync with general DB mutations
    const interval = setInterval(syncData, 1000);
    return () => clearInterval(interval);
  }, [db]);

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDesc.trim()) return;

    db.addStationIssue(issueStation, issueReporter, issueDesc, issueSeverity);
    db.addLog('SYSTEM', `Station Issue logged on ${issueStation} by ${issueReporter}: "${issueDesc.substring(0, 30)}..."`, 'warning');
    
    // reset form
    setIssueDesc('');
    setIssueFormOpen(false);
    syncData();
    onRefreshAll();
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintDate || !maintTech.trim()) return;

    db.addMaintenanceActivity(maintStation, maintDate, maintTech, maintNotes);
    db.addLog('SYSTEM', `Maintenance scheduled for ${maintStation} on ${maintDate} by technician ${maintTech}.`, 'success');

    // reset form
    setMaintNotes('');
    setMaintFormOpen(false);
    syncData();
    onRefreshAll();
  };

  const handleUpdateRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIssueId === null) return;

    db.updateStationIssue(selectedIssueId, repairStatus, repairNotesInput);
    setSelectedIssueId(null);
    setRepairNotesInput('');
    syncData();
    onRefreshAll();
  };

  const handleUpdateMaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaintId === null) return;

    db.updateMaintenanceActivity(selectedMaintId, maintStatusUpdate, maintNotesUpdate);
    setSelectedMaintId(null);
    setMaintNotesUpdate('');
    syncData();
    onRefreshAll();
  };

  // Helper colors
  const severityColors = {
    LOW: 'bg-green-950/40 text-green-400 border-green-500/20',
    MEDIUM: 'bg-yellow-950/40 text-yellow-500 border-yellow-500/20',
    HIGH: 'bg-orange-950/40 text-orange-400 border-orange-500/20',
    CRITICAL: 'bg-rose-950/60 text-rose-400 border-rose-500/30 animate-pulse',
  };

  const statusColors = {
    PENDING: 'bg-red-950 text-red-400 border-red-500/20',
    UNDER_REPAIR: 'bg-orange-950 text-orange-450 border-orange-500/20',
    RESOLVED: 'bg-green-950 text-green-400 border-green-500/20',
    SCHEDULED: 'bg-slate-900 text-slate-400 border-slate-750',
    IN_PROGRESS: 'bg-cyan-950 text-cyan-400 border-cyan-500/30',
    COMPLETED: 'bg-emerald-950 text-emerald-450 border-emerald-500/30',
    CANCELLED: 'bg-zinc-900 text-zinc-550 border-[#111]'
  };

  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden shadow-xl backdrop-blur-md animate-fadeIn">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 border-b border-cyan-500/20 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-[#00f2ff]">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-[#00f2ff] uppercase font-orbitron">Ecosystem Maintenance & Repair Center</h2>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Automated hardware diagnostic feedback & dispatch logs (repair_core.php)</p>
          </div>
        </div>
        
        {/* Switch Tabs */}
        <div className="flex rounded-md p-0.5 bg-[#020617] border border-cyan-500/25 font-mono text-[9px] font-bold">
          <button
            onClick={() => { setActiveTab('issues'); setSelectedIssueId(null); }}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 uppercase ${activeTab === 'issues' ? 'bg-[#0a1226] text-[#00f2ff]' : 'text-slate-400 hover:text-slate-100'}`}
          >
            <AlertTriangle className="w-3 h-3" />
            Station Issues ({issues.length})
          </button>
          <button
            onClick={() => { setActiveTab('schedules'); setSelectedMaintId(null); }}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 uppercase ${activeTab === 'schedules' ? 'bg-[#0a1226] text-[#00f2ff]' : 'text-slate-400 hover:text-slate-100'}`}
          >
            <Calendar className="w-3 h-3" />
            Schedule Planner ({schedules.length})
          </button>
        </div>
      </div>

      {/* Grid Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white/5 border border-white/5 p-3 rounded-lg text-left">
          <span className="text-[8px] text-[#00f2ff]/60 uppercase font-mono font-bold block mb-0.5">Pending Diagnostics</span>
          <div className="text-lg font-bold font-orbitron text-red-400">{issues.filter(i => i.status === 'PENDING').length}</div>
        </div>
        <div className="bg-white/5 border border-white/5 p-3 rounded-lg text-left">
          <span className="text-[8px] text-[#00f2ff]/60 uppercase font-mono font-bold block mb-0.5">Active Repairs</span>
          <div className="text-lg font-bold font-orbitron text-orange-400">{issues.filter(i => i.status === 'UNDER_REPAIR').length}</div>
        </div>
        <div className="bg-white/5 border border-white/5 p-3 rounded-lg text-left">
          <span className="text-[8px] text-[#00f2ff]/60 uppercase font-mono font-bold block mb-0.5">Planned Maintenance</span>
          <div className="text-lg font-bold font-orbitron text-cyan-400">{schedules.filter(s => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS').length}</div>
        </div>
        <div className="bg-white/5 border border-white/5 p-3 rounded-lg text-left">
          <span className="text-[8px] text-[#00f2ff]/60 uppercase font-mono font-bold block mb-0.5">Repair Success Rate</span>
          <div className="text-lg font-bold font-orbitron text-green-400">
            {issues.length > 0 ? `${Math.round((issues.filter(i => i.status === 'RESOLVED').length / issues.length) * 100)}%` : '100%'}
          </div>
        </div>
      </div>

      {/* Tab Content Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
        
        {/* TABLE VIEW (Col span 8 or 12 depending on form state) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#020617] rounded-xl border border-cyan-500/20 p-4 min-h-[350px]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                {activeTab === 'issues' ? 'Active Workstation Issues Register' : 'Planned Maintenance Schedules'}
              </span>
              <button
                onClick={() => {
                  if (activeTab === 'issues') {
                    setIssueFormOpen(!issueFormOpen);
                  } else {
                    setMaintFormOpen(!maintFormOpen);
                  }
                }}
                className="bg-indigo-950 hover:bg-indigo-900 text-cyan-300 hover:text-white border border-indigo-500/30 text-[9.5px] font-mono px-3 py-1 rounded transition-all uppercase flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {activeTab === 'issues' ? 'Log New Issue' : 'Schedule Activity'}
              </button>
            </div>

            {/* TAB 1: ISSUES LIST */}
            {activeTab === 'issues' && (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {issues.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-10">No hardware issues registered.</p>
                ) : (
                  issues.map(issue => (
                    <div 
                      key={issue.id} 
                      className={`p-3 rounded-lg bg-[#04091a] border ${selectedIssueId === issue.id ? 'border-[#00f2ff]' : 'border-white/5'} transition-all`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-orbitron font-bold text-xs text-white bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-400/20">{issue.stationId}</span>
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold ${severityColors[issue.severity]}`}>
                            {issue.severity}
                          </span>
                        </div>
                        <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded border font-semibold ${statusColors[issue.status || 'PENDING'] || 'text-zinc-400 bg-zinc-950 border-zinc-800'}`}>
                          {(issue.status || 'PENDING').replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-200 font-sans mb-2 font-medium">{issue.issueDescription}</p>

                      <div className="flex justify-between items-end border-t border-white/5 pt-2 mt-2 text-[9px] text-slate-405 font-mono">
                        <div>
                          <span className="text-slate-550">Reported:</span> {issue.reportedBy} • {new Date(issue.createdAt).toLocaleDateString()}
                        </div>
                        
                        {issue.status !== 'RESOLVED' ? (
                          <button
                            onClick={() => {
                              setSelectedIssueId(issue.id);
                              setRepairStatus(issue.status);
                              setRepairNotesInput(issue.repairNotes || '');
                            }}
                            className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.8 rounded text-[8.5px] transition-all uppercase flex items-center gap-1"
                          >
                            <PenTool className="w-3 h-3" /> Record Repair
                          </button>
                        ) : null}
                      </div>

                      {issue.repairNotes && (
                        <div className="mt-2.5 bg-slate-950/70 p-2 rounded border border-slate-800/40 font-sans text-[10.5px] text-slate-400">
                          <strong className="text-slate-300 font-mono text-[9px] uppercase tracking-wider block mb-0.5">Repair Activities Log:</strong>
                          {issue.repairNotes}
                          {issue.resolvedAt && (
                            <span className="block text-[8px] text-slate-500 font-mono mt-1">Resolved timestamp: {new Date(issue.resolvedAt).toLocaleString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: MAINTENANCE PLANS */}
            {activeTab === 'schedules' && (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {schedules.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-10 text-slate-400">No scheduled activities recorded.</p>
                ) : (
                  schedules.map(plan => (
                    <div 
                      key={plan.id}
                      className={`p-3 rounded-lg bg-[#04091a] border ${selectedMaintId === plan.id ? 'border-[#00f2ff]' : 'border-white/5'} transition-all`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-orbitron font-bold text-xs text-white bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-400/20">{plan.stationId}</span>
                          <span className="text-[9.5px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {plan.scheduledDate}
                          </span>
                        </div>
                        <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded border font-semibold ${statusColors[plan.status]}`}>
                          {plan.status}
                        </span>
                      </div>

                      {plan.notes && <p className="text-xs text-slate-200 mb-2 font-sans font-medium">{plan.notes}</p>}

                      <div className="flex justify-between items-end border-t border-white/5 pt-2 mt-2 text-[9px] text-slate-405 font-mono">
                        <div>
                          <span className="text-slate-550">Assigned Tech:</span> <span className="text-[#00f2ff] font-bold">{plan.technicianName}</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedMaintId(plan.id);
                            setMaintStatusUpdate(plan.status);
                            setMaintNotesUpdate(plan.notes || '');
                          }}
                          className="bg-cyan-950/85 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.8 rounded text-[8.5px] transition-all uppercase"
                        >
                          Modify Status
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* INTERACTIVE COMPLEMENT PANEL: CREATION AND UPDATES IN DRAWER */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* RENDER ACTION MODIFIER IF AN ENTRY IS SELECTED */}
          {selectedIssueId !== null && (
            <div className="bg-[#0b1329] rounded-xl border border-yellow-500/30 p-4 animate-slideIn">
              <h3 className="text-xs font-bold font-orbitron text-yellow-400 mb-3 uppercase flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-yellow-400 animate-spin" /> Record Repair Actions
              </h3>
              
              <form onSubmit={handleUpdateRepair} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Update Current Status</label>
                  <select
                    value={repairStatus}
                    onChange={(e) => setRepairStatus(e.target.value as any)}
                    className="w-full text-white bg-[#020617] border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="PENDING">PENDING (STILL FAULTY)</option>
                    <option value="UNDER_REPAIR">UNDER ACTIVE REPAIR</option>
                    <option value="RESOLVED">RESOLVED (REPAIR SUCCESSFUL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Repair Activities Log</label>
                  <textarea
                    rows={3}
                    placeholder="Describe specific troubleshooting checks, wire swaps, parts replaced, or overrides..."
                    value={repairNotesInput}
                    onChange={(e) => setRepairNotesInput(e.target.value)}
                    className="w-full text-slate-200 bg-[#020617] border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-mono font-bold text-[10.5px] py-1.5 rounded transition uppercase leading-none"
                  >
                    Commit Repair Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIssueId(null)}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 font-mono text-[9.5px] px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* RENDER PLAN MODIFIER FOR PLAN SELECTION */}
          {selectedMaintId !== null && (
            <div className="bg-[#0b1329] rounded-xl border border-cyan-500/35 p-4 animate-slideIn">
              <h3 className="text-xs font-bold font-orbitron text-[#00f2ff] mb-3 uppercase flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-[#00f2ff] animate-pulse" /> Modify Maintenance Task
              </h3>
              
              <form onSubmit={handleUpdateMaint} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Update Current Status</label>
                  <select
                    value={maintStatusUpdate}
                    onChange={(e) => setMaintStatusUpdate(e.target.value as any)}
                    className="w-full text-white bg-[#020617] border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED RUN</option>
                    <option value="CANCELLED">CANCELLED PLAN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Notes & Task Logs</label>
                  <textarea
                    rows={3}
                    placeholder="Log detail notes of replacement results..."
                    value={maintNotesUpdate}
                    onChange={(e) => setMaintNotesUpdate(e.target.value)}
                    className="w-full text-slate-200 bg-[#020617] border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#00f2ff] hover:bg-[#52edff] text-slate-950 font-mono font-bold text-[10px] py-1.5 rounded transition uppercase leading-none"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMaintId(null)}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 font-mono text-[9.5px] px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ACTIVE FORM: ISSUE LOGGER FRAME */}
          {issueFormOpen && activeTab === 'issues' && (
            <div className="bg-[#0b1329] rounded-xl border border-cyan-500/25 p-4 animate-slideIn">
              <h3 className="text-xs font-bold font-orbitron text-[#00f2ff] mb-3 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#00f2ff]" /> Log Hardware Failure
              </h3>

              <form onSubmit={handleCreateIssue} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Select Workstation</label>
                  <select
                    value={issueStation}
                    onChange={(e) => setIssueStation(e.target.value)}
                    className="w-full text-white bg-[#020617] border border-cyan-500/30 rounded px-2 py-1 text-xs focus:outline-none font-mono"
                  >
                    {Array.from({ length: 50 }, (_, i) => {
                      const sid = `CS-${String(i + 1).padStart(2, '0')}`;
                      return <option key={sid} value={sid}>{sid}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Reported By</label>
                  <input
                    type="text"
                    value={issueReporter}
                    onChange={(e) => setIssueReporter(e.target.value)}
                    className="w-full text-white bg-[#020617] border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
                    placeholder="System (Auto) or operator/student name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Severity Level</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map(sev => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setIssueSeverity(sev)}
                        className={`py-1 text-[8px] font-mono rounded border text-center transition-colors font-bold ${issueSeverity === sev ? 'bg-indigo-950 border-cyan-500 text-[#00f2ff]' : 'bg-[#020617] border-white/5 text-slate-500'}`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Issue Description</label>
                  <textarea
                    rows={3}
                    placeholder="Report specific errors, faulty buttons, thermal shutdown messages..."
                    value={issueDesc}
                    onChange={(e) => setIssueDesc(e.target.value)}
                    className="w-full text-white bg-[#020617] border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#00f2ff] hover:bg-[#52edff] text-[#020617] font-mono font-bold text-xs py-2 rounded transition uppercase leading-none shadow-md"
                  >
                    Commit Entry To DB
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueFormOpen(false)}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 text-[10px] px-2.5 py-1.5 rounded transition font-mono uppercase"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ACTIVE FORM: PLAN SCHEDULER LOGGER */}
          {maintFormOpen && activeTab === 'schedules' && (
            <div className="bg-[#0b1329] rounded-xl border border-cyan-500/25 p-4 animate-slideIn">
              <h3 className="text-xs font-bold font-orbitron text-[#00f2ff] mb-3 uppercase flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#00f2ff]" /> Schedule Activity
              </h3>

              <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Select Workstation</label>
                  <select
                    value={maintStation}
                    onChange={(e) => setMaintStation(e.target.value)}
                    className="w-full text-white bg-[#020617] border border-cyan-500/30 rounded px-2 py-1 text-xs focus:outline-none font-mono"
                  >
                    {Array.from({ length: 50 }, (_, i) => {
                      const sid = `CS-${String(i + 1).padStart(2, '0')}`;
                      return <option key={sid} value={sid}>{sid}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Scheduled Target Date</label>
                  <input
                    type="date"
                    value={maintDate}
                    onChange={(e) => setMaintDate(e.target.value)}
                    className="w-full text-white bg-[#020617] border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Assigned Technician</label>
                  <input
                    type="text"
                    value={maintTech}
                    onChange={(e) => setMaintTech(e.target.value)}
                    className="w-full text-white bg-[#020617] border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400"
                    placeholder="Full Name (e.g. Suresh Kumar)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[8.5px] text-[#00f2ff] font-mono mb-1 uppercase tracking-wider">Activity Notes (Scope of Work)</label>
                  <textarea
                    rows={3}
                    placeholder="Describe maintenance scope (e.g. OS patch upgrade, peripheral hardware overhaul...)"
                    value={maintNotes}
                    onChange={(e) => setMaintNotes(e.target.value)}
                    className="w-full text-white bg-[#020617] border border-cyan-500/30 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#00f2ff] hover:bg-[#52edff] text-[#020617] font-mono font-bold text-xs py-2 rounded transition uppercase leading-none shadow-md"
                  >
                    Add Schedule Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaintFormOpen(false)}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 text-[10px] px-2.5 py-1.5 rounded transition font-mono uppercase"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* INFORMATIVE EXPLANATORY NOTES */}
          <div className="bg-[#020617]/40 border border-cyan-500/10 p-3.5 rounded-xl text-left text-[11px] leading-relaxed text-slate-400">
            <h4 className="text-[10px] font-mono font-bold text-cyan-400 mb-1.5 uppercase flex items-center gap-1.5">
              <Clipboard className="w-3.5 h-3.5" /> Maintenance Guidelines
            </h4>
            <p className="mb-2">Admin triggers execute automatic locks on station slots with high-severity issues reported to ensure security lock compliance.</p>
            <p className="font-mono text-[9px] text-[#00f2ff]/75">RELATIONAL SCHEMA LINKS (MySQL):</p>
            <ul className="list-disc list-inside mt-1 font-mono text-[9.5px] text-slate-500 space-y-0.5">
              <li>maintenance_schedule ON stations(sid)</li>
              <li>station_issues ON stations(sid)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
