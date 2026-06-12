import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, Users, Radio, MessageSquare, Plus, PlusCircle, Shield,
  Terminal, Check, Copy, AlertCircle, Eye, Trash2, ShieldCheck, 
  Sparkles, Layers, Activity, Lock, Globe, Smartphone, RefreshCw, X, ChevronRight, Play, ArrowLeft, Video, Clock,
  Smile, Download, Paperclip, FileText, Image as ImageIcon, Mic, MapPin
} from 'lucide-react';
import { ClientDatabase } from '../clientDb';
import { ChatThread, ChatMessage, UserStory, CsyncApiProject, User } from '../types';
import { safeStorage } from '../utils/safeStorage';

const localStorage = safeStorage;

interface CsyncTelegramNetProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
  overrideCurrentUser?: User | null;
}

export const CsyncTelegramNet: React.FC<CsyncTelegramNetProps> = ({ db, onRefreshAll, overrideCurrentUser }) => {
  // Current active user identification (fallback to Mrs. Kalyani T / Satish Kumar if none logged in)
  const currentDBStudent = db.getCurrentStudent();
  const currentUser: { fullName: string; role: string; avatar: string } = overrideCurrentUser 
    ? { fullName: overrideCurrentUser.fullName, role: overrideCurrentUser.role, avatar: overrideCurrentUser.photoBlob || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }
    : currentDBStudent 
      ? { fullName: currentDBStudent.fullName, role: currentDBStudent.role, avatar: currentDBStudent.photoBlob || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }
      : { fullName: 'Mrs. Kalyani T.', role: 'Staff', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' };

  // Core internal states
  const [threads, setThreads] = useState<ChatThread[]>(db.getChatThreads());
  const [activeThreadId, setActiveThreadId] = useState<string>(() => {
    return localStorage.getItem('csync_active_chat_thread_id') || 'thread-motherbot';
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const defaultId = localStorage.getItem('csync_active_chat_thread_id') || 'thread-motherbot';
    return db.getChatMessages(defaultId);
  });
  const [inputText, setInputText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chats' | 'motherbot' | 'api-portal'>('chats');

  // Set chat tab active state globally on mount, reset on unmount
  useEffect(() => {
    (window as any).__csync_is_in_chat_tab = true;
    return () => {
      (window as any).__csync_is_in_chat_tab = false;
    };
  }, []);

  // Custom Creation states for Groups, Channels, Broadcasts, Communities, and Bots
  const [activeCreatorType, setActiveCreatorType] = useState<'none' | 'group' | 'channel' | 'broadcast' | 'community' | 'bot'>('none');
  const [creatorName, setCreatorName] = useState<string>('');
  const [creatorSelectedUsers, setCreatorSelectedUsers] = useState<number[]>([]);

  // Stories States
  const [stories, setStories] = useState<UserStory[]>(db.getUserStories());
  const [activeStory, setActiveStory] = useState<UserStory | null>(null);
  const [storyProgress, setStoryProgress] = useState<number>(0);
  const [isNewStoryOpen, setIsNewStoryOpen] = useState<boolean>(false);
  const [newStoryCaption, setNewStoryCaption] = useState<string>('');

  // MotherBot Compiler States
  const [newBotName, setNewBotName] = useState<string>('');
  const [botTriggers, setBotTriggers] = useState<{ phrase: string; response: string }[]>([
    { phrase: '/syllabus', response: '📚 *GDC Lab-B Practical Syllabus*: \n\n1. Simple live connection test programs\n2. Range checks in Visakhapatnam map locations\n3. Match student fingerprint and photo' },
    { phrase: '/wifi', response: '📶 *Secure Campus Wi-Fi Sentry*: \n\nSSID: `CSYNC-Lab-WiFi` \nPassword: `CollegeWiFiPass123` \nConnect simply without any special proxy settings!' }
  ]);
  const [tempPhrase, setTempPhrase] = useState<string>('');
  const [tempResponse, setTempResponse] = useState<string>('');
  const [compileSuccess, setCompileSuccess] = useState<boolean>(false);

  // Student API Hub States
  const [apiProjects, setApiProjects] = useState<CsyncApiProject[]>(db.getApiProjects());
  const [apiRequests, setApiRequests] = useState<any[]>(db.getApiRequests());
  const [newProjReason, setNewProjReason] = useState<string>('');
  const [newProjName, setNewProjName] = useState<string>('');
  const [newProjOrigins, setNewProjOrigins] = useState<string>('*');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // API Tester States
  const [testerToken, setTesterToken] = useState<string>('');
  const [testerEndpoint, setTesterEndpoint] = useState<string>('/api/auth/student-verify');
  const [testerPayload, setTesterPayload] = useState<string>('{\n  "idNumber": "STU-2026-05",\n  "mainCampusLat": 17.740697,\n  "mainCampusLon": 83.321251\n}');
  const [testerResult, setTesterResult] = useState<any | null>(null);
  const [testerRunning, setTesterRunning] = useState<boolean>(false);
  const [activeCodeLang, setActiveCodeLang] = useState<'js' | 'py' | 'curl'>('js');

  // Reactions State (Telegram reactions)
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({
    'm-g-1': { '👍': 4, '🚀': 2 },
    'm-g-2': { '❤️': 5, '🎉': 3 },
    'm-l-2': { '🔥': 4 }
  });

  // Emojis & Sticker Packs States
  const [showStickersTray, setShowStickersTray] = useState<boolean>(false);
  const [showAttachmentTray, setShowAttachmentTray] = useState<boolean>(false);
  const [chatFilter, setChatFilter] = useState<'all' | 'direct' | 'group' | 'broadcast' | 'community'>('all');
  const [pendingAttach, setPendingAttach] = useState<{ type: string; name: string; defaultTxt: string } | null>(null);
  const [activeStickerTab, setActiveStickerTab] = useState<'emojis' | 'stickers' | 'download-packs'>('emojis');
  const [installedPacks, setInstalledPacks] = useState<string[]>(['dev_pack']);
  
  // Custom downloads simulations
  const [downloadingPackId, setDownloadingPackId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Developer simulated Bot API variables
  const [botApiSubTab, setBotApiSubTab] = useState<'csync' | 'telegram-bot'>('csync');
  const [selectedBotIdForApi, setSelectedBotIdForApi] = useState<string>('thread-motherbot');
  const [mockWebhookUrl, setMockWebhookUrl] = useState<string>('');
  const [webhookLogs, setWebhookLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] CSYNC Webhook Listening Engine initialized...`
  ]);
  const [tempBotApiText, setTempBotApiText] = useState<string>('Hello from external simulated container cluster! 📡 plug and play.');
  const [botApiRunning, setBotApiRunning] = useState<boolean>(false);
  const [botApiResult, setBotApiResult] = useState<any | null>(null);

  // Conversational MotherBot state machine fields
  const [motherBotDialogStep, setMotherBotDialogStep] = useState<'idle' | 'awaiting_name' | 'awaiting_username' | 'awaiting_triggers'>('idle');
  const [pendingBotName, setPendingBotName] = useState<string>('');
  const [pendingBotUsername, setPendingBotUsername] = useState<string>('');

  const stickerPacks = [
    {
      id: 'dev_pack',
      name: 'MotherBot Developer Pack 💻',
      emoji: '💻',
      stickers: [
        { id: 'dev_sync', char: '🚀', label: 'CSYNC Active' },
        { id: 'dev_coffee', char: '☕', label: 'Dev Fuel' },
        { id: 'dev_bug', char: '🪲', label: 'Local Bug' },
        { id: 'dev_compiler', char: '🤖', label: 'Make New Bot' },
        { id: 'dev_matrix', char: '🧠', label: 'Connected Group' },
        { id: 'dev_lock', char: '🔒', label: 'Security Checked' }
      ]
    },
    {
      id: 'vizag_pack',
      name: 'Maddilapalem Beach Coasts 🌊',
      emoji: '🌊',
      stickers: [
        { id: 'beach_sun', char: '🌅', label: 'Vizag Coastline' },
        { id: 'beach_wave', char: '🌊', label: 'Campus Range OK' },
        { id: 'beach_boat', char: '🚢', label: 'Computer Connected' },
        { id: 'beach_fish', char: '🐠', label: 'Simple Test Connection' },
        { id: 'beach_sand', char: '🏖️', label: 'GDC Lab Sand' }
      ]
    },
    {
      id: 'pepe_pack',
      name: 'Telegram Pepe Frog Memes 🐸',
      emoji: '🐸',
      stickers: [
        { id: 'pepe_rich', char: '🤑', label: 'API Profit' },
        { id: 'pepe_brain', char: '🤯', label: 'Code Mix-up Error' },
        { id: 'pepe_cry', char: '😭', label: 'Wrong Login Code' },
        { id: 'pepe_cool', char: '😎', label: 'System Safe' },
        { id: 'pepe_pump', char: '🚀', label: 'Server Up' }
      ]
    },
    {
      id: 'prasad_sv_pack',
      name: 'HOD Dr. A. Siva Prasad Reactions 👴',
      emoji: '👴',
      stickers: [
        { id: 'hod_ok', char: '🌟', label: 'Approved Sentry' },
        { id: 'hod_angry', char: '🚨', label: 'Breach Detected' },
        { id: 'hod_learn', char: '📚', label: 'Lab Attendance' },
        { id: 'hod_sign', char: '🖊️', label: 'Digital Consent' },
        { id: 'hod_honor', char: '🏆', label: 'Gold Sentry Tier' }
      ]
    }
  ];

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Synchronize dynamic messages when thread shifts
  useEffect(() => {
    setMessages(db.getChatMessages(activeThreadId));
    localStorage.setItem('csync_active_chat_thread_id', activeThreadId);
  }, [activeThreadId, threads]);

  // Synchronize thread switching triggered externally (e.g. from the dynamic contact cards)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('csync_active_chat_thread_id');
      if (stored && stored !== activeThreadId) {
        setActiveThreadId(stored);
        setThreads(db.getChatThreads());
        setMessages(db.getChatMessages(stored));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 900);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [activeThreadId, db]);

  // Handle Stories interval countdown
  useEffect(() => {
    let interval: any;
    if (activeStory) {
      setStoryProgress(0);
      interval = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            setActiveStory(null);
            clearInterval(interval);
            return 0;
          }
          return prev + 2.5; // reaches 100 in 40 intervals = 4 seconds
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activeStory]);

  // Dynamic interactiveness: Typing simulation & periodic status updates
  useEffect(() => {
    const runSimulation = () => {
      const targetChoices = [
        { threadId: 'thread-lab-web', user: 'Priya Patel' },
        { threadId: 'thread-community', user: 'Mrs. Kalyani T.' },
        { threadId: 'thread-prasad', user: 'Dr. A. Siva Prasad' },
      ];
      
      const randomChoice = targetChoices[Math.floor(Math.random() * targetChoices.length)];
      
      // Start typing simulation
      setThreads(prev => prev.map(t => 
        t.id === randomChoice.threadId 
          ? { ...t, isTyping: true, typingUser: randomChoice.user } 
          : t
      ));

      // After 3.5 seconds, stop typing status
      setTimeout(() => {
        setThreads(prev => prev.map(t => 
          t.id === randomChoice.threadId 
            ? { ...t, isTyping: false, typingUser: undefined } 
            : t
        ));
      }, 3500);
    };

    const firstTimeout = setTimeout(runSimulation, 3000);
    const interval = setInterval(runSimulation, 16000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  // Send message
  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    
    let msgToSend = customText || inputText;
    
    // Check if we have a pending attachment to deliver
    if (!customText && pendingAttach) {
      msgToSend = `[Attachment:${pendingAttach.type}] ${pendingAttach.name} | ${inputText || pendingAttach.defaultTxt}`;
      setPendingAttach(null);
    }

    if (!msgToSend.trim()) return;

    // Send original user text packet
    const sentMsg = db.sendChatMessage(
      activeThreadId, 
      currentUser.fullName, 
      currentUser.role, 
      msgToSend
    );

    // Add local immediate message
    setMessages(db.getChatMessages(activeThreadId));
    if (!customText) setInputText('');

    // Reload threads to reflect lastMessage change
    setTimeout(() => {
      setThreads(db.getChatThreads());
      setMessages(db.getChatMessages(activeThreadId));
      onRefreshAll();
    }, 100);

    // MotherBot interactive state-flow
    if (activeThreadId === 'thread-motherbot') {
      const uText = msgToSend.trim();
      const uTextLower = uText.toLowerCase();

      if (motherBotDialogStep === 'idle') {
        if (uTextLower === '/newbot' || uTextLower.includes('new bot') || uTextLower.includes('create bot')) {
          setMotherBotDialogStep('awaiting_name');
          simulateMotherBotTyping("Yes! Let us create a brand new digital bot helper for our GDC Maddilapalem campus group. 🤖✨\n\nFirst, please type a clean, friendly name for your new bot helper (e.g., `Syllabus Sentry` or `Lab Assistant Helper`).");
          return;
        }

        // Default automated trigger answers or general chat
        const activeThr = threads.find(t => t.id === activeThreadId);
        if (activeThr) {
          setTimeout(() => {
            setMessages(db.getChatMessages(activeThreadId));
            setThreads(db.getChatThreads());
            onRefreshAll();
          }, 800);
        }
      }
      else if (motherBotDialogStep === 'awaiting_name') {
        const botNameInput = uText.replace(/[^a-zA-Z0-9 ]/g, '').trim();
        if (!botNameInput) {
          simulateMotherBotTyping("Ah! Please enter a proper name containing letters or numbers for your bot.");
          return;
        }
        setPendingBotName(botNameInput);
        setMotherBotDialogStep('awaiting_username');
        simulateMotherBotTyping(`Bot name saved: **${botNameInput}**! 🤖\n\nNow, select a unique username for your bot, which **must** end with \`_bot\` or \`Bot\` (e.g. \`${botNameInput.toLowerCase().replace(/\s+/g, '_')}_bot\`). Please do not use empty spaces!`);
        return;
      }
      else if (motherBotDialogStep === 'awaiting_username') {
        let uNameInput = uText.trim().replace(/[^a-zA-Z0-9_]/g, '');
        if (!uNameInput.toLowerCase().endsWith('_bot') && !uNameInput.toLowerCase().endsWith('bot')) {
          uNameInput += '_bot';
        }
        setPendingBotUsername(uNameInput);
        setMotherBotDialogStep('awaiting_triggers');
        simulateMotherBotTyping(`Perfect! Bot username locked: **@${uNameInput}** ✨\n\nNow, let's write what the bot should reply when someone asks something. Type it simply in this format: \`trigger_word: reply_message\`.\n\nExample:\n\`/practical: Practical exam starts at 10 AM in Lab-B!\`\n\nWrite your command reply message, or say \`skip\` to use our standard Comp Science syllabus details.`);
        return;
      }
      else if (motherBotDialogStep === 'awaiting_triggers') {
        let triggersList = [
          { phrase: '/syllabus', response: '📚 CSE syllabus loaded successfully!' },
          { phrase: '/wifi', response: '📶 SSID bounds active. Proxy verified.' }
        ];

        if (uTextLower !== 'skip') {
          const splitIdx = uText.indexOf(':');
          if (splitIdx !== -1) {
            const word = uText.substring(0, splitIdx).trim();
            const reply = uText.substring(splitIdx + 1).trim();
            if (word && reply) {
              triggersList = [{ phrase: word, response: reply }];
            }
          }
        }

        // Spawn custom chatbot seamlessly inside local database memory!
        const spawnedBot = db.createCustomBot(
          pendingBotName,
          currentUser.fullName,
          triggersList,
          'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=100&h=100'
        );

        setMotherBotDialogStep('idle');
        setPendingBotName('');
        setPendingBotUsername('');

        simulateMotherBotTyping(`🎉 **CONGRATULATIONS! BOT HELPER IS READY!**\n\nI have successfully launched **@${pendingBotUsername}** for our Maddilapalem college systems!\n\nYou can click on it in your Active Chats list on the left side to try it out immediately, or use this special login code to connect with your own code: \`bot_token_${Math.random().toString(36).substring(2, 9)}\`. Feel free to test now!`);
        return;
      }
    } else {
      // General bot automatic replies
      const activeThr = threads.find(t => t.id === activeThreadId);
      if (activeThr && (activeThr.type === 'bot' || activeThr.id.startsWith('thread-bot-'))) {
        setTimeout(() => {
          setMessages(db.getChatMessages(activeThreadId));
          setThreads(db.getChatThreads());
          onRefreshAll();
        }, 800);
      }
    }
  };

  const simulateMotherBotTyping = (textToSend: string) => {
    setTimeout(() => {
      const botReply: ChatMessage = {
        id: `msg-mother-${Date.now()}`,
        threadId: 'thread-motherbot',
        senderName: 'MotherBot',
        senderRole: 'Staff',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isBot: true
      };
      db.chatMessages.push(botReply);

      // Update MotherBot thread last active message
      const thr = db.chatThreads.find(t => t.id === 'thread-motherbot');
      if (thr) {
        thr.lastMessage = textToSend.replace(/\n/g, ' ').substring(0, 47) + '...';
        thr.lastMessageTime = botReply.timestamp;
      }

      setThreads(db.getChatThreads());
      setMessages(db.getChatMessages(activeThreadId));
      onRefreshAll();
    }, 1100);
  };

  // Add Emoji reaction to any selected message in real-time
  const addEmojiReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => {
      const msgReacts = prev[msgId] || {};
      const count = msgReacts[emoji] || 0;
      return {
        ...prev,
        [msgId]: {
          ...msgReacts,
          [emoji]: count + 1
        }
      };
    });
    db.addLog('SYSTEM', `Student reacted with [${emoji}] to packet sequence [${msgId}].`, 'info');
  };

  // Downloading a sticker pack simulation handler
  const handleDownloadPack = (packId: string) => {
    setDownloadingPackId(packId);
    setDownloadProgress(0);

    const timer = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setInstalledPacks((prevPacks) => [...prevPacks, packId]);
          setDownloadingPackId(null);
          db.addLog('SYSTEM', `Successfully loaded and registered Telegram Pack [${packId}] into visual RAM.`, 'success');
          return 0;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Simulated Webhook Dispatch Logger
  const handleSimulateWebhook = () => {
    if (!mockWebhookUrl.trim()) return;
    const testLog = `[${new Date().toLocaleTimeString()}] Dev-trigger client -> POST ${mockWebhookUrl} -> Auth payload active -> RECEIVED: 200 OK.`;
    setWebhookLogs((prev) => [testLog, ...prev]);
    db.addLog('SYSTEM', `Triggered simulated developer webhook dispatcher on: ${mockWebhookUrl}`, 'info');
  };

  // Send visual sticker message
  const handleSendSticker = (stickerChar: string, stickerLabel: string) => {
    handleSendMessage(undefined, `[Sticker] ${stickerChar} - ${stickerLabel}`);
    setShowStickersTray(false);
  };

  // Developer simulated Bot API execute
  const executeBotApiCall = () => {
    setBotApiRunning(true);
    setBotApiResult(null);

    const selectedBot = threads.find(t => t.id === selectedBotIdForApi) || threads[0] || { id: 'thread-motherbot', name: 'MotherBot', type: 'bot' as const };

    setTimeout(() => {
      setBotApiRunning(false);
      
      // Dispatch simulated developer payload directly into database messages log!
      const botDispMsg = db.sendChatMessage(
        selectedBot.id,
        "C-SYNC API Client",
        "Admin",
        `🔌 [Developer SDK API Handshake]:\n${tempBotApiText || 'Test Handshake parameters active'}`
      );

      // Reload chat details view
      setMessages(db.getChatMessages(activeThreadId));
      setThreads(db.getChatThreads());
      onRefreshAll();

      setBotApiResult({
        ok: true,
        endpoint: "/api/v1/bot/sendMessage",
        result: {
          message_id: Math.floor(Math.random() * 80000) + 12000,
          from: {
            id: 9382404,
            is_bot: true,
            first_name: selectedBot.name.replace(/[^a-zA-Z0-9 ]/g, '').trim(),
            username: `${selectedBot.name.toLowerCase().replace(/[^a-z]/g, '')}_bot`
          },
          chat: {
            id: selectedBot.id,
            type: selectedBot.type
          },
          date: Math.floor(Date.now() / 1000),
          text: tempBotApiText || "Test Handshake parameters active"
        },
        webhook_status: mockWebhookUrl ? "RELAYED_SUCCESS" : "NO_WEBHOOK_DECLARED",
        server_uptime_ms: 142231
      });

      // Log webhook callback if active
      if (mockWebhookUrl) {
        setWebhookLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] BOT API Relay callback: Student verified -> Webhook ${mockWebhookUrl} dispatched payload: "${tempBotApiText}" -> Response 200 OK`,
          ...prev
        ]);
      }

      db.addLog('SYSTEM', `API client posted message payload directly to bot: ${selectedBot.name}`, 'success');
    }, 1000);
  };

  // Create status story
  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryCaption.trim()) return;

    db.createUserStory(
      currentUser.fullName,
      currentUser.avatar,
      newStoryCaption,
      currentUser.role
    );

    setStories(db.getUserStories());
    setNewStoryCaption('');
    setIsNewStoryOpen(false);
    onRefreshAll();
  };

  // Submit API Development Request
  const handleCreateApiProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    db.submitApiRequest(newProjName, currentUser.fullName, newProjOrigins, newProjReason || 'Developing campus RFID/BLE corridor triggers');
    setApiRequests(db.getApiRequests());
    setApiProjects(db.getApiProjects());
    setNewProjName('');
    setNewProjOrigins('*');
    setNewProjReason('');
    onRefreshAll();
  };

  // Revoke API Keys
  const handleRevokeApi = (id: string) => {
    db.deleteApiProject(id);
    setApiProjects(db.getApiProjects());
    onRefreshAll();
  };

  // Save triggers to builder script
  const handleAddTrigger = () => {
    if (!tempPhrase.trim() || !tempResponse.trim()) return;
    setBotTriggers(prev => [...prev, { phrase: tempPhrase.trim(), response: tempResponse.trim() }]);
    setTempPhrase('');
    setTempResponse('');
  };

  // Compile bot via MotherBot wizard panel
  const handleCompileBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim() || botTriggers.length === 0) return;

    const spawnedBot = db.createCustomBot(
      newBotName,
      currentUser.fullName,
      botTriggers,
      'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=100&h=100'
    );

    setThreads(db.getChatThreads());
    setActiveThreadId(spawnedBot.id);
    setActiveTab('chats');
    setNewBotName('');
    setBotTriggers([
      { phrase: '/syllabus', response: '📚 Syllabus loaded for UG computer science.' },
      { phrase: '/wifi', response: '📶 SSID bounds active.' }
    ]);
    setCompileSuccess(true);
    setTimeout(() => setCompileSuccess(false), 5000);
    onRefreshAll();
  };

  const executeApiSimulation = () => {
    if (!testerToken.trim()) {
      alert('Security token is required to authenticate handshakes.');
      return;
    }
    setTesterRunning(true);
    setTesterResult(null);

    // Find if token matches any active apiProject to increment requests counted
    const isValid = db.incrementApiRequests(testerToken.trim());

    setTimeout(() => {
      setTesterRunning(false);
      if (!isValid) {
        setTesterResult({
          error_code: "AUTHENTICATION_FAILED",
          message: "Secure token signature invalid. Verification terminated.",
          signature_match: false,
          station_access: "DENIED",
          server_epoch: Date.now()
        });
        db.addLog('DEV', `C-SYNC Student API Request failed: Invalid token signatures.`, 'error');
      } else {
        const payloadData = JSON.parse(testerPayload || '{}');
        const searchId = payloadData.idNumber || "STU-2026-01";
        const foundUser = db.getUsers().find(u => u.idNumber === searchId);

        if (testerEndpoint === '/api/auth/student-verify') {
          if (foundUser) {
            setTesterResult({
              status_code: 200,
              handshake: "OK_SECURE",
              timestamp: new Date().toISOString(),
              student_identity: {
                fullName: foundUser.fullName,
                idNumber: foundUser.idNumber,
                streakIndex: foundUser.streak || 14,
                reputationScore: foundUser.reputationScore || 95,
                approvedSentryPass: foundUser.approvalStatus || 'APPROVED'
              },
              coordinates_geofenced: {
                latitude: 17.740697,
                longitude: 83.321251,
                status: "INSIDE_CAMPUS_POLYGON"
              },
              api_license: "CSYNC-CAMPUS-UNLIMITED-FREE"
            });
            db.addLog('DEV', `API Trigger verified successfully for ${foundUser.fullName}.`, 'success');
          } else {
            setTesterResult({
              status_code: 404,
              handshake: "IDENTITY_NOT_FOUND",
              message: `Student sequence ID "${searchId}" does not reside in local cache.`,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          // stations telemetry
          setTesterResult({
            status_code: 200,
            handshake: "OK_TELEMETRY",
            active_stations: [
              { id: "CS-01", status: "ONLINE", current_bypass_code: "Thrinadh", active_user: "None" },
              { id: "CS-02", status: "ONLINE", current_bypass_code: "2026SENTRY", active_user: "None" },
              { id: "CS-03", status: "OFFLINE", current_bypass_code: "None", active_user: "None" }
            ],
            heatwave_level: db.getWeather().heatwaveRisk || "LOW",
            regional_precipitation: db.getWeather().condition
          });
        }
      }
      setApiProjects(db.getApiProjects());
      onRefreshAll();
    }, 1200);
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedToken(txt);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  // Dynamic code blocks to generate for C-SYNC students
  const getCodeSnippet = () => {
    const selectedProj = apiProjects[0] || { apiKey: 'csync_api_example_key_9f3b' };
    const apiK = selectedProj.apiKey;

    if (activeCodeLang === 'js') {
      return `// JavaScript Fetch Implementation\nconst verifyStudentOnCampus = async () => {\n  const res = await fetch('https://${window.location.host || 'c-sync.campus.edu'}${testerEndpoint}', {\n    method: 'POST',\n    headers: {\n      'X-Csync-Api-Key': '${apiK}',\n      'Content-Type': 'application/json'\n    },\n    body: JSON.stringify(${testerPayload})\n  });\n  \n  const payload = await res.json();\n  console.log('Handshake response:', payload);\n};`;
    } else if (activeCodeLang === 'py') {
      return `# Python requests library\nimport requests\n\nurl = "https://${window.location.host || 'c-sync.campus.edu'}${testerEndpoint}"\nheaders = {\n    "X-Csync-Api-Key": "${apiK}",\n    "Content-Type": "application/json"\n}\npayload = ${testerPayload}\n\nresponse = requests.post(url, headers=headers, json=payload)\nprint("Handshake Code:", response.status_code)\nprint(response.json())`;
    } else {
      return `# Raw terminal verification\ncurl -X POST "https://${window.location.host || 'c-sync.campus.edu'}${testerEndpoint}" \\\n  -H "X-Csync-Api-Key: ${apiK}" \\\n  -H "Content-Type: application/json" \\\n  -d '${testerPayload.replace(/\s+/g, '')}'`;
    }
  };

  const getTelegramBotCodeSnippet = () => {
    const selectedBot = threads.find(t => t.id === selectedBotIdForApi) || { id: 'thread-motherbot', name: 'MotherBot' };

    if (activeCodeLang === 'js') {
      return `// Nodejs Telegram Bot API - Send Message\nconst fetch = require('node-fetch');\n\nconst sendBotMessage = async () => {\n  const token = "bot_token_86b72a8c0";\n  const url = \`https://api.telegram.org/bot\${token}/sendMessage\`;\n\n  const response = await fetch(url, {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      chat_id: "${selectedBot.id}",\n      text: "${tempBotApiText || 'Hello World'}"\n    })\n  });\n\n  const data = await response.json();\n  console.log("Telegram respondent payload:", data);\n};`;
    } else if (activeCodeLang === 'py') {
      return `# Python Custom Telegram Bot wrapper\nimport requests\n\ntoken = "bot_token_86b72a8c0"\nurl = f"https://api.telegram.org/bot{token}/sendMessage"\n\npayload = {\n    "chat_id": "${selectedBot.id}",\n    "text": "${tempBotApiText || 'Hello World'}"\n}\n\nres = requests.post(url, json=payload)\nprint("Response Status:", res.status_code)\nprint("Payload:", res.json())`;
    } else {
      return `# Raw terminal telegram dispatch\ncurl -X POST "https://api.telegram.org/bot_token_86b72a8c0/sendMessage" \\\n  -H "Content-Type: application/json" \\\n  -d '{"chat_id": "${selectedBot.id}", "text": "${tempBotApiText || 'Hello World'}"}'`;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1 text-slate-200">
      
      {/* FULL-CANVAS TOPSTORIES LAYOUT (TELEGRAM AVATARS FEEDS) */}
      <div className="col-span-12 bg-slate-950/80 border border-cyan-500/10 p-5 rounded-2xl relative">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/5">
          <span className="text-[10px] font-mono text-[#00f2ff] uppercase font-black tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            Live CAMPUS NetStories • Status Feed
          </span>
          <button 
            onClick={() => setIsNewStoryOpen(true)}
            className="flex items-center gap-1 text-[8.5px] bg-[#022a30] text-[#00f2ff] border border-cyan-500/30 px-2 py-1 rounded font-mono uppercase hover:bg-cyan-950 cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Insert Story
          </button>
        </div>

        {/* Story Circle avatars list */}
        <div className="flex items-center gap-4.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => {
                setActiveStory(story);
                setStoryProgress(0);
              }}
              className="flex flex-col items-center shrink-0 focus:outline-none group cursor-pointer"
            >
              <div className="relative p-0.5 rounded-full ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 group-hover:scale-105 transition-all">
                <img 
                  src={story.avatar} 
                  className="w-11 h-11 rounded-full object-cover border border-slate-900" 
                  referrerPolicy="no-referrer" 
                  alt="" 
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-cyan-500 border border-slate-950 rounded-full flex items-center justify-center text-[7px] text-white font-black">
                  {story.role === 'HOD' ? '★' : '●'}
                </span>
              </div>
              <span className="text-[9px] text-slate-300 font-mono mt-1.5 uppercase font-bold tracking-tight truncate w-14 text-center">{story.fullName.split(' ')[0]}</span>
              <span className="text-[7px] text-slate-500 font-mono lowercase">{story.timestamp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* STORY DETAIL MODAL (TRANSIENT COUNTDOWN SCREEN) */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fadeIn select-none">
          <div className="relative w-full max-w-sm bg-[#060a16] border border-cyan-500/25 rounded-2xl p-5 overflow-hidden text-left shadow-2xl">
            
            {/* Top progress indicators */}
            <div className="w-full h-1 bg-slate-900 rounded overflow-hidden mb-4 flex">
              <div className="bg-[#00f2ff] h-full transition-all duration-100" style={{ width: `${storyProgress}%` }}></div>
            </div>

            <div className="flex justify-between items-center mb-4.5">
              <div className="flex items-center gap-3">
                <img src={activeStory.avatar} className="w-8 h-8 rounded-full border border-cyan-400" referrerPolicy="no-referrer" alt="" />
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">{activeStory.fullName}</h4>
                  <span className="text-[8px] font-mono text-cyan-400 uppercase">{activeStory.role} SENTRY</span>
                  {activeStory.createdAt && (
                    <span className="block text-[7px] text-pink-400 font-mono tracking-tight lowercase">
                      ⏳ expires in {Math.max(1, Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - activeStory.createdAt)) / (1000 * 60 * 60)))}h
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setActiveStory(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated atmospheric status text */}
            <div className="bg-slate-950/80 p-5 rounded-xl border border-white/5 min-h-[120px] mb-4.5 flex flex-col justify-between">
              <p className="font-sans text-[11px] leading-relaxed text-slate-100 font-semibold">
                "{activeStory.caption}"
              </p>
              
              <div className="text-[8px] font-mono text-zinc-500 flex justify-between uppercase mt-4">
                <span>🛰️ GPS STATION HANDSHAKE VERIFIED</span>
                <span>VIEWS: {activeStory.views + 12} CLICKS</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveStory(null)}
              className="w-full py-2 bg-slate-900 text-slate-300 font-mono text-[9px] uppercase border border-white/5 rounded-lg font-black hover:text-[#00f2ff] cursor-pointer"
            >
              Close Feed Scribe
            </button>
          </div>
        </div>
      )}

      {/* NEW STORY SUBMISSION BOX */}
      {isNewStoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
          <form onSubmit={handleCreateStory} className="bg-[#0b1226] border border-cyan-500/20 p-5 rounded-2xl max-w-sm w-full text-left font-mono">
            <div className="flex justify-between items-center mb-4 border-b border-cyan-500/10 pb-2">
              <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest">Share Sentry Story</h4>
              <button onClick={() => setIsNewStoryOpen(false)} type="button" className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[8.5px] block text-slate-500 mb-1">CAPTION OVERLAY (MAX 120 CHARACTERS)</label>
                <textarea
                  value={newStoryCaption}
                  onChange={(e) => setNewStoryCaption(e.target.value)}
                  maxLength={120}
                  rows={3}
                  placeholder="e.g. On the way to computer practical class. Attendance verified! 🚀"
                  className="w-full bg-slate-950 border border-white/10 p-3.5 rounded-lg text-xs focus:border-cyan-400 focus:outline-none leading-relaxed text-white"
                  required
                />
              </div>

              <div className="text-[8px] text-zinc-500 leading-normal pl-1 border-l-2 border-[#00f2ff]/30">
                Logged student *{currentUser.fullName}* is uploading from inside the college campus block.
              </div>

            </div>
          </form>
         </div>
       )}

      {/* CREATION WORKSHOP HUB MODAL */}
      {activeCreatorType !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fadeIn">
          <div className="bg-[#0b1226] border border-[#00f2ff]/30 p-5 rounded-2xl max-w-sm w-full text-left font-mono relative shadow-[0_0_50px_rgba(0,242,255,0.15)]">
            <button 
              type="button" 
              onClick={() => {
                setActiveCreatorType('none');
                setCreatorName('');
                setCreatorSelectedUsers([]);
              }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 mb-3 border-b border-[#00f2ff]/10 pb-2">
              {activeCreatorType === 'group' && <Users className="w-5 h-5 text-cyan-400" />}
              {activeCreatorType === 'channel' && <Radio className="w-5 h-5 text-amber-400" />}
              {activeCreatorType === 'broadcast' && <PlusCircle className="w-5 h-5 text-purple-400" />}
              {activeCreatorType === 'community' && <Globe className="w-5 h-5 text-emerald-400" />}
              {activeCreatorType === 'bot' && <Bot className="w-5 h-5 text-pink-400" />}
              
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Create {activeCreatorType}
              </h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block text-[8px] font-mono text-slate-400 uppercase font-extrabold tracking-widest">
                  {activeCreatorType === 'bot' ? 'Bot Identity Name' : `${activeCreatorType} Name`}
                </label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder={`e.g. My College ${activeCreatorType.toUpperCase()}`}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-lg text-white font-semibold focus:border-[#00f2ff] focus:outline-none"
                  required
                />
              </div>

              {activeCreatorType === 'group' && (
                <div className="space-y-1">
                  <label className="block text-[8px] font-mono text-slate-400 uppercase font-extrabold tracking-widest">
                    Add Members from Register
                  </label>
                  <div className="max-h-[160px] overflow-y-auto border border-white/5 bg-slate-950 p-2 rounded-lg space-y-1 scrollbar-none">
                    {db.getUsers()
                      .filter(user => user.fullName !== currentUser.fullName)
                      .map(user => {
                        const isSelected = creatorSelectedUsers.includes(user.id);
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setCreatorSelectedUsers(prev => prev.filter(id => id !== user.id));
                              } else {
                                setCreatorSelectedUsers(prev => [...prev, user.id]);
                              }
                            }}
                            className={`w-full text-left p-1.5 rounded flex items-center justify-between border cursor-pointer ${
                              isSelected 
                                ? 'bg-cyan-950/40 border-cyan-500/30 text-white' 
                                : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5'
                            }`}
                          >
                            <span className="text-[10px] font-medium">{user.fullName} ({user.role})</span>
                            {isSelected ? <Check className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <div className="w-3 h-3 rounded-full border border-white/20"></div>}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {activeCreatorType === 'bot' && (
                <div className="p-2 bg-pink-950/10 border border-pink-500/20 text-[8.5px] font-mono text-pink-300 rounded leading-normal">
                  🤖 Automatically compiles custom webhooks and trigger callbacks over client memory. Click initialize to complete stack!
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-4 font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCreatorType('none');
                    setCreatorName('');
                    setCreatorSelectedUsers([]);
                  }}
                  className="py-2 border border-white/5 text-slate-400 text-[9px] uppercase rounded-xl hover:text-white cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!creatorName.trim()}
                  onClick={() => {
                    if (!creatorName.trim()) return;
                    let newThr;
                    if (activeCreatorType === 'group') {
                      const membersNames = creatorSelectedUsers
                        .map(id => db.getUsers().find(u => u.id === id)?.fullName)
                        .filter(Boolean) as string[];
                      newThr = db.createGroup(creatorName.trim(), currentUser.fullName, [currentUser.fullName, ...membersNames]);
                    } else if (activeCreatorType === 'channel') {
                      newThr = db.createChannel(creatorName.trim(), currentUser.fullName);
                    } else if (activeCreatorType === 'broadcast') {
                      newThr = db.createBroadcast(creatorName.trim(), currentUser.fullName);
                    } else if (activeCreatorType === 'community') {
                      newThr = db.createCommunity(creatorName.trim(), currentUser.fullName);
                    } else if (activeCreatorType === 'bot') {
                      newThr = db.createCustomBot(creatorName.trim(), currentUser.fullName, [
                        { phrase: '/help', response: `🤖 ${creatorName.trim()} bot is operating. Request assistance anytime.` }
                      ]);
                    }
                    
                    setThreads(db.getChatThreads());
                    if (newThr) {
                      setActiveThreadId(newThr.id);
                    }
                    setActiveCreatorType('none');
                    setCreatorName('');
                    setCreatorSelectedUsers([]);
                    onRefreshAll();
                  }}
                  className="py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-[9px] uppercase rounded-xl hover:opacity-90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE SPLIT SCREEN CONTROLLER PANEL */}
      <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SWAPPING MODULE NAVIGATION SYSTEM */}
        <div className="lg:col-span-4 bg-[#090e1e]/90 border border-cyan-500/10 rounded-2xl p-4 flex flex-col h-[685px]">
          
          {/* TAB EXERTER SECTOR */}
          <div className="grid grid-cols-3 gap-1 bg-[#02050f] p-1.5 rounded-xl border border-white/5 mb-4">
            <button
              onClick={() => setActiveTab('chats')}
              className={`py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'chats' 
                  ? 'bg-cyan-950 text-[#00f2ff] border border-cyan-500/20 font-black shadow-md shadow-cyan-500/5' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chats
            </button>
            <button
              onClick={() => setActiveTab('motherbot')}
              className={`py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'motherbot' 
                  ? 'bg-pink-950/70 text-pink-300 border border-pink-500/20 font-black shadow-md shadow-pink-500/5' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              MotherBot
            </button>
            <button
              onClick={() => setActiveTab('api-portal')}
              className={`py-1.5 rounded-lg text-[9px] uppercase font-bold font-mono transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'api-portal' 
                  ? 'bg-purple-950/70 text-purple-300 border border-purple-500/20 font-black shadow-md shadow-purple-500/5' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              C-Sync API
            </button>
          </div>

          {/* DYNAMIC SIDEBAR LISTENER VIEWS */}
          <div className="flex-1 overflow-y-auto pr-0.5 space-y-2 select-none">
            {activeTab === 'chats' && (
              <div className="space-y-3">
                {/* Initiate New Chat Block */}
                <div className="bg-[#02050f]/80 p-2 text-center rounded-xl border border-cyan-500/15 space-y-1.5 font-mono text-[8.5px]">
                  <span className="text-[#00f2ff] font-extrabold block tracking-wider uppercase">💬 SECURE OFFLINE CHAT INITIATOR</span>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const targetUser = db.getUsers().find(u => u.id === parseInt(val));
                        if (targetUser) {
                          const newThread = db.createOrGetDirectChatThread(targetUser.id, currentUser.fullName);
                          setThreads(db.getChatThreads());
                          setActiveThreadId(newThread.id);
                          onRefreshAll();
                        }
                        e.target.value = ''; // Reset select
                      }
                    }}
                    className="w-full bg-slate-950 border border-cyan-500/25 text-[#00f2ff] px-2 py-1.5 text-[8.5px] rounded focus:outline-none focus:border-cyan-400 font-bold leading-tight cursor-pointer"
                  >
                    <option value="" className="text-slate-500">➕ START INTERACTION WITH...</option>
                    {db.getUsers()
                      .filter(u => u.fullName !== currentUser.fullName)
                      .map(u => (
                        <option key={u.id} value={u.id} className="bg-slate-950 text-slate-200">
                          {u.role === 'Staff' ? '👨‍🏫 ' : '🧑‍🎓 '}{u.fullName} ({u.role})
                        </option>
                      ))}
                  </select>

                  {/* Quick Creation Row */}
                  <div className="pt-1.5 border-t border-white/5 space-y-1">
                    <span className="text-zinc-500 block text-[7.5px] uppercase tracking-normal text-left">Or Initialize Cluster Nodes:</span>
                    <div className="grid grid-cols-5 gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveCreatorType('group')}
                        className="bg-[#0b1c2b] border border-cyan-500/20 text-[#00f2ff] text-[7.5px] py-1 rounded hover:bg-[#00384c] flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                        title="Create Group Chat"
                      >
                        <Users className="w-3 h-3 text-[#00f2ff]" />
                        <span className="text-[7px]">Group</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCreatorType('channel')}
                        className="bg-[#241d13] border border-amber-500/20 text-amber-400 text-[7.5px] py-1 rounded hover:bg-[#382b13] flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                        title="Launch Channel Feed"
                      >
                        <Radio className="w-3 h-3 text-amber-400" />
                        <span className="text-[7px]">Channel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCreatorType('broadcast')}
                        className="bg-[#1b1424] border border-purple-500/20 text-purple-400 text-[7.5px] py-1 rounded hover:bg-[#2b1438] flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                        title="Create Broadcast List"
                      >
                        <PlusCircle className="w-3 h-3 text-purple-400" />
                        <span className="text-[7px]">Bcast</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCreatorType('community')}
                        className="bg-[#13241b] border border-emerald-500/20 text-emerald-400 text-[7.5px] py-1 rounded hover:bg-[#143825] flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                        title="Spawn Community"
                      >
                        <Globe className="w-3 h-3 text-emerald-400" />
                        <span className="text-[7px]">Comm</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCreatorType('bot')}
                        className="bg-[#24131d] border border-pink-500/20 text-pink-400 text-[7.5px] py-1 rounded hover:bg-[#381425] flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                        title="Build Bot Helper"
                      >
                        <Bot className="w-3 h-3 text-pink-400" />
                        <span className="text-[7px]">Bot</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 px-1 border-b border-white/5 pb-2.5 items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'direct', label: 'Direct' },
                      { id: 'group', label: 'Groups' },
                      { id: 'broadcast', label: 'Broadcasts' },
                      { id: 'community', label: 'Communities' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setChatFilter(f.id as any)}
                        className={`text-[8px] font-mono font-bold px-2 py-1 rounded transition-colors cursor-pointer select-none border ${
                          chatFilter === f.id 
                            ? 'bg-[#00383b] text-[#00f2ff] border-[#00f2ff]/30 shadow-sm shadow-[#0aefe9]/10' 
                            : 'bg-slate-950/60 text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to completely purge and remove all pre-seeded mockup threads from memory?")) {
                        db.purgePreseededChatThreads();
                        const remaining = db.getChatThreads();
                        setThreads(remaining);
                        if (remaining.length > 0) {
                          setActiveThreadId(remaining[0].id);
                        } else {
                          setActiveThreadId('');
                        }
                        onRefreshAll();
                      }
                    }}
                    className="text-[7.5px] font-mono font-bold px-1.5 py-1 rounded bg-rose-950/40 border border-rose-500/20 text-rose-400 hover:bg-rose-900 cursor-pointer select-none"
                    title="Remove all pre-seeded template threads"
                  >
                    🧹 Purge Mockups
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-0.5 scrollbar-thin">
                  {threads
                    .filter(thr => chatFilter === 'all' || thr.type === chatFilter)
                    .map((thr) => {
                      const isActive = activeThreadId === thr.id;
                      let badgeCol = "bg-cyan-950 text-[#00f2ff] border-cyan-500/20";
                      if (thr.type === 'bot') badgeCol = "bg-pink-950 text-pink-300 border-pink-500/10";
                      if (thr.type === 'channel') badgeCol = "bg-amber-950 text-amber-300 border-amber-500/10";
                      if (thr.type === 'broadcast') badgeCol = "bg-purple-950 text-purple-300 border-purple-500/20";
                      if (thr.type === 'community') badgeCol = "bg-emerald-950 text-emerald-300 border-emerald-500/20";

                      return (
                        <div
                          key={thr.id}
                          onClick={() => setActiveThreadId(thr.id)}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-xl border text-left font-mono transition-all relative group cursor-pointer ${
                            isActive 
                              ? 'bg-[#030a1c] border-cyan-500/25 text-white shadow-xl shadow-cyan-500/5' 
                              : 'bg-transparent border-transparent text-slate-400 hover:bg-[#02050f]/60 hover:text-slate-200'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img src={thr.avatar} className="w-9 h-9 rounded-full object-cover border border-[#00f2ff]/10" referrerPolicy="no-referrer" alt="" />
                            {(thr.isOnline || thr.isTyping || thr.type === 'bot') ? (
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border border-slate-900 rounded-full animate-pulse ${
                                thr.isTyping ? 'bg-amber-400' : 'bg-emerald-500'
                              }`}></span>
                            ) : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-[10px] font-bold truncate tracking-tight uppercase">{thr.name}</span>
                              <span className="text-[7.5px] text-zinc-500 font-mono tracking-tight">{thr.lastMessageTime}</span>
                            </div>
                            
                            {thr.isTyping ? (
                              <p className="text-[9px] text-emerald-400 font-bold animate-pulse truncate tracking-tight py-0.5">
                                ✍️ {thr.typingUser || 'someone'} typing...
                              </p>
                            ) : (
                              <p className="text-[9px] text-slate-400 truncate tracking-tight leading-normal font-sans group-hover:text-slate-350">
                                {thr.lastMessage}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`text-[6px] px-1 border rounded uppercase font-black tracking-widest ${badgeCol}`}>
                                {thr.type}
                              </span>
                              {thr.botCreatedBy ? (
                                <span className="text-[6.2px] text-slate-500 lowercase">Host: {thr.botCreatedBy.split(' ')[0]}</span>
                              ) : thr.lastSeen && (
                                <span className="text-[6px] text-slate-500 uppercase font-black tracking-wider truncate max-w-24 select-none">
                                  {thr.lastSeen.replace('last seen ', '')}
                                </span>
                              )}
                              {thr.unreadCount > 0 && (
                                <span className="ml-auto bg-pink-500 text-white font-black text-[6.5px] px-1.5 py-0.2 rounded-full leading-none">
                                  {thr.unreadCount} NEW
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Hover Trash Action to delete chat thread */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to permanently delete user conversation / chat thread with "${thr.name}"?`)) {
                                db.deleteChatThread(thr.id);
                                const remaining = db.getChatThreads();
                                setThreads(remaining);
                                if (activeThreadId === thr.id) {
                                  if (remaining.length > 0) {
                                    setActiveThreadId(remaining[0].id);
                                  } else {
                                    setActiveThreadId('');
                                  }
                                }
                                onRefreshAll();
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 absolute right-1.5 top-1.5 bg-rose-950/90 hover:bg-rose-900 text-rose-400 p-1 rounded-md border border-rose-500/20 transition-opacity cursor-pointer z-10"
                            title="Delete Chat Thread"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {activeTab === 'motherbot' && (
              <div className="space-y-4 p-1 font-mono text-xs">
                <div>
                  <span className="text-[8px] font-black text-pink-400 block uppercase mb-1.5 tracking-wider">
                    🤖 BOT STATUS AND DETAILS:
                  </span>
                  <div className="bg-[#030612] border border-pink-500/10 p-3 rounded-xl space-y-2 text-[9px] text-slate-400 leading-normal">
                    <p className="flex justify-between"><span>Main system online:</span> <strong className="text-emerald-400">RUNNING</strong></p>
                    <p className="flex justify-between"><span>Total student bots:</span> <strong className="text-pink-300">{threads.filter(t => t.type === 'bot').length} bots</strong></p>
                    <p className="flex justify-between"><span>Practice playground location:</span> <strong className="text-zinc-500">Maddilapalem GDC</strong></p>
                    <div className="border-t border-white/5 pt-2 mt-2 font-mono text-[7.5px] text-zinc-500 leading-relaxed">
                      "I help you build simple chatbot helpers for our college. Just set your trigger words and your custom reply sentences!"
                    </div>
                  </div>
                </div>

                <div className="border border-pink-500/15 bg-pink-950/10 p-3 rounded-xl space-y-1">
                  <span className="text-[8.5px] font-bold text-pink-300 uppercase block">HOW TO USE BOTS:</span>
                  <p className="text-[9.5px] leading-relaxed text-slate-300">
                    Send <strong className="text-pink-400 font-mono">/help</strong> in any bot chat to see what question-answers it can handle!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'api-portal' && (
              <div className="space-y-4 p-1 text-xs">
                <div>
                  <span className="text-[8px] font-mono text-purple-400 block uppercase mb-1.5 tracking-wider font-bold">
                    🔑 ACTIVE DEV INTEGRATION KEYS ({apiProjects.length})
                  </span>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                    {apiProjects.length === 0 ? (
                      <p className="text-[9px] text-slate-500 font-mono italic">No approved active project keys yet.</p>
                    ) : (
                      apiProjects.map((p) => (
                        <div key={p.id} className="bg-slate-950/90 border border-purple-500/10 p-3 rounded-lg space-y-2 text-[9.5px]">
                          <div className="flex justify-between items-center border-b border-white/5 pb-1 select-none">
                            <strong className="text-white truncate max-w-45 font-mono uppercase text-[10px]">{p.projectName}</strong>
                            <button 
                              onClick={() => handleRevokeApi(p.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors p-0.5"
                              title="Delete this access key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="space-y-1 text-slate-400 text-[8.5px] leading-normal font-mono">
                            <div className="flex justify-between">
                              <span>Access Key:</span>
                              <span 
                                onClick={() => {
                                  copyText(p.apiKey);
                                  setTesterToken(p.apiKey);
                                }}
                                className="text-cyan-400 font-bold hover:underline cursor-pointer truncate max-w-24 select-all"
                              >
                                {copiedToken === p.apiKey ? 'Copied! ✅' : `${p.apiKey.substring(0, 11)}...`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Allowed URLs:</span>
                              <span className="text-purple-300 truncate max-w-28">{p.allowedOrigins}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Usage count:</span>
                              <span className="text-white bg-purple-950 px-1.5 rounded-full text-[8px] font-black">{p.totalRequests} times used</span>
                            </div>
                            {p.lastRequestAt && (
                              <div className="flex justify-between">
                                  <span>Last active:</span>
                                <span className="text-slate-500 text-[8px]">{p.lastRequestAt}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2.5">
                  <span className="text-[8px] font-mono text-purple-400 block uppercase mb-1.5 tracking-wider font-bold select-none">
                    🛰️ SENTRY ACCESS REQUESTS PIPELINE
                  </span>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                    {apiRequests.map((req) => {
                      let statusStyle = "border-amber-500/20 text-amber-400 bg-amber-950/10";
                      if (req.status === 'APPROVED') statusStyle = "border-emerald-500/25 text-emerald-400 bg-emerald-950/10";
                      if (req.status === 'REJECTED') statusStyle = "border-rose-500/25 text-rose-400 bg-rose-950/10";

                      return (
                        <div key={req.id} className="bg-slate-950/40 border border-white/5 p-2.5 rounded-lg space-y-1.5 text-[9px] font-mono">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold truncate max-w-[120px] uppercase">{req.projectName}</span>
                            <span className={`px-1 text-[7px] border rounded font-black ${statusStyle}`}>
                              {req.status}
                            </span>
                          </div>
                          <div className="text-[8px] text-slate-400 space-y-0.5 leading-normal">
                            <p className="truncate text-[8.5px]">Owner: {req.ownerName}</p>
                            <p className="text-slate-500 truncate">Origins: {req.allowedOrigins}</p>
                            <p className="text-slate-500 border-l border-purple-500/20 pl-1.5 py-0.5 italic text-[8px]">"{req.reason}"</p>
                            {req.rejectionReason && (
                              <p className="text-rose-400 font-bold mt-1 text-[8px] bg-rose-950/20 p-1 rounded border border-rose-500/10"><strong className="font-extrabold uppercase">Reject Note:</strong> {req.rejectionReason}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {apiRequests.length === 0 && (
                      <p className="text-[9px] text-slate-500 font-mono italic">No requests submitted yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-cyan-500/5 pt-3.5 mt-3 text-center">
            <span className="text-[7.5px] text-zinc-500 font-mono uppercase select-none">CSYNC Secure Messenger Platform</span>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL CHATS FRAME OR ACTIVE CONTROLLERS */}
        <div className="lg:col-span-8 bg-[#090e1e]/90 border border-cyan-500/10 rounded-2xl h-[685px] flex flex-col relative overflow-hidden">
          
          {activeTab === 'chats' ? (
            <>
              {/* Active thread header bar */}
              {(() => {
                const thread = threads.find(t => t.id === activeThreadId);
                if (!thread) return null;

                return (
                  <div className="bg-[#030713]/80 border-b border-cyan-500/10 px-5 py-3 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                      <img src={thread.avatar} className="w-8 h-8 rounded-full object-cover border border-[#00f2ff]/20" referrerPolicy="no-referrer" alt="" />
                      <div>
                        <h4 className="text-xs font-black text-white font-mono uppercase tracking-tight">{thread.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            thread.isTyping ? 'bg-amber-400 animate-pulse' : thread.isOnline || thread.type === 'bot' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                          }`}></span>
                          {thread.isTyping ? (
                            <span className="text-[8px] text-[#00f2ff] uppercase font-black font-mono animate-bounce">
                              ✍️ {thread.typingUser || 'someone'} is typing...
                            </span>
                          ) : thread.isOnline || thread.type === 'bot' ? (
                            <span className="text-[8px] text-emerald-400 uppercase font-bold font-mono">
                              active online
                            </span>
                          ) : thread.lastSeen ? (
                            <span className="text-[8px] text-slate-500 uppercase font-bold font-mono">
                              {thread.lastSeen}
                            </span>
                          ) : (
                            <span className="text-[8px] text-slate-500 uppercase font-bold font-mono truncate max-w-48" title={thread.members?.join(', ')}>
                               {thread.members?.join(', ') || 'Secure C-Sync Node'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <span className="text-[7.5px] font-mono text-[#00f2ff] bg-cyan-950/40 border border-[#00f2ff]/20 px-1.5 py-0.5 rounded uppercase font-black">{thread.type}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#01040d]/40 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                    <AlertCircle className="w-8 h-8 opacity-40 text-purple-400" />
                    <p className="font-mono text-xs">No active telegram-grade packets stored in this frame.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderName === currentUser.fullName;
                    
                    let senderTagColor = "text-[#00f2ff]";
                    if (m.senderRole === "Staff" || m.senderRole === "HOD") senderTagColor = "text-pink-400";
                    if (m.isBot) senderTagColor = "text-purple-400 font-bold";

                    const textVal = m.text || '';
                    const isSticker = textVal.startsWith('[Sticker] ');
                    const stickerContent = isSticker ? textVal.replace('[Sticker] ', '') : '';
                    const stickerChar = stickerContent.split(' - ')[0] || '';
                    const stickerLabel = stickerContent.split(' - ')[1] || 'Sticker';

                    const isAttachment = textVal.startsWith('[Attachment:');
                    let attachmentType = '';
                    let attachmentName = '';
                    let messageBody = textVal;

                    if (isAttachment) {
                      const match = textVal.match(/^\[Attachment:([^\]]+)\] ([^|]+) \| (.*)$/);
                      if (match) {
                        attachmentType = match[1]; // File, Image, Audio, Location
                        attachmentName = match[2]; // e.g. syllabus_lab3_v2.pdf
                        messageBody = match[3];    // text body
                      }
                    }

                    const msgReacts = reactions[m.id] || {};

                    return (
                      <div 
                        key={m.id} 
                        className={`flex flex-col max-w-[85%] font-mono text-xs group relative ${
                          isMe ? 'ml-auto items-end text-right' : 'mr-auto items-start text-left'
                        }`}
                      >
                        {/* Reaction quick-hover bar */}
                        <div className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-[#0d1527] border border-cyan-500/30 rounded-full px-2 py-1 flex gap-1.5 shadow-lg ${
                          isMe ? '-left-20' : '-right-20'
                        }`}>
                          {['👍', '❤️', '🔥', '😂', '🚀', '🎉'].map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => addEmojiReaction(m.id, emoji)}
                              className="hover:scale-130 transition-transform active:scale-95 text-[11px] cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 mb-1 select-none">
                          <span className={`text-[8.5px] font-bold uppercase ${senderTagColor}`}>
                            {m.isBot ? '🤖 ' : ''}{m.senderName} 
                          </span>
                          <span className="text-[7.5px] text-zinc-600 font-medium">({m.senderRole})</span>
                        </div>

                        {isSticker ? (
                          <div className="p-3 bg-slate-950/40 border border-cyan-500/10 rounded-2xl flex flex-col items-center shadow-md animate-bounceIn">
                            <span className="text-5xl my-2 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:scale-115 transition-transform duration-300 pointer-events-none">
                              {stickerChar}
                            </span>
                            <span className="text-[7.2px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest">
                              {stickerLabel}
                            </span>
                          </div>
                        ) : isAttachment ? (
                          <div className={`p-3 rounded-2xl border text-left leading-relaxed text-[11px] max-w-sm ${
                            isMe 
                              ? 'bg-[#002f35]/50 border-cyan-500/20 text-[#ddf6f8] rounded-tr-none' 
                              : 'bg-slate-950/80 border-white/5 text-slate-200 rounded-tl-none'
                          }`}>
                            {attachmentType === 'File' && (
                              <div className="bg-[#030713]/90 border border-purple-500/30 p-2.5 rounded-xl flex items-center gap-3 shadow-lg my-0.5 max-w-[280px]">
                                <div className="p-2 bg-purple-950/60 rounded-lg text-purple-400 border border-purple-500/10 flex items-center justify-center">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] font-bold text-slate-100 truncate uppercase select-all">{attachmentName}</div>
                                  <div className="text-[7px] text-purple-300 font-mono mt-0.5 uppercase">845 KB • secure attachment</div>
                                </div>
                                <button type="button" className="p-1 px-2 border border-cyan-500/20 rounded bg-cyan-950/20 text-[#00f2ff] hover:bg-[#00f2ff] hover:text-slate-950 transition-colors text-[8px] font-bold uppercase cursor-pointer select-none">
                                  GET
                                </button>
                              </div>
                            )}

                            {attachmentType === 'Image' && (
                              <div className="bg-[#030713]/90 border border-cyan-500/30 p-1.5 rounded-xl flex flex-col gap-1.5 shadow-lg my-0.5 max-w-[200px]">
                                <div className="relative rounded-lg overflow-hidden h-24 bg-slate-900 border border-white/5">
                                  <img 
                                    src={attachmentName.includes('map') || attachmentName.includes('geofence')
                                      ? 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop'
                                      : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop'
                                    }
                                    alt={attachmentName}
                                    className="w-full h-full object-cover opacity-80"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute top-1 left-1 bg-[#01040d]/80 border border-[#00f2ff]/30 text-[#00f2ff] text-[6px] font-mono font-black px-1 rounded uppercase">
                                    IMAGE
                                  </div>
                                </div>
                                <div className="px-1 text-[8.5px] text-cyan-300 font-bold truncate select-all">{attachmentName}</div>
                              </div>
                            )}

                            {attachmentType === 'Audio' && (
                              <div className="bg-[#030713]/90 border border-pink-500/30 p-2 rounded-xl flex items-center gap-2.5 shadow-lg my-0.5 max-w-[260px]">
                                <button type="button" className="w-7 h-7 rounded-full bg-pink-950/80 border border-pink-500/35 text-pink-400 flex items-center justify-center hover:bg-pink-900 cursor-pointer text-[10px] shrink-0 font-bold font-sans">
                                  ▶
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] font-bold text-pink-300 truncate lowercase">{attachmentName}</div>
                                  <div className="flex items-end gap-0.5 h-3 mt-1.5 select-none opacity-60">
                                    {[2,4,3,7,3,5,2,4,5,3,4,2,5,3,4].map((h, i) => (
                                      <span key={i} className="w-0.5 bg-[#00f2ff] rounded-t" style={{ height: `${h * 15}%` }}></span>
                                    ))}
                                  </div>
                                </div>
                                <span className="text-[7.5px] text-zinc-500 font-mono shrink-0">1:28</span>
                              </div>
                            )}

                            {attachmentType === 'Location' && (
                              <div className="bg-[#030713]/90 border border-emerald-500/30 p-1.5 rounded-xl flex flex-col gap-1.5 shadow-lg my-0.5 max-w-[200px]">
                                <div className="relative rounded-lg overflow-hidden h-20 bg-slate-900 border border-emerald-500/15">
                                  <img 
                                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop"
                                    alt="map preview"
                                    className="w-full h-full object-cover opacity-60"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-base">
                                    📍
                                  </div>
                                </div>
                                <div className="px-1 text-[8px] leading-tight text-emerald-400 font-mono font-bold select-all tracking-tight break-all lowercase">{attachmentName}</div>
                              </div>
                            )}

                            {messageBody && (
                              <p className="mt-2 text-slate-200 border-t border-white/5 pt-1 whitespace-pre-line tracking-tight leading-relaxed select-all">
                                {messageBody}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className={`p-3.5 rounded-2xl border text-left leading-relaxed text-[11px] whitespace-pre-line ${
                            isMe 
                              ? 'bg-[#002f35]/50 border-cyan-500/20 text-[#ddf6f8] rounded-tr-none' 
                              : m.isBot 
                                ? 'bg-pink-950/20 border-pink-500/20 text-pink-100 rounded-tl-none font-sans font-medium'
                                : 'bg-slate-950/80 border-white/5 text-slate-200 rounded-tl-none'
                          }`}>
                            {m.text}
                          </div>
                        )}

                        {/* Reaction Display Badges */}
                        {Object.keys(msgReacts).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 select-none">
                            {Object.entries(msgReacts).map(([emoji, count]) => (
                              <span 
                                key={emoji} 
                                className="inline-flex items-center gap-1 text-[8.5px] bg-[#022129] text-[#00f2ff] border border-cyan-500/20 rounded-full px-2 py-0.5 font-mono font-bold animate-pulse"
                              >
                                {emoji} <span className="text-[7.5px] text-cyan-400">{count}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <span className="text-[7px] text-[#556b7c] mt-1 pl-1 pr-1">{m.timestamp}</span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Stickers & Emojis Slider Drawer Frame */}
              {showStickersTray && (
                <div className="bg-[#050b18] border-t border-cyan-500/20 p-3 shrink-0 flex flex-col gap-2.5 max-h-48 overflow-y-auto">
                  {/* Tray Tabs */}
                  <div className="flex gap-1 border-b border-white/5 pb-2">
                    <button
                      type="button"
                      onClick={() => setActiveStickerTab('emojis')}
                      className={`text-[8.5px] px-2.5 py-1.5 font-mono uppercase rounded font-bold cursor-pointer ${
                        activeStickerTab === 'emojis' ? 'bg-[#004e54] text-[#00f2ff]' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      😃 Emojis
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStickerTab('stickers')}
                      className={`text-[8.5px] px-2.5 py-1.5 font-mono uppercase rounded font-bold cursor-pointer ${
                        activeStickerTab === 'stickers' ? 'bg-[#004e54] text-[#00f2ff]' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🏷️ Stickers
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStickerTab('download-packs')}
                      className={`text-[8.5px] px-2.5 py-1.5 font-mono uppercase rounded font-bold cursor-pointer flex items-center gap-1 ${
                        activeStickerTab === 'download-packs' ? 'bg-pink-950 text-pink-300' : 'text-pink-400/80 hover:text-white'
                      }`}
                    >
                      <Download className="w-3 h-3 text-pink-400" /> Telegram Sticker Market
                    </button>
                  </div>

                  {/* Tray content panels */}
                  {activeStickerTab === 'emojis' && (
                    <div className="grid grid-cols-8 gap-1.5 p-1">
                      {['😀', '😂', '😍', '🚀', '🔥', '💻', '💡', '🧠', '⚙️', '🛡️', '🔒', '📶', '🔑', '👍', '🎉', '🏆', '👽', '🤖', '📱', '📡', '👀', '🌊', '⚓', '🎓'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setInputText(prev => prev + emoji)}
                          className="p-1.5 text-lg hover:scale-130 transition-transform cursor-pointer text-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeStickerTab === 'stickers' && (
                    <div className="space-y-3 p-1">
                      {stickerPacks.filter(p => installedPacks.includes(p.id)).map(pack => (
                        <div key={pack.id} className="space-y-1.5">
                          <span className="text-[7.5px] font-mono text-slate-500 uppercase font-black">{pack.name}</span>
                          <div className="flex flex-wrap gap-2">
                            {pack.stickers.map(st => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => handleSendSticker(st.char, st.label)}
                                className="bg-[#030712] border border-white/5 px-2.5 py-1 rounded-xl flex items-center gap-1.5 hover:border-cyan-500/40 text-[10px] text-slate-300 hover:text-white cursor-pointer transition-colors"
                                title={st.label}
                              >
                                <span className="text-base">{st.char}</span>
                                <span className="text-[7px] font-mono capitalize">{st.label.split(' ')[0]}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeStickerTab === 'download-packs' && (
                    <div className="space-y-2 p-1">
                      {stickerPacks.map(pack => {
                        const isInstalled = installedPacks.includes(pack.id);
                        const isDownloading = downloadingPackId === pack.id;

                        return (
                          <div key={pack.id} className="flex justify-between items-center bg-slate-950/60 p-2 border border-white/5 rounded-lg text-[9px]">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{pack.emoji}</span>
                              <div>
                                <span className="font-bold text-slate-200">{pack.name}</span>
                                <span className="text-[7px] text-zinc-500 block lowercase">{pack.stickers.length} official vector stickers</span>
                              </div>
                            </div>

                            {isInstalled ? (
                              <span className="text-[7.5px] text-emerald-400 font-bold border border-emerald-500/20 bg-emerald-950/40 px-1.5 py-0.5 rounded font-mono">
                                INSTALLED
                              </span>
                            ) : isDownloading ? (
                              <div className="w-24 bg-slate-900 border border-white/5 rounded overflow-hidden">
                                <div className="bg-[#00f2ff] text-[6.5px] font-mono font-black text-center text-slate-950 py-0.5" style={{ width: `${downloadProgress}%` }}>
                                  {downloadProgress}%
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDownloadPack(pack.id)}
                                className="px-2 py-1 bg-cyan-950 text-cyan-400 border border-cyan-500/25 rounded hover:bg-cyan-900 text-[8px] font-black cursor-pointer uppercase flex items-center gap-1"
                              >
                                <Download className="w-2.5 h-2.5" /> GET FREE
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {showAttachmentTray && (
                <div className="bg-[#050b18] border-t border-cyan-500/20 p-3 shrink-0 flex flex-col gap-2 animate-fadeIn max-h-44 overflow-y-auto">
                  <span className="text-[7.5px] font-mono text-cyan-400 block uppercase font-black tracking-widest mb-1">
                    📂 Please select any file to send:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { type: 'File', name: 'college_lab_bypass_keys.sql', defaultTxt: 'Offline college computer special bypass login keys.' },
                      { type: 'File', name: 'wifi_connection_checker.py', defaultTxt: 'Simple connection checking script for student computers.' },
                      { type: 'Image', name: 'college_campus_map.png', defaultTxt: 'Visakhapatnam GDC campus map with student range bounds.' },
                      { type: 'Image', name: 'lab_computer_photo.jpg', defaultTxt: 'College CS computer room diagnostics photo.' },
                      { type: 'Audio', name: 'teacher_lecture_notes.mp3', defaultTxt: 'Mrs Kalyani teacher audio record with practical syllabus guidelines.' },
                      { type: 'Location', name: 'Dr. V.S. Krishna Govt Degree College, Maddilapalem', defaultTxt: 'College location coordinates mapped to GPS.' }
                    ].map((asset, idx) => {
                      let assetIcon = <FileText className="w-3.5 h-3.5" />;
                      let assetColor = 'text-purple-400 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-950/20';
                      if (asset.type === 'Image') {
                        assetIcon = <ImageIcon className="w-3.5 h-3.5" />;
                        assetColor = 'text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-950/20';
                      }
                      if (asset.type === 'Audio') {
                        assetIcon = <Mic className="w-3.5 h-3.5" />;
                        assetColor = 'text-pink-400 border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-950/20';
                      }
                      if (asset.type === 'Location') {
                        assetIcon = <MapPin className="w-3.5 h-3.5" />;
                        assetColor = 'text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-950/20';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPendingAttach(asset);
                            setShowAttachmentTray(false);
                          }}
                          className={`flex items-center gap-2 p-2 border rounded-xl cursor-pointer text-left font-mono transition-colors bg-[#02050f]/60 ${assetColor}`}
                        >
                          {assetIcon}
                          <div className="min-w-0">
                            <div className="text-[8.5px] font-bold truncate leading-none mb-0.5">{asset.name}</div>
                            <div className="text-[6.5px] opacity-60 uppercase tracking-wider">{asset.type} ATTACH</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pending attachment banner above the form */}
              {pendingAttach && (
                <div className="mx-3 my-1.5 p-2 bg-slate-950/90 border border-cyan-500/25 rounded-xl flex items-center justify-between animate-fadeIn text-[9px] font-mono shrink-0">
                  <div className="flex items-center gap-2 text-[#00f2ff]">
                    <span className="text-sm">
                      {pendingAttach.type === 'File' && '📄'}
                      {pendingAttach.type === 'Image' && '🖼️'}
                      {pendingAttach.type === 'Audio' && '🎤'}
                      {pendingAttach.type === 'Location' && '📍'}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold uppercase select-none">{pendingAttach.type}: </span>
                      <span className="text-slate-300 truncate font-black">{pendingAttach.name}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setPendingAttach(null)}
                    className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Chat Text Input */}
              <form onSubmit={handleSendMessage} className="bg-[#030713]/80 border-t border-[#00f2ff]/10 p-3 flex gap-2 shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowStickersTray(!showStickersTray);
                    setShowAttachmentTray(false);
                  }}
                  className={`p-2.5 border rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer ${
                    showStickersTray 
                      ? 'bg-cyan-950 text-[#00f2ff] border-cyan-500/40' 
                      : 'bg-[#01040a] text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Smile className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAttachmentTray(!showAttachmentTray);
                    setShowStickersTray(false);
                  }}
                  className={`p-2.5 border rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer ${
                    showAttachmentTray 
                      ? 'bg-cyan-950 text-[#00f2ff] border-cyan-500/40' 
                      : 'bg-[#01040a] text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="Share attachments"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    activeThreadId === 'thread-motherbot'
                      ? motherBotDialogStep === 'awaiting_name'
                        ? "Enter display name for your new chatbot..."
                        : motherBotDialogStep === 'awaiting_username'
                          ? "Enter chatbot username ending in _bot..."
                          : motherBotDialogStep === 'awaiting_triggers'
                            ? "Format like: /trigger: Response or type 'skip'..."
                            : "Type /newbot or click the compiler to spawn bot..."
                      : "Broadcast message... Telegram mesh secure"
                  }
                  className="flex-1 bg-[#01040a] border border-white/10 px-4 py-2.5 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-[#00f2ff] placeholder:text-slate-600"
                  required={!pendingAttach}
                />
                <button
                  type="submit"
                  className="p-2.5 bg-[#004e54] text-[#00f2ff] border border-cyan-500/35 rounded-xl hover:bg-cyan-950 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : activeTab === 'motherbot' ? (
            /* MOTHERBOT COMPILER SCREEN */
            <div className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-xs text-left">
              
              <div className="flex items-start gap-4 border-b border-pink-500/10 pb-4">
                <div className="bg-pink-950/40 p-3 rounded-full border border-pink-500/20 text-pink-400">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-pink-300 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    C-SYNC MotherBot Compiler Desk
                  </h3>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1 max-w-[500px]">
                    Create custom interactive chatbots! Define trigger keywords (like <code className="text-pink-400">/practical</code> or <code className="text-cyan-400">/grades</code>) and responses. Your compiled bots become instant members inside GDC C-Sync messenger network.
                  </p>
                </div>
              </div>

              {compileSuccess && (
                <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl text-[10.5px] flex items-center gap-3">
                  <Check className="w-5 h-5 shrink-0 text-emerald-400" />
                  <div>
                    <span className="font-bold">COMPILATION COMPLETE!</span> Deployed chatbot successfully into decentralized memory clusters. Try chatting now!
                  </div>
                </div>
              )}

              <form onSubmit={handleCompileBot} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[8.5px] font-black text-slate-500 block uppercase mb-1">BOT ALIGNMENT NAME</label>
                    <input
                      type="text"
                      value={newBotName}
                      onChange={(e) => setNewBotName(e.target.value)}
                      placeholder="e.g. SyllabusSentry"
                      required
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[8.5px] font-black text-slate-500 block uppercase mb-1">CREATOR SIGNATURE</label>
                    <input
                      type="text"
                      value={currentUser.fullName}
                      disabled
                      className="w-full bg-[#01040e]/50 border border-white/5 p-2.5 rounded-lg text-xs text-zinc-500"
                    />
                  </div>
                </div>

                {/* Dynamic Triggers inputs list */}
                <div className="bg-[#02050f]/60 p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[8.5px] font-black text-pink-300 uppercase block tracking-wider">
                    🛰️ KEYWORD PATTERNS & BOT RESPONSES ({botTriggers.length})
                  </span>

                  {botTriggers.length === 0 ? (
                    <p className="text-[10.1px] text-slate-500">Add at least one trigger block to initialize binary responses.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {botTriggers.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg text-[9px] border border-white/[0.02]">
                          <div>
                            <span className="text-[#00f2ff] font-bold">{t.phrase}</span>
                            <span className="text-slate-500 mx-2">➡️</span>
                            <span className="text-slate-300 font-sans">{t.response.substring(0, 50)}...</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBotTriggers(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-2 border-t border-white/5">
                    <div className="md:col-span-4">
                      <input
                        type="text"
                        value={tempPhrase}
                        onChange={(e) => setTempPhrase(e.target.value)}
                        placeholder="e.g. /lunch"
                        className="w-full bg-slate-950 border border-white/10 p-2 rounded text-xs text-white"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <input
                        type="text"
                        value={tempResponse}
                        onChange={(e) => setTempResponse(e.target.value)}
                        placeholder="e.g. GDC Canteen is serving hot samosas!"
                        className="w-full bg-slate-950 border border-white/10 p-2 rounded text-xs text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddTrigger}
                        className="w-full py-2 bg-pink-950 text-pink-300 border border-pink-500/25 text-[10px] font-black uppercase rounded hover:bg-pink-900 cursor-pointer"
                      >
                        Add Trigger
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-pink-800 to-rose-700 text-white font-mono text-xs uppercase rounded-xl font-bold hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Terminal className="w-4 h-4" /> Assemble & Compile MotherBot Token
                </button>
              </form>
            </div>
          ) : (
            /* STUDENT PROJECTS API DEVELOPER PORTAL */
            <div className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-xs text-left">
              
              {/* Splitted Sub-tab Toggle buttons */}
              <div className="flex gap-2 bg-[#02050f] p-1.5 rounded-xl border border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => setBotApiSubTab('csync')}
                  className={`flex-1 py-2 text-center text-[9px] uppercase font-black tracking-widest rounded-lg transition-all cursor-pointer ${
                    botApiSubTab === 'csync' 
                      ? 'bg-[#180f2d] text-purple-300 border border-purple-500/20 font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📡 C-Sync Student Auth API
                </button>
                <button
                  type="button"
                  onClick={() => setBotApiSubTab('telegram-bot')}
                  className={`flex-1 py-2 text-center text-[9px] uppercase font-black tracking-widest rounded-lg transition-all cursor-pointer ${
                    botApiSubTab === 'telegram-bot' 
                      ? 'bg-[#270e1c] text-pink-300 border border-pink-500/20 font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🤖 Telegram Bot API Sandbox
                </button>
              </div>

              {botApiSubTab === 'csync' ? (
                <>
                  <div className="flex items-start gap-4 border-b border-purple-500/10 pb-4 shrink-0">
                    <div className="bg-purple-950/40 p-3 rounded-full border border-purple-500/20 text-purple-400">
                      <Layers className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-purple-300 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
                        Student Projects C-SYNC API Sandbox
                      </h3>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1 max-w-[500px]">
                        Create instant secure API tokens to integrate your external IoT terminals, Android applications, or Python scripts with the C-SYNC database authentication pipelines.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    
                    {/* API PROJECT CREATION FORM */}
                    <div className="md:col-span-5 bg-[#02050f]/60 p-4 border border-purple-500/15 rounded-xl space-y-4">
                      <span className="text-[8.5px] font-black text-purple-300 uppercase block tracking-wider select-none">
                        🛰️ SUBMIT DEVELOPER API REQUEST:
                      </span>
                      
                      <form onSubmit={handleCreateApiProject} className="space-y-4">
                        <div>
                          <label className="text-[8px] block text-slate-500 mb-1 font-bold">PROJECT APPLICATION NAME</label>
                          <input
                            type="text"
                            value={newProjName}
                            onChange={(e) => setNewProjName(e.target.value)}
                            placeholder="e.g. RFID Corridor Gateway"
                            required
                            className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[8px] block text-slate-500 mb-1 font-bold">ALLOWED SYSTEM ORIGINS (CORS)</label>
                          <input
                            type="text"
                            value={newProjOrigins}
                            onChange={(e) => setNewProjOrigins(e.target.value)}
                            placeholder="e.g. localhost:3000, *.run.app"
                            className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="text-[8px] block text-slate-500 mb-1 font-bold font-mono">DEVELOPMENT JUSTIFICATION & REASON</label>
                          <textarea
                            value={newProjReason}
                            onChange={(e) => setNewProjReason(e.target.value)}
                            placeholder="e.g. Building an automated corridor terminal for testing offline digital signatures..."
                            required
                            rows={3}
                            className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-lg text-[11px] text-white focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-[#40125c] text-purple-300 border border-purple-500/25 rounded-xl font-bold uppercase hover:bg-[#521c72] transition-all cursor-pointer text-[9.5px] tracking-wider"
                        >
                          Request Secure Developer Key
                        </button>
                      </form>
                    </div>

                    {/* API LOGS TESTER / PLAYGROUND */}
                    <div className="md:col-span-7 bg-[#02050f]/60 p-4 border border-cyan-500/15 rounded-xl space-y-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[8.5px] font-black text-cyan-400 uppercase block tracking-wider flex items-center justify-between">
                          <span>🛰️ INTERACTIVE HANDSHAKE TESTING LAB</span>
                          <span className="text-[7.5px] text-zinc-500 uppercase">MADDILAPALEM SERVER</span>
                        </span>

                        <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                          <div>
                            <label className="text-[7.5px] block text-slate-500 mb-1">AUTH TOKENS KEY</label>
                            <input
                              type="text"
                              value={testerToken}
                              onChange={(e) => setTesterToken(e.target.value)}
                              placeholder="PASTE API TOKEN HERE"
                              className="w-full bg-slate-950 border border-white/10 p-2 rounded text-[9px] text-[#00f2ff] font-mono font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[7.5px] block text-slate-500 mb-1">TARGET CLOUD ENDPOINT</label>
                            <select
                              value={testerEndpoint}
                              onChange={(e) => setTesterEndpoint(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 p-2 rounded text-[9px] text-white"
                            >
                              <option value="/api/auth/student-verify">POST /api/auth/student-verify</option>
                              <option value="/api/iot/stations">GET /api/iot/stations</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-6">
                            <label className="text-[7.5px] block text-purple-300 mb-1 font-bold">JSON PACKET PAYLOAD</label>
                            <textarea
                              rows={4}
                              value={testerPayload}
                              onChange={(e) => setTesterPayload(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 p-2 rounded text-[8px] text-slate-300 font-mono focus:outline-none"
                            />
                          </div>
                          <div className="md:col-span-6">
                            <label className="text-[7.5px] block text-pink-300 mb-1 font-bold">SERVER METRICS PAYLOAD RESPONSE</label>
                            <div className="w-full bg-slate-950 border border-white/10 p-2 rounded text-[8px] font-mono text-slate-300 h-[76px] overflow-y-auto overflow-x-auto scrollbar-thin leading-normal select-all">
                              {testerRunning ? (
                                <span className="text-[#00f2ff] animate-pulse">⚙️ Handshaking token in Visakhapatnam subnets...</span>
                              ) : testerResult ? (
                                <pre>{JSON.stringify(testerResult, null, 2)}</pre>
                              ) : (
                                <span className="text-slate-600">Execute mock handshake payload to inspect logs.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={executeApiSimulation}
                        disabled={testerRunning}
                        className="w-full py-2 bg-[#022e33] text-cyan-400 border border-cyan-500/25 rounded-lg text-[9px] font-black uppercase hover:bg-cyan-950 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" /> Execute Handshake Token Diagnostics
                      </button>
                    </div>
                  </div>

                  {/* INTEGRATION GUIDE CODE SNIPPET (JS, PYTHON, CURL) */}
                  <div className="bg-[#010309] border border-white/5 rounded-xl p-4 space-y-3.5 shrink-0">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[8.5px] font-bold text-slate-500 block uppercase">
                        📁 READY-TO-USE WRAPPER TEMPLATE CODE
                      </span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setActiveCodeLang('js')} className={`text-[8.5px] px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'js' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-500/25' : 'text-slate-400'}`}>JavaScript</button>
                        <button type="button" onClick={() => setActiveCodeLang('py')} className={`text-[8.5px] px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'py' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-500/25' : 'text-slate-400'}`}>Python</button>
                        <button type="button" onClick={() => setActiveCodeLang('curl')} className={`text-[8.5px] px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'curl' ? 'bg-purple-950 text-purple-300 font-bold border border-purple-500/25' : 'text-slate-400'}`}>CURL</button>
                      </div>
                    </div>

                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => copyText(getCodeSnippet())}
                        className="absolute top-2 right-2 text-slate-500 hover:text-white bg-slate-900 border border-white/5 p-1 rounded transition-colors"
                        title="Copy code wrapper"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <pre className="text-[8px] text-slate-350 leading-relaxed overflow-x-auto bg-[#02050c]/80 p-3.5 rounded-lg border border-white/[0.02]">
                        {getCodeSnippet()}
                      </pre>
                    </div>
                  </div>
                </>
              ) : (
                /* TELEGRAM BOT SIMULATION PLAYGROUND ACTIVE */
                <>
                  <div className="flex items-start gap-4 border-b border-pink-500/10 pb-4 shrink-0">
                    <div className="bg-pink-950/40 p-3 rounded-full border border-pink-500/20 text-pink-400">
                      <Bot className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-pink-300 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-pink-400 animate-pulse" />
                        Telegram Bot Simple Testing Panel
                      </h3>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1 max-w-[500px]">
                        Control your custom bot helpers using simple text replies. You can send mock chat updates or set automatic server notification URLs easily!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* LEADER BOT TARGET CONTROLS */}
                    <div className="md:col-span-5 bg-[#02050f]/60 p-4 border border-pink-500/15 rounded-xl space-y-4 text-left">
                      <span className="text-[8.5px] font-black text-pink-300 uppercase block tracking-wider">
                        ⚡ CHOOSE YOUR ACTIVE BOT HELPER:
                      </span>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[8px] block text-slate-500 mb-1 font-bold">WHICH BOT TO CHOOSE?</label>
                          <select
                            value={selectedBotIdForApi}
                            onChange={(e) => setSelectedBotIdForApi(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 p-2 rounded text-[11px] text-[#00f2ff] focus:outline-none"
                          >
                            {threads.map(t => (
                              <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[8px] block text-slate-500 mb-1 font-bold">NOTIFICATION WEB ADDRESS (URL) FOR TRIGGERS</label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={mockWebhookUrl}
                              onChange={(e) => setMockWebhookUrl(e.target.value)}
                              placeholder="e.g. https://my-college-server.edu.in/notify"
                              className="flex-1 bg-slate-950 border border-white/10 p-2 rounded text-[10px] text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleSimulateWebhook}
                              className="px-2 py-1 bg-pink-950 border border-pink-500/20 text-pink-300 text-[8px] font-black rounded hover:bg-pink-900 cursor-pointer uppercase font-mono"
                            >
                              TEST SEND
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Webhook live output feeds */}
                      <div className="space-y-1">
                        <span className="text-[7.5px] text-slate-500 block uppercase font-bold">AUTOMATIC NOTIFICATION UPDATES:</span>
                        <div className="h-20 bg-slate-950/90 border border-white/5 rounded-lg p-2 overflow-y-auto text-[7.5px] font-mono text-slate-400 space-y-1">
                          {webhookLogs.length === 0 ? (
                            <span className="text-zinc-600 block">No notifications sent yet.</span>
                          ) : (
                            webhookLogs.map((log, index) => (
                              <div key={index} className="truncate select-none text-cyan-400 leading-normal font-sans text-[7px]" title={log}>
                                {log}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* INTERACTIVE PAYLOAD CONTROLLER */}
                    <div className="md:col-span-7 bg-[#02050f]/60 p-4 border border-pink-500/15 rounded-xl space-y-3.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[8.5px] font-black text-pink-400 uppercase block tracking-wider flex justify-between">
                          <span>🌐 SEND BOT TEXT MESSAGE</span>
                          <span className="text-zinc-500">SIMPLE BOT WRAPPER</span>
                        </span>

                        <div className="space-y-3 mt-3">
                          <div>
                            <label className="text-[7.5px] text-purple-300 block mb-1 font-black uppercase">TYPE TEXT TO SEND</label>
                            <input
                              type="text"
                              value={tempBotApiText}
                              onChange={(e) => setTempBotApiText(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 p-2 rounded text-[10px] text-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[7.5px] text-pink-300 block mb-1 font-black uppercase">BOT API TEST RESULTS</label>
                            <div className="w-full bg-slate-950 border border-white/10 p-2 rounded text-[8.2px] font-mono text-emerald-400 h-24 overflow-y-auto leading-relaxed select-all">
                              {botApiRunning ? (
                                <span className="text-pink-400 animate-pulse block font-sans font-bold">📡 Sending live message to server...</span>
                              ) : botApiResult ? (
                                <pre>{JSON.stringify(botApiResult, null, 2)}</pre>
                              ) : (
                                <span className="text-slate-600">Type a message above and click the Send Test button!</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={executeBotApiCall}
                        disabled={botApiRunning}
                        className="w-full py-2 bg-[#2d0a1b] text-pink-400 border border-pink-500/25 rounded-lg text-[9px] font-black uppercase hover:bg-pink-950 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3 h-3 text-pink-400" /> Send Message Live!
                      </button>
                    </div>
                  </div>

                  {/* TELEGRAM WRAPPER TEMPLATE REVEAL */}
                  <div className="bg-[#010309] border border-white/5 rounded-xl p-4 space-y-3.5 shrink-0">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[8.5px] font-bold text-slate-500 block uppercase">
                        🤖 SAMPLE CODE TO USE WITH YOUR PROGRAM:
                      </span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setActiveCodeLang('js')} className={`text-[8.5px] px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'js' ? 'bg-pink-950 text-pink-300 font-bold border border-pink-500/25' : 'text-slate-400'}`}>JavaScript</button>
                        <button type="button" onClick={() => setActiveCodeLang('py')} className={`text-[8.5px] px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'py' ? 'bg-pink-950 text-pink-300 font-bold border border-pink-500/25' : 'text-slate-400'}`}>Python</button>
                        <button type="button" onClick={() => setActiveCodeLang('curl')} className={`text-[8.5px] px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'curl' ? 'bg-pink-950 text-pink-300 font-bold border border-pink-500/25' : 'text-slate-400'}`}>CURL</button>
                      </div>
                    </div>

                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => copyText(getTelegramBotCodeSnippet())}
                        className="absolute top-2 right-2 text-slate-500 hover:text-white bg-slate-900 border border-white/5 p-1 rounded transition-colors"
                        title="Copy bot API wrapper"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <pre className="text-[8px] text-slate-350 leading-relaxed overflow-x-auto bg-[#02050c]/80 p-3.5 rounded-lg border border-white/[0.02]">
                        {getTelegramBotCodeSnippet()}
                      </pre>
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
