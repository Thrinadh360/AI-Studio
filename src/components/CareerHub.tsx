import React, { useState } from 'react';
import { 
  Briefcase, FileText, PlusCircle, Search, BadgeCheck, Send, Sparkles, 
  MapPin, DollarSign, Calendar, Sliders, ChevronDown, Check, Building, Users
} from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { User, JobOpportunity } from '../types';

interface CareerHubProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
  overrideCurrentUser: User;
}

export const CareerHub: React.FC<CareerHubProps> = ({ db, onRefreshAll, overrideCurrentUser }) => {
  const [subTab, setSubTab] = useState<'listings' | 'applications' | 'resume' | 'post-referral'>('listings');
  
  // Listings Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'Full-time' | 'Internship'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Resume builder states - prefill from active student profile if they exist
  const [skillsStr, setSkillsStr] = useState(overrideCurrentUser.resumeSkills?.join(', ') || '');
  const [summary, setSummary] = useState(overrideCurrentUser.resumeSummary || '');
  const [education, setEducation] = useState(overrideCurrentUser.resumeEducation || '');
  const [experience, setExperience] = useState(overrideCurrentUser.resumeExperience || '');
  const [projects, setProjects] = useState(overrideCurrentUser.resumeProjects || '');

  // Alumni custom posting states
  const [postTitle, setPostTitle] = useState('');
  const [postCompany, setPostCompany] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postType, setPostType] = useState<'Full-time' | 'Internship'>('Full-time');
  const [postCategory, setPostCategory] = useState('Software Engineering');
  const [postSalary, setPostSalary] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postReqsStr, setPostReqsStr] = useState('');
  const [postSkillsStr, setPostSkillsStr] = useState('');

  // Status logs
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Submit master resume update
  const handleSaveResume = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const result = db.updateStudentResume(overrideCurrentUser.id!, {
      skills: skillsArray,
      summary,
      education,
      experience,
      projects
    });

    if (result.success) {
      showToast('Digital Master Resume updated successfully!');
      onRefreshAll();
    } else {
      showToast(result.message, 'error');
    }
  };

  // Student apply to job helper
  const handleApplyToJob = (jobId: string) => {
    // Make sure student has some skills filled or summary
    const sSkills = overrideCurrentUser.resumeSkills || [];
    const sSummary = overrideCurrentUser.resumeSummary || '';

    if (sSkills.length === 0 && !sSummary) {
      // Suggest saving resume first or use dummy defaults
      const defaultSummary = `Undergrad pursuing ${overrideCurrentUser.subject || 'Engineering'} at Maddilapalem Node. Dedicated to full stack development and secure networks.`;
      const defaultSkills = ['React', 'TypeScript', 'Tailwind CSS'];
      
      const result = db.applyToJob(jobId, overrideCurrentUser.id!, defaultSummary, defaultSkills);
      if (result.success) {
        showToast('Auto-Generated Profile Resume & Submitted successfully!');
        onRefreshAll();
      } else {
        showToast(result.message, 'error');
      }
    } else {
      const result = db.applyToJob(jobId, overrideCurrentUser.id!, sSummary, sSkills);
      if (result.success) {
        showToast(result.message);
        onRefreshAll();
      } else {
        showToast(result.message, 'error');
      }
    }
  };

  // Alumni post referral helper
  const handlePostReferralSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postCompany || !postLocation) {
      showToast('Please fill in Job Title, Partner Firm / Company, and Campus Location.', 'error');
      return;
    }

    const reqsArray = postReqsStr.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    const skillsArr = postSkillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const result = db.postJobFromAlumni(overrideCurrentUser.id!, {
      title: postTitle,
      company: postCompany,
      location: postLocation,
      type: postType,
      category: postCategory,
      salary: postSalary || 'Market Standard package',
      description: postDesc || 'Direct corporate bypass referral published securely for AU graduates.',
      requirements: reqsArray,
      skillsRequired: skillsArr
    });

    if (result.success) {
      showToast('Your Alumni Corporate Referral opportunity has been posted live!');
      // Reset forms
      setPostTitle('');
      setPostCompany('');
      setPostLocation('');
      setPostSalary('');
      setPostDesc('');
      setPostReqsStr('');
      setPostSkillsStr('');
      setSubTab('listings');
      onRefreshAll();
    } else {
      showToast(result.message, 'error');
    }
  };

  // Get active items
  const allJobs = db.getJobOpportunities() || [];
  const myApplications = db.getJobApplications(overrideCurrentUser.id) || [];

  // Filter listings
  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skillsRequired.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'All' || job.type === selectedType;
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Get unique categories for dropdown filter
  const categories = ['All', ...Array.from(new Set(allJobs.map(j => j.category)))];

  const hasSetupResume = (overrideCurrentUser.resumeSkills && overrideCurrentUser.resumeSkills.length > 0) || overrideCurrentUser.resumeSummary;

  return (
    <div className="space-y-3 font-sans pb-3" id="careerHubPwaContainer">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`p-2.5 rounded border text-[10px] flex items-center gap-2 animate-fadeIn ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950 border-rose-500/35 text-rose-300'
        }`}>
          <BadgeCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-gradient-to-br from-[#0d1527] to-[#040813] border border-cyan-500/20 p-3 rounded-xl">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 text-left">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Briefcase className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1 font-sans">
                Career Sync Portal
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              </h2>
              <p className="text-[8.5px] text-slate-400 font-mono mt-0.5 uppercase">Direct Hiring & Alumni Referral Network</p>
            </div>
          </div>
          <span className="text-[7.5px] font-mono font-bold bg-amber-950/50 text-amber-400 border border-amber-500/35 px-1.5 py-0.5 rounded uppercase">
            Active Hub
          </span>
        </div>
      </div>

      {/* Sub Tabs menu */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-white/5 scrollbar-thin">
        <button
          type="button"
          onClick={() => setSubTab('listings')}
          className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider font-sans border transition-all flex-shrink-0 cursor-pointer ${
            subTab === 'listings'
              ? 'bg-amber-950 text-amber-400 border-amber-500/30'
              : 'bg-transparent text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Vacancies ({filteredJobs.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('applications')}
          className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider font-sans border transition-all flex-shrink-0 cursor-pointer ${
            subTab === 'applications'
              ? 'bg-amber-950 text-amber-400 border-amber-500/30'
              : 'bg-transparent text-slate-400 border-transparent hover:text-white'
          }`}
        >
          My Applications ({myApplications.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('resume')}
          className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider font-sans border transition-all flex-shrink-0 cursor-pointer ${
            subTab === 'resume'
              ? 'bg-amber-950 text-amber-400 border-amber-500/30'
              : 'bg-transparent text-slate-400 border-transparent hover:text-white'
          }`}
        >
          {hasSetupResume ? 'Edit Resume' : 'Build Resume'}
        </button>

        {(overrideCurrentUser.role === 'Alumni' || overrideCurrentUser.isDeveloper) && (
          <button
            type="button"
            onClick={() => setSubTab('post-referral')}
            className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider font-sans border transition-all flex-shrink-0 cursor-pointer ml-auto flex items-center gap-1 ${
              subTab === 'post-referral'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/15 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3 h-3 text-emerald-400" />
            Refer Job
          </button>
        )}
      </div>

      {/* RENDER listings subtab */}
      {subTab === 'listings' && (
        <div className="space-y-3 animate-fadeIn text-left">
          
          {/* Quick Filters */}
          <div className="bg-[#040814] border border-white/5 rounded-xl p-2.5 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search matching roles, partner companies, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-white bg-slate-950/70 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-500/55 font-sans"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="block text-[8px] uppercase text-slate-400 font-mono tracking-wider mb-1 font-bold">Offer Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/5 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500/40 text-xs font-sans"
                >
                  <option value="All">All Types</option>
                  <option value="Full-time">Full-time Roles</option>
                  <option value="Internship">Internships Only</option>
                </select>
              </div>
              <div>
                <label className="block text-[8px] uppercase text-slate-400 font-mono tracking-wider mb-1 font-bold">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500/40 text-xs font-sans"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Listings Loop */}
          {filteredJobs.length === 0 ? (
            <div className="bg-[#040814] border border-white/5 rounded-xl p-6 text-center text-slate-500 text-[10px]">
              <Sliders className="w-5 h-5 text-slate-600 mx-auto mb-2 animate-bounce" />
              No matching vacancies found at this campus node. Try refining search metrics or look up other keywords.
            </div>
          ) : (
            <div className="space-y-2.5 pr-0.5">
              {filteredJobs.map(job => {
                const hasApplied = myApplications.some(app => app.jobId === job.id);
                return (
                  <div 
                    key={job.id} 
                    className={`bg-slate-950 border rounded-xl p-3 space-y-2.5 transition-all relative overflow-hidden ${
                      hasApplied 
                        ? 'border-emerald-500/20 bg-emerald-950/5' 
                        : job.isCustomAlumniSubmission 
                        ? 'border-amber-500/15 hover:border-amber-500/35' 
                        : 'border-white/5 hover:border-white/15'
                    }`}
                  >
                    {job.isCustomAlumniSubmission && (
                      <span className="absolute top-0 right-0 text-[6.5px] font-mono font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-bl uppercase z-10 flex items-center gap-0.5">
                        <Users className="w-2 h-2" /> Alumni Referral
                      </span>
                    )}

                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                        <Building className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h3 className="text-[12px] font-black text-white hover:text-amber-300 leading-snug truncate">{job.title}</h3>
                        <div className="text-[10px] text-slate-350 font-medium flex items-center gap-1.5 leading-none mt-1">
                          <span>{job.company}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 flex items-center gap-0.5 text-[8.5px]"><MapPin className="w-2.5 h-2.5" />{job.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 h-[1px] my-1" />

                    <p className="text-[9.5px] text-slate-300 leading-relaxed font-sans">{job.description}</p>

                    {/* Requirements Bullets */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="text-[9px] text-slate-400 space-y-1 bg-slate-950/60 p-1.5 rounded border border-white/5 font-sans">
                        <span className="block text-[7.5px] uppercase font-mono font-bold text-slate-500 mb-0.5">Vacancy Requirements:</span>
                        {job.requirements.map((req, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span className="text-amber-500/70 select-none mt-0.5">•</span>
                            <span className="leading-snug text-slate-350">{req}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags block */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className={`text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        job.type === 'Full-time' 
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' 
                          : 'bg-purple-950 text-purple-300 border border-purple-500/20'
                      }`}>
                        {job.type}
                      </span>
                      <span className="text-[7.5px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded uppercase">
                        {job.category}
                      </span>
                      <span className="text-[7.5px] font-mono font-medium text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/10">
                        {job.salary}
                      </span>
                    </div>

                    {/* Skill tags */}
                    <div className="flex flex-wrap items-center gap-1 bg-black/20 p-1 rounded border border-white/5">
                      <span className="text-[7px] font-mono text-slate-500 uppercase font-bold mr-1">Skills:</span>
                      {job.skillsRequired.map(skill => (
                        <span key={skill} className="text-[7.5px] font-mono bg-slate-900 border border-white/5 text-slate-300 px-1 py-0.2 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Apply Action block */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1.5">
                      <div className="text-[8.5px] text-slate-500 font-mono">
                        Posted: {job.postedDate} • <span className="text-amber-400 font-bold">{job.applicantsCount || 0} applicants</span>
                      </div>
                      
                      {hasApplied ? (
                        <button
                          disabled
                          type="button"
                          className="bg-emerald-950 text-emerald-400 border border-emerald-500/35 font-bold text-[8.5px] uppercase tracking-wider px-3 py-1 rounded-md flex items-center gap-1 select-none"
                        >
                          <Check className="w-3 h-3 text-emerald-400 font-bold" />
                          Applied
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApplyToJob(job.id)}
                          className="bg-amber-500 text-[#020512] hover:bg-amber-400 font-extrabold text-[8.5px] uppercase tracking-wider px-3 py-1 rounded-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-2.5 h-2.5 text-slate-950" />
                          Apply with Resume
                        </button>
                      )}
                    </div>

                    {job.isCustomAlumniSubmission && job.submittedByAlumniName && (
                      <div className="text-[8px] font-mono text-amber-500/60 bg-amber-950/10 border border-amber-500/10 p-1 rounded">
                        Referral Sponsor: AU Alumni {job.submittedByAlumniName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER Applications subtab */}
      {subTab === 'applications' && (
        <div className="space-y-2 animate-fadeIn text-left">
          {myApplications.length === 0 ? (
            <div className="bg-[#040814] border border-white/5 rounded-xl p-8 text-center text-slate-500 text-[10px]">
              <FileText className="w-6 h-6 text-slate-600 mx-auto mb-2 animate-bounce" />
              You have not submitted any resumes to vacancies yet. Browse open posts to begin matching.
            </div>
          ) : (
            <div className="space-y-2 pr-0.5">
              {myApplications.map(app => {
                const associatedJob = allJobs.find(j => j.id === app.jobId);
                return (
                  <div key={app.id} className="bg-[#050916] border border-white/5 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[7.5px] font-mono text-slate-500 uppercase">APP ID: {app.id}</span>
                      <span className="text-[7.5px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase">
                        {app.status}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-black text-white uppercase">{associatedJob?.title || 'Unknown Placement Opportunity'}</h4>
                      <div className="text-[9px] text-slate-400 font-mono flex items-center gap-1 uppercase">
                        <span>{associatedJob?.company || 'Corporate Partner Node'}</span>
                        <span>•</span>
                        <span className="text-slate-500">{associatedJob?.location}</span>
                      </div>
                    </div>

                    <div className="bg-white/5 h-[1.5px] my-1" />

                    <div className="space-y-1 font-sans">
                      <div className="text-[8.5px] text-slate-400 font-mono uppercase font-bold text-slate-500">Submitted Resume Match:</div>
                      <p className="text-[9px] text-slate-300 italic">"{app.resumeSummary}"</p>
                    </div>

                    {app.resumeSkills && app.resumeSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {app.resumeSkills.map(skill => (
                          <span key={skill} className="text-[7px] font-mono bg-slate-900 border border-white/10 text-slate-350 px-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[8px] font-mono text-slate-500 pt-1.5 border-t border-white/2 bg-black/10 p-1 rounded">
                      Digital timestamp: {app.appliedDate} • Autoseeded from secure campus database.
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER Resume builder */}
      {subTab === 'resume' && (
        <form onSubmit={handleSaveResume} className="bg-[#040813] border border-white/5 rounded-xl p-3.5 space-y-3.5 text-left animate-fadeIn">
          <div className="space-y-1 border-b border-white/5 pb-2.5">
            <h3 className="text-[12px] font-mono font-extrabold text-white uppercase flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Institutional Digital Resume Matcher
            </h3>
            <p className="text-[9px] text-slate-400 leading-normal">
              Specify your skills, project, and training highlights. When you click quick apply, this state info is auto-extracted and submitted.
            </p>
          </div>

          <div className="space-y-3.5 text-slate-300 text-xs">
            <div className="space-y-1">
              <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Professional Summary / Objective</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A high contrast summary of your strengths, goals, and core system architectures you've built..."
                rows={2}
                className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs font-sans resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Skills Profile (Comma Separated)</label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="e.g. React, TypeScript, Node.js, Python, Cybersecurity, Wireshark"
                className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs font-mono"
              />
              <span className="block text-[7.5px] text-slate-500 font-mono mt-0.5">Separate tags with a standard comma symbol so search parameters can extract correctly.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Education Credentials</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science, AU (Grad 2026)"
                  className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Industrial Experience</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 6 Months Web intern at Maddilapalem hub"
                  className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs font-sans"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Engineering Projects Portfolio</label>
              <textarea
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                placeholder="Describe key systems, hardware scanners, or custom secure web apps you have engineered."
                rows={2}
                className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs font-sans resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-[#020512] hover:bg-amber-400 font-extrabold text-[9px] uppercase tracking-wider py-2 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
          >
            <Check className="w-4 h-4 text-slate-950 font-bold" />
            Save Master Resume
          </button>
        </form>
      )}

      {/* Alumni Post Referral Center */}
      {subTab === 'post-referral' && (overrideCurrentUser.role === 'Alumni' || overrideCurrentUser.isDeveloper) && (
        <form onSubmit={handlePostReferralSubmission} className="bg-[#030712] border border-white/5 rounded-xl p-3.5 space-y-3.5 text-left animate-fadeIn">
          <div className="space-y-1 border-b border-white/5 pb-2.5">
            <h3 className="text-[12px] font-mono font-extrabold text-white uppercase flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              Sponsor Corporate Referral Entry
            </h3>
            <p className="text-[9px] text-slate-400 leading-normal">
              Active AU Alumni: Publish direct referral pipelines inside the community. Verified students can view and auto-apply instantly.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Job / Internship Title</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Cyber Security Specialist"
                  className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs text-slate-200 mt-1"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Partner Company / Firm</label>
                <input
                  type="text"
                  required
                  value={postCompany}
                  onChange={(e) => setPostCompany(e.target.value)}
                  placeholder="e.g. Google DeepMind India"
                  className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs text-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Employment Type</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as any)}
                  className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs text-slate-200 mt-1 font-sans"
                >
                  <option value="Full-time">Full-time Role</option>
                  <option value="Internship">Internship (Stipended)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Role Category</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs text-slate-200 mt-1 font-sans"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI & ML">AI & ML Research</option>
                  <option value="Cybersecurity">Cybersecurity Analyst</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Embedded Systems">Embedded Systems & Scanners</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Compensation Packages / Stipend</label>
                <input
                  type="text"
                  value={postSalary}
                  onChange={(e) => setPostSalary(e.target.value)}
                  placeholder="e.g. ₹9,00,000 - ₹12,00,000 / year"
                  className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs text-slate-200 mt-1"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Work Location</label>
                <input
                  type="text"
                  required
                  value={postLocation}
                  onChange={(e) => setPostLocation(e.target.value)}
                  placeholder="e.g. Hyd / Remote-first"
                  className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs text-slate-200 mt-1"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Detailed Role Overview</label>
              <textarea
                value={postDesc}
                onChange={(e) => setPostDesc(e.target.value)}
                placeholder="High contrast description of the everyday deliverables, telemetry, and business growth parameters..."
                rows={2}
                className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs text-slate-200 mt-1 font-sans resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Technical Requirements (One per line)</label>
              <textarea
                value={postReqsStr}
                onChange={(e) => setPostReqsStr(e.target.value)}
                placeholder="e.g. Mastered React state rehydration&#13;Hands-on biometric security auditing"
                rows={2}
                className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs text-slate-200 mt-1 font-mono resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[8.5px] text-slate-400 font-mono font-bold uppercase">Filter Skill Tags (Comma Separated)</label>
              <input
                type="text"
                value={postSkillsStr}
                onChange={(e) => setPostSkillsStr(e.target.value)}
                placeholder="React, TypeScript, Cyber, Py"
                className="w-full text-white bg-[#03091e] border border-cyan-500/25 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 text-xs text-slate-200 mt-1 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 text-[#020512] hover:bg-emerald-400 font-extrabold text-[9px] uppercase tracking-wider py-2 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <PlusCircle className="w-4 h-4 text-slate-950 font-bold" />
            Publish Referral Opportunity
          </button>
        </form>
      )}
    </div>
  );
};
