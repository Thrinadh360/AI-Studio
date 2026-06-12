import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Volume2, 
  PlusCircle, 
  User, 
  Calendar, 
  ThumbsUp, 
  CornerDownRight, 
  Shield, 
  Layers, 
  Sparkles, 
  Hash, 
  X,
  FileText,
  Bookmark
} from 'lucide-react';
import { ClientDatabase } from '../clientDb';
import { DiscussionTopic, DiscussionComment } from '../types';

interface BroadcastBoardProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
  overrideCurrentUser?: any;
}

export const BroadcastBoard: React.FC<BroadcastBoardProps> = ({ db, onRefreshAll, overrideCurrentUser }) => {
  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(null);
  
  // Simulation Active Operator State
  const [activeAuthorId, setActiveAuthorId] = useState<number>(overrideCurrentUser?.id || 101); // Default to HOD Dr. A. Siva Prasad
  const [commentText, setCommentText] = useState('');
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (overrideCurrentUser?.id) {
      setActiveAuthorId(overrideCurrentUser.id);
    }
  }, [overrideCurrentUser]);
  
  // Topic Creator State (Staff only)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState<'SYLLABUS' | 'ASSIGNMENT' | 'ANNOUNCEMENT' | 'GENERAL' | 'RESEARCH'>('ANNOUNCEMENT');

  useEffect(() => {
    setTopics([...db.getDiscussionTopics()]);
  }, [db]);

  useEffect(() => {
    if (topics.length && !selectedTopic) {
      setSelectedTopic(topics[0]);
    } else if (selectedTopic) {
      // Keep selected sync
      const fresh = topics.find(t => t.id === selectedTopic.id);
      if (fresh) {
        setSelectedTopic(fresh);
      }
    }
  }, [topics, selectedTopic]);

  const allUsers = db.getUsers();
  const sortedUsersForSelect = allUsers.sort((a, b) => {
    if (a.role === 'Staff' || a.role === 'HOD') return -1;
    if (b.role === 'Staff' || b.role === 'HOD') return 1;
    return a.fullName.localeCompare(b.fullName);
  });

  const activeUserObj = allUsers.find(u => u.id === activeAuthorId) || allUsers[0];
  const isStaff = activeUserObj.role === 'Staff' || activeUserObj.role === 'Admin' || activeUserObj.role === 'HOD';

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicDesc.trim()) return;

    const topic = db.addDiscussionTopic(
      newTopicTitle,
      newTopicDesc,
      newTopicCategory,
      activeAuthorId
    );

    if (topic) {
      const updated = [...db.getDiscussionTopics()];
      setTopics(updated);
      setSelectedTopic(topic);
      setNewTopicTitle('');
      setNewTopicDesc('');
      setShowCreateModal(false);
      onRefreshAll();
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTopic) return;

    db.addDiscussionComment(
      selectedTopic.id,
      commentText,
      activeAuthorId,
      activeReplyCommentId || undefined
    );

    setCommentText('');
    setActiveReplyCommentId(null);
    setTopics([...db.getDiscussionTopics()]);
    onRefreshAll();
  };

  const handleLikeComment = (cmtId: string) => {
    if (!selectedTopic) return;
    db.likeDiscussionComment(selectedTopic.id, cmtId);
    setTopics([...db.getDiscussionTopics()]);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'SYLLABUS':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'ASSIGNMENT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'RESEARCH':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'ANNOUNCEMENT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-white/5';
    }
  };

  // Organize nested threads nicely
  const getCommentHierarchy = (comments: DiscussionComment[]) => {
    const directComments = comments.filter(c => !c.replyToCommentId);
    const repliesMap: { [key: string]: DiscussionComment[] } = {};
    
    comments.forEach(c => {
      if (c.replyToCommentId) {
        if (!repliesMap[c.replyToCommentId]) {
          repliesMap[c.replyToCommentId] = [];
        }
        repliesMap[c.replyToCommentId].push(c);
      }
    });

    return { directComments, repliesMap };
  };

  const { directComments, repliesMap } = selectedTopic 
    ? getCommentHierarchy(selectedTopic.comments) 
    : { directComments: [], repliesMap: {} };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fadeIn">
      
      {/* SIMULATED ROLE SWAP CONTROL BAR */}
      <div className="lg:col-span-12 bg-[#090f23] p-4 border border-cyan-500/15 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/50 rounded-xl border border-cyan-500/20 text-[#00f2ff]">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black font-orbitron text-white uppercase tracking-wider">Broadcaster Simulation Session</h4>
            <p className="text-[10px] text-slate-500 font-mono">Switch your operational identity card below to comment or initiate discussions.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[11px] font-bold font-mono text-slate-400 shrink-0">OPERATOR ID:</span>
          <select
            value={activeAuthorId}
            onChange={(e) => {
              setActiveAuthorId(Number(e.target.value));
              setActiveReplyCommentId(null);
            }}
            className="bg-slate-950 text-white text-xs border border-cyan-500/25 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 font-mono flex-1 sm:w-[240px]"
          >
            {sortedUsersForSelect.map(u => (
              <option key={u.id} value={u.id}>
                [{u.role}] {u.fullName} {u.role === 'Staff' && u.designation ? `(${u.designation})` : ''}
              </option>
            ))}
          </select>

          {isStaff ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#00f2ff] to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-slate-950 font-black font-mono px-4 py-1.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <PlusCircle className="w-4 h-4" /> NEW TOPIC
            </button>
          ) : (
            <span className="bg-slate-950/60 border border-white/5 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-500 uppercase shrink-0">
              STUDENT ROLE ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* LEFT AREA: TOPIC FEEDS & BROADCAST CATEGORIES */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-5 shadow-xl">
          <span className="text-[10px] font-black font-mono text-cyan-400 uppercase tracking-widest block mb-4 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#00f2ff]" /> Active Broadcast Feeds
          </span>

          <div className="space-y-3 pr-1">
            {topics.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No active discussion channels found.
              </div>
            ) : (
              topics.map((t) => {
                const isActive = selectedTopic?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTopic(t);
                      setActiveReplyCommentId(null);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between group ${
                      isActive 
                        ? 'bg-cyan-950/20 border-cyan-500/35 shadow-inner' 
                        : 'bg-slate-950/55 border-white/5 hover:bg-slate-900/40 hover:border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${getCategoryColor(t.category)}`}>
                          {t.category}
                        </span>
                        <span className="text-[8px] text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className={`text-xs font-bold leading-tight ${isActive ? 'text-cyan-400' : 'text-white group-hover:text-[#00f2ff]'}`}>
                        {t.title}
                      </h4>
                      <p className="text-[10.5px] text-slate-400 mt-1 lines-clamp-2 line-clamp-2 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-cyan-500/5 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                      <span className="truncate">By: {t.initiatedByName}</span>
                      <span className="text-[#00f2ff] font-bold bg-[#031c2d] px-1.5 py-0.2 rounded border border-cyan-500/10">
                        {t.comments.length} responses
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT AREA: THE MASTER THREAD INSPECTOR */}
      <div className="lg:col-span-7">
        {selectedTopic ? (
          <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between min-h-[580px]">
            <div>
              {/* TOPIC HEADER METADATA */}
              <div className="border-b border-cyan-500/10 pb-5">
                <div className="flex gap-4 items-start">
                  <img 
                    src={selectedTopic.initiatedByPhoto} 
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-cyan-500/20" 
                    alt="Initiator" 
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border mr-2 ${getCategoryColor(selectedTopic.category)}`}>
                      {selectedTopic.category}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-mono">
                      {new Date(selectedTopic.createdAt).toLocaleString()}
                    </span>

                    <h3 className="text-sm font-black text-white uppercase tracking-tight mt-1.5 font-orbitron">
                      {selectedTopic.title}
                    </h3>

                    <p className="text-[10px] text-[#00f2ff] font-mono mt-0.5">
                      Initiator: {selectedTopic.initiatedByName} ({selectedTopic.initiatedByRole})
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-white/5 mt-4 text-left">
                  {selectedTopic.description}
                </p>
              </div>

              {/* PARTICIPANTS RESPONSE TREE */}
              <div className="my-6 space-y-4 pr-1">
                <h5 className="text-[9.5px] font-black text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  Ecosystem Responses ({selectedTopic.comments.length})
                </h5>

                {selectedTopic.comments.length === 0 ? (
                  <div className="text-center py-6 text-slate-600 text-xs font-mono border border-dashed border-white/5 rounded-xl">
                    No classroom participation recorded yet. Be the first to start!
                  </div>
                ) : (
                  directComments.map(c => {
                    const replies = repliesMap[c.id] || [];
                    return (
                      <div key={c.id} className="space-y-3">
                        {/* Parent comment */}
                        <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-xl text-left relative group">
                          {/* Top Author profile */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <img src={c.authorPhoto} className="w-6 h-6 rounded-full object-cover" alt="" />
                              <div>
                                <span className="text-xs font-bold text-white block leading-none">{c.authorName}</span>
                                <span className={`text-[8.5px] font-mono ${c.authorRole === 'Staff' || c.authorRole === 'HOD' ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                                  {c.authorRole.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            <span className="text-[8.5px] text-slate-500 font-mono">
                              {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-snug font-sans pl-1">
                            {c.text}
                          </p>

                          {/* Footer action buttons */}
                          <div className="mt-3 pt-2.5 border-t border-cyan-500/5 flex items-center justify-between text-[9px] font-mono">
                            <button
                              onClick={() => handleLikeComment(c.id)}
                              className="text-slate-500 hover:text-emerald-400 transition-all flex items-center gap-1"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              Liked ({c.likes || 0})
                            </button>

                            <button
                              onClick={() => {
                                setActiveReplyCommentId(c.id);
                                // Focus text area
                                document.getElementById('broadcast-text-area')?.focus();
                              }}
                              className="text-slate-500 hover:text-[#00f2ff] transition-all font-bold flex items-center gap-1 uppercase"
                            >
                              <CornerDownRight className="w-3 h-3 text-[#00f2ff]" />
                              Reply
                            </button>
                          </div>
                        </div>

                        {/* Indented Nested replies from other students or staff */}
                        {replies.map(reply => (
                          <div key={reply.id} className="ml-6 border-l-2 border-emerald-500/25 pl-4 space-y-2 text-left animate-fadeIn">
                            <div className="bg-[#0b172a] border border-[#10b981]/15 p-3.5 rounded-xl relative">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <img src={reply.authorPhoto} className="w-5 h-5 rounded-full object-cover border border-[#10b981]/25" alt="" />
                                  <div>
                                    <span className="text-[11px] font-black text-slate-100 flex items-center gap-1">
                                      {reply.authorName}
                                      <span className="bg-[#112d26] text-emerald-400 text-[7.5px] font-bold px-1 py-0.2 rounded border border-emerald-500/20 uppercase font-mono">
                                        REPLY
                                      </span>
                                    </span>
                                    <span className="text-[8.5px] text-slate-500 font-mono block leading-none">
                                      Conveying follow-on response to {c.authorName}
                                    </span>
                                  </div>
                                </div>

                                <span className="text-[8px] text-slate-500 font-mono">
                                  {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <p className="text-xs text-slate-300 leading-snug pl-1">
                                {reply.text}
                              </p>

                              <div className="mt-3 pt-2.5 border-t border-[#10b981]/10 flex items-center justify-between text-[9px] font-mono">
                                <button
                                  onClick={() => handleLikeComment(reply.id)}
                                  className="text-slate-500 hover:text-emerald-400 transition-all flex items-center gap-1"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                  Liked ({reply.likes || 0})
                                </button>

                                <button
                                  onClick={() => {
                                    // Set reply targeted to parent comment
                                    setActiveReplyCommentId(c.id);
                                    document.getElementById('broadcast-text-area')?.focus();
                                  }}
                                  className="text-slate-500 hover:text-cyan-400 transition-all font-bold flex items-center gap-1"
                                >
                                  <CornerDownRight className="w-3 h-3" /> Reply To Parent
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RESPONSE POST INPUT BOX */}
            <div className="border-t border-cyan-500/10 pt-5 mt-auto bg-slate-950/20 p-3 rounded-xl">
              {activeReplyCommentId && (
                <div className="bg-emerald-950/20 border border-emerald-500/35 p-2 rounded-lg mb-3 flex justify-between items-center font-mono text-[10px] text-emerald-300">
                  <span className="flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5 text-emerald-400" />
                    CONVEY REPLY TO COMMENTS: #{activeReplyCommentId} ({selectedTopic.comments.find(co => co.id === activeReplyCommentId)?.authorName})
                  </span>
                  <button 
                    onClick={() => setActiveReplyCommentId(null)}
                    className="hover:text-white text-slate-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handlePostComment} className="flex gap-3">
                <input
                  type="text"
                  id="broadcast-text-area"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    activeReplyCommentId 
                      ? "Extend or convey a reply on this student response..." 
                      : "Type your comment or response for classroom discussion..."
                  }
                  className="bg-slate-950 text-white border border-cyan-500/25 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#00f2ff]/60 flex-1 font-mono outline-none"
                />
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-mono px-5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> SUBMIT
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-[#0b1226]/80 border border-cyan-500/10 rounded-2xl p-8 shadow-xl text-center py-20 flex flex-col justify-center items-center text-slate-500 text-xs font-mono">
            <Bookmark className="w-12 h-12 text-slate-700 animate-bounce mb-3" />
            Please select a broadcast discussion channel from the left feed to inspect responses.
          </div>
        )}
      </div>

      {/* TAILORED STAFF TOPIC CREATOR MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#050b18] border border-cyan-500/35 rounded-2xl p-6 w-full max-w-md text-left relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00f2ff]"></div>

            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 hover:text-white text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-black text-white font-orbitron uppercase tracking-wider mb-2 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#00f2ff]" />
              Initiate Discussion Channel
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mb-4">Broadcast announcements or academic topics directly to students.</p>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] text-slate-400 uppercase font-mono font-bold">Topic Title</label>
                <input
                  type="text"
                  required
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="e.g. Final Lab Practical Dates and Grading Maps"
                  className="w-full text-white bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00f2ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-slate-400 uppercase font-mono font-bold">Category Scope</label>
                <select
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value as any)}
                  className="w-full text-white bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00f2ff] font-mono"
                >
                  <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                  <option value="SYLLABUS">SYLLABUS</option>
                  <option value="ASSIGNMENT">ASSIGNMENT</option>
                  <option value="GENERAL">GENERAL</option>
                  <option value="RESEARCH">RESEARCH</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-slate-400 uppercase font-mono font-bold">Scope / Description details</label>
                <textarea
                  required
                  rows={4}
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  placeholder="Type official details, syllabus questions, paper references..."
                  className="w-full text-white bg-slate-950 border border-cyan-500/15 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00f2ff] font-mono"
                />
              </div>

              <p className="text-[9.5px] text-amber-500 font-mono italic">
                Publishing logs an irreversible action into the C-SYNC server timeline audits.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs uppercase tracking-wide font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-mono px-5 py-2 rounded-xl text-xs uppercase tracking-wide"
                >
                  Publish Broadcaster Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
