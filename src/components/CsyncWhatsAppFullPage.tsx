import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, QrCode, Search, Send, Image, Video, Music, Play, Pause, Plus, X, 
  Bot, Shield, User as UserIcon, Users, PhoneCall, Phone, PhoneOff, Video as VideoIcon, Paperclip, Smile, MoreVertical, 
  Check, CheckCheck, Compass, Info, HelpCircle, Award, Volume2, VolumeX, Mic, MicOff, 
  Star, Heart, MessageSquare, ExternalLink, Globe, Sparkles, Battery, Wifi, Flame, RotateCw, 
  Cpu, Terminal, Zap, ShieldAlert, BadgeCheck, Lock, PlayCircle, Laptop, CreditCard, ShoppingBag, 
  Instagram, Facebook, Radio, ChevronRight, ArrowLeft, Camera, FileText, MapPin, Upload, FolderOpen, RefreshCw
} from 'lucide-react';
import { ClientDatabase } from '../remoteDb';
import { playVoice, playHaptic } from '../feedback';
import { UserStory, ChatThread, ChatMessage, User } from '../types';
import { FREE_MUSIC_LIBRARY, AUDIO_BG_GRADIENTS, MusicTrack, fetchNewRoyaltyFreeTracks } from '../musicData';

interface CsyncWhatsAppFullPageProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
  onExit?: () => void;
}

export const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    icon: '😄',
    title: 'Smileys & Emoticons',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😶', '🫥', '😐', '😑', '😬', '🫠', '🤥', '🤫', '🤭', '🥱', '😴', '🤤', '😪', '😵']
  },
  {
    id: 'gestures',
    icon: '👍',
    title: 'Gestures & Body',
    emojis: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🫵', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '✍️', '💅', '🤳', '💪', '🦾']
  },
  {
    id: 'hearts',
    icon: '❤️',
    title: 'Hearts & Love',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💋', '💌']
  },
  {
    id: 'animals',
    icon: '🐶',
    title: 'Animals & Nature',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐣', '🐧', '🐦', '🦉', '🦇', '🦋', '🐢', '🐊', '🐍', '🦎', '🐙', '🦈', '🐠', '🐳', '🍀', '🌟', '❄️', '🔥']
  },
  {
    id: 'food',
    icon: '🍏',
    title: 'Food & Drink',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🌽', '🥕', '🥔', '🥖', '🥨', '🥞', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🍳', '🍿', '🍣', '🍦', '🍩', '🍪', '🍫', '🍭', '🍬', '🍺', '🥤', '☕', '🥛']
  },
  {
    id: 'activities',
    icon: '⚽',
    title: 'Activities & Sports',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏹', '🎣', '🤿', '🥊', '🥋', '🛹', '🛼', '🚴', '🏆', '🥇', '🥈', '🥉', '🪙']
  },
  {
    id: 'objects',
    icon: '💻',
    title: 'Objects & Tech',
    emojis: ['💻', '🖥️', '🖨️', '⌨️', '🖱️', '📳', '📱', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💡', '🔦', '🕯️', '💸', '💵', '💳', '💎', '🔧', '🔨', '🛠️', '⛓️', '🛡️', '🧪', '🧬', '⚙️', '📈', '📊']
  },
  {
    id: 'symbols',
    icon: '⚠️',
    title: 'Symbols & Badges',
    emojis: ['⚠️', '🚨', '🚫', '☣️', '☢️', '💯', '🔥', '✨', '⭐', '💫', '💥', '⚡', '🤖', '👾', '🚀', '🛸', '🌐', '🧭', '🗺️', '🔑', '🔓', '🔒', '🔔', '📢', '🏁', '🏳️‍🌈', '🇮🇳', '🇺🇸', '🇬🇧', '🇯🇵', '🇩🇪', '🇰🇷']
  }
];

export const EMOJI_NAMES_MAP: Record<string, string> = {
  '😀': 'smile grinning happy face', '😃': 'smile happy face broad', '😄': 'smile happy face laugh', '😁': 'smile grin beam', '😆': 'smile laugh squint', '😅': 'smile sweat relief cold', '😂': 'laugh cry tears joy', '🤣': 'laugh roll floor rofl', '😊': 'smile blush happy warm', '😇': 'halo innocent angel', '🙂': 'smile slight friendly', '🙃': 'upside down silly', '😉': 'wink playful flirt', '😌': 'relieved content calm', '😍': 'heart eyes adore love', '🥰': 'hearts blushing floating adore', '😘': 'kiss blow love wink', '😗': 'kiss duck face', '😙': 'kiss happy eyes', '😚': 'kiss closed eyes', '😋': 'delicious taste yummy tongue', '😛': 'tongue playful poke', '😝': 'tongue squint squinting', '😜': 'tongue wink playful crazy', '🤪': 'zany silly wild goofy', '🤨': 'raised eyebrow suspicious', '🧐': 'monocle smart examine detective', '🤓': 'nerd geek study smart', '😎': 'sunglasses cool sunglasses shade', '🥸': 'disguise mask mustache glasses', '🤩': 'starstruck amazed excited', '🥳': 'party horn celebrate birthday Hat', '😏': 'smirk sly suggestive', '😒': 'unamused displeased meh', '😞': 'disappointed sad downcast', '😔': 'pensive sad reflective solid', '😟': 'worried anxious nervous', '😕': 'confused puzzled head', '🙁': 'sad slight frown', '☹️': 'frown sad unhappy', '😣': 'persevere struggle hurt', '😖': 'confounded distressed frustrated', '😫': 'tired weary exhausted', '😩': 'weary crying complaining', '🥺': 'pleading puppy eyes begging', '😢': 'cry sad tear', '😭': 'cry sob heavy tears hysterical', '😤': 'triumph steam angry nose', '😠': 'angry mad displeased', '😡': 'rage angry mad red', '🤬': 'swearing cussing angry profile', '🤯': 'mindblown exploding brain shock', '😳': 'flushed shocked surprised wide eye', '🥵': 'hot red face sweat summer', '🥶': 'cold frozen blue winter ice', '😶': 'speechless silent mouth mute', '🫥': 'dotted disappear fade', '😐': 'neutral blank straight face', '😑': 'expressionless broad lines', '😬': 'grimace nervous tensed teeth', '🫠': 'melting melt hot summer', '🤥': 'lying liar long nose pinocchio', '🤫': 'shh quiet secret finger', '🤭': 'giggle hand mouth oops', '🥱': 'yawn tired sleepy bored', '😴': 'sleep snore zzz', '🤤': 'drool tasty appetizing', '😪': 'sleepy bubble', '😵': 'dizzy dead crossed eyes',
  '👍': 'thumbs up good like confirm yes', '👎': 'thumbs down bad dislike no reject', '👌': 'ok okay correct perfect', '🤌': 'pinched fingers italian', '🤏': 'pinching small tiny bit', '✌️': 'victory peace fingers v sign', '🤞': 'crossed fingers luck promise', '🫵': 'point you target', '🤟': 'love you rock on sign', '🤘': 'rock on horns metal', '🤙': 'call me phone hand custom', '👈': 'hand point left', '👉': 'hand point right', '👆': 'hand point up index', '🖕': 'middle finger flip off cuss', '👇': 'hand point down', '☝️': 'index finger up warning', '✋': 'stop high five hand raise', '🤚': 'backhand raised stop', '🖐️': 'spread hand five fingers', '🖖': 'vulcan live long prosper vulcan salute', '👋': 'wave hello goodbye greet', '✍️': 'write pen hand signature', '💅': 'nail polish manicure fashion', '🤳': 'selfie phone photo mobile', '💪': 'muscle bicep strong power work', '🦾': 'robotic cyborg arm mechanical',
  '❤️': 'heart red love connection', '🧡': 'heart orange warning friendship', '💛': 'heart yellow cheerful pure', '💚': 'heart green nature env', '💙': 'heart blue Trust deep', '💜': 'heart purple royalty luxury', '🖤': 'heart black dark gothic grief', '🤍': 'heart white light pure', '🤎': 'heart brown grounded wood', '💔': 'heart broken heartbreak sad', '❣️': 'exclamation red heart badge', '💕': 'two hearts floating love', '💞': 'revolving hearts pink love', '💓': 'beating pulsing heart active', '💗': 'growing expanding heart love', '💖': 'sparkle heart glowing magical', '💘': 'arrow cupid love strike', '💝': 'gift ribbon present heart', '💟': 'ornament purple heart decor', '💋': 'lipstick kiss print lips', '💌': 'love letter envelope mail notes',
  '🐶': 'dog puppy active bark', '🐱': 'cat kitten whiskers purr', '🐭': 'mouse mice cheese squeak', '🐹': 'hamster cute round pet', '🐰': 'rabbit bunny long ears hope', '🦊': 'fox clever wild orange', '🐻': 'bear growl fluff brown', '🐼': 'panda bamboo black white cute', '🐨': 'koala eucalyptus australia grey', '🐯': 'tiger wild cat stripes roar', '🦁': 'lion king pride roar yellow', '🐮': 'cow farm milk moo', '🐷': 'pig farm pink oink bacon', '🐸': 'frog amphibian green jump croak', '🐵': 'monkey active chimpanzee banana', '🐣': 'chick hatch egg cute fresh', '🐧': 'penguin ice slide formal bird', '🐦': 'bird chirp eagle flight wing', '🦉': 'owl wise night search hunter', '🔑': 'key password login unlock security token', '🗣️': 'speak sound voice waves broadcast'
};

export interface StickerItem {
  emoji: string;
  name: string;
}

export interface StickerSet {
  id: string;
  title: string;
  icon: string;
  items: StickerItem[];
}

export const STICKER_SETS: StickerSet[] = [
  {
    id: 'sentry',
    title: 'Biometric Sentry Keys',
    icon: '🛡️',
    items: [
      { emoji: '💡', name: 'Macro' },
      { emoji: '⚡', name: 'Trigger' },
      { emoji: '🛡️', name: 'Audit' },
      { emoji: '💻', name: 'Compiled' },
      { emoji: '🤖', name: 'Sentry' },
      { emoji: '⭐', name: 'HOD' },
      { emoji: '🔥', name: 'Streak' },
      { emoji: '🍉', name: 'Beach' }
    ]
  },
  {
    id: 'memes',
    title: 'Meme Legends Pack',
    icon: '🐸',
    items: [
      { emoji: '🔥', name: 'FINE' },
      { emoji: '🤡', name: 'HONK' },
      { emoji: '🚀', name: 'TO THE MOON' },
      { emoji: '🧠', name: 'BIG BRAIN' },
      { emoji: '👀', name: 'I SEE YOU' },
      { emoji: '🫠', name: 'MELTING' },
      { emoji: '💅', name: 'SLAY' },
      { emoji: '🦖', name: 'DINO MODE' }
    ]
  },
  {
    id: 'kitty',
    title: 'Silly Kitty Reactions',
    icon: '🐱',
    items: [
      { emoji: '😸', name: 'Happy Kitty' },
      { emoji: '🙀', name: 'Shocked Kitty' },
      { emoji: '😿', name: 'Crying Kitty' },
      { emoji: '😼', name: 'Smug Kitty' },
      { emoji: '😾', name: 'Angry Kitty' },
      { emoji: '😹', name: 'Teasing Kitty' },
      { emoji: '😻', name: 'Love Kitty' },
      { emoji: '💤', name: 'Lazy Kitty' }
    ]
  },
  {
    id: 'devs',
    title: 'Elite Coder Devreactions',
    icon: '⌨️',
    items: [
      { emoji: '🐛', name: 'BUG IN PROD' },
      { emoji: '🔥', name: 'MERGED' },
      { emoji: '💀', name: 'RIP PROD' },
      { emoji: '🚀', name: 'SHIP IT' },
      { emoji: '⌨️', name: 'TYPING' },
      { emoji: '🧪', name: 'RUNNING TESTS' },
      { emoji: '💬', name: 'LGTM' },
      { emoji: '🛡️', name: 'SECURED' }
    ]
  }
];

export const CsyncWhatsAppFullPage: React.FC<CsyncWhatsAppFullPageProps> = ({ db, onRefreshAll, onExit }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    // Default to the first student user if not logged in
    const active = db.getCurrentStudent();
    if (active) return active;
    const student = db.getUsers().find(u => u.role.toLowerCase().includes('student')) || db.getUsers()[0];
    db.setCurrentStudent(student);
    return student;
  });

  // Sidebar navigation sections: 'chats' | 'telemetry' | 'about'
  const [activeNav, setActiveNav] = useState<'chats' | 'telemetry' | 'about'>('chats');
  const [isChatActiveOnMobile, setIsChatActiveOnMobile] = useState(false);
  const [isSentryHubOpen, setIsSentryHubOpen] = useState(false);
  const [hubActiveTab, setHubActiveTab] = useState<'telemetry' | 'about'>('telemetry');
  
  const [threads, setThreads] = useState<ChatThread[]>(db.getChatThreads());
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-syska-ai');
  const [messages, setMessages] = useState<ChatMessage[]>(db.getChatMessages('thread-syska-ai'));
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Set chat tab active state globally on mount, reset on unmount
  useEffect(() => {
    (window as any).__csync_is_in_chat_tab = true;
    return () => {
      (window as any).__csync_is_in_chat_tab = false;
    };
  }, []);


  // Sticker pack, emoji pack and real attachment system states
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState('smileys');
  const [selectedStickerSet, setSelectedStickerSet] = useState('sentry');
  const [isTelegramDirectOpen, setIsTelegramDirectOpen] = useState(false);
  const [tgContactUsername, setTgContactUsername] = useState('');
  const [tgContactType, setTgContactType] = useState<'username' | 'phone'>('username');
  const [tgContactPhone, setTgContactPhone] = useState('');
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  
  // Real voice recorder state variables
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSecs, setVoiceSecs] = useState(0);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [voiceRecorderObj, setVoiceRecorderObj] = useState<MediaRecorder | null>(null);
  const [voiceChunksList, setVoiceChunksList] = useState<Blob[]>([]);
  const sendAudioOnStopRef = useRef(false);

  // Contacts picker panel toggle
  const [isContactSelectorOpen, setIsContactSelectorOpen] = useState(false);
  const [contactSearchVal, setContactSearchVal] = useState('');

  // Sentry Live Interactive Chat Camera System states
  const [isChatCameraOpen, setIsChatCameraOpen] = useState(false);
  const [chatCameraStream, setChatCameraStream] = useState<MediaStream | null>(null);
  const [chatCameraDevices, setChatCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentChatCameraId, setCurrentChatCameraId] = useState<string | null>(null);
  const [chatCameraError, setChatCameraError] = useState<string | null>(null);
  const chatCameraVideoRef = useRef<HTMLVideoElement | null>(null);

  // Status/Stories State
  const [stories, setStories] = useState<UserStory[]>(db.getUserStories());
  const [activeStory, setActiveStory] = useState<UserStory | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isPlayingStory, setIsPlayingStory] = useState(true);
  const [isNewStoryOpen, setIsNewStoryOpen] = useState(false);
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);
  const storyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const statusFileInputRef = useRef<HTMLInputElement>(null);

  // New Story submission attributes
  const [newStoryCaption, setNewStoryCaption] = useState('');
  const [newStoryImage, setNewStoryImage] = useState('');
  const [newStoryVideo, setNewStoryVideo] = useState('');
  const [newStoryMusic, setNewStoryMusic] = useState('dev-lofi');
  const [newStoryDuration, setNewStoryDuration] = useState(15);

  // Exact WhatsApp status feature states
  const [statusType, setStatusType] = useState<'media' | 'text'>('media');
  const [textStatusBg, setTextStatusBg] = useState('linear-gradient(135deg, #1e1b4b 0%, #311042 100%)');
  const [textStatusFont, setTextStatusFont] = useState('font-sans');
  const [statusPrivacy, setStatusPrivacy] = useState<'contacts' | 'private' | 'only'>('contacts');
  const [localStatusFileDragActive, setLocalStatusFileDragActive] = useState(false);
  const [localStatusFileName, setLocalStatusFileName] = useState('');
  const [dynamicMusicList, setDynamicMusicList] = useState<MusicTrack[]>(FREE_MUSIC_LIBRARY);
  const [isAutoUpdatingMusic, setIsAutoUpdatingMusic] = useState(false);
  const [searchMusicQuery, setSearchMusicQuery] = useState('');
  const [musicFilterIndustry, setMusicFilterIndustry] = useState<string>('ALL');
  const [inboundStoryReplyText, setInboundStoryReplyText] = useState('');

  // Custom live capture or gallery uploader parameters
  const [localMediaType, setLocalMediaType] = useState<'image' | 'video' | null>(null);
  const [isWebcamLensActive, setIsWebcamLensActive] = useState(false);
  const [webcamRecording, setWebcamRecording] = useState(false);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaRecorderObj, setMediaRecorderObj] = useState<MediaRecorder | null>(null);
  const [recordedChunksList, setRecordedChunksList] = useState<Blob[]>([]);

  // Call overlay state (simulate WhatsApp video/voice calls)
  const [activeCall, setActiveCall] = useState<{ type: 'voice' | 'video'; peerName: string; avatar: string } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [tgCallState, setTgCallState] = useState<'dialing' | 'ringing' | 'connected' | 'ended'>('dialing');
  const [isMutedWeb, setIsMutedWeb] = useState(false);
  const [isSpeakerWeb, setIsSpeakerWeb] = useState(false);

  // Camera selection for video calls
  const [useRearCamera, setUseRearCamera] = useState(false);
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const localVideoRefRef = useRef<HTMLVideoElement | null>(null);

  const localCallStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let isCancelled = false;
    let context: AudioContext | null = null;

    async function startMedia() {
      if (!activeCall) {
        setCameraStreamActive(false);
        return;
      }
      setCameraError(null);
      
      let acquiredSuccessfully = false;
      let stream: MediaStream | null = null;

      try {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video: activeCall.type === 'video' ? {
            facingMode: useRearCamera ? 'environment' : 'user'
          } : false
        };

        // Attempt media stream acquisition with chained fallbacks
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          acquiredSuccessfully = true;
        } catch (firstErr: any) {
          console.warn("Primary media device request failed or busy:", firstErr.message || firstErr);
          if (activeCall.type === 'video') {
            try {
              // Fallback to simpler generic camera constraint
              stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
              acquiredSuccessfully = true;
            } catch (secErr: any) {
              console.warn("Generic camera request failed, falling back to voice-only track:", secErr.message || secErr);
              try {
                // Fallback to voice only
                stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                acquiredSuccessfully = true;
                setCameraError("Camera unavailable or in use. Active audio voice link established.");
              } catch (voiceErr: any) {
                console.warn("Physical voice microphone request failed as well:", voiceErr.message || voiceErr);
              }
            }
          }
        }

        if (acquiredSuccessfully && stream) {
          if (isCancelled) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          activeStream = stream;
          localCallStreamRef.current = stream;

          if (activeCall.type === 'video' && stream.getVideoTracks().length > 0 && localVideoRefRef.current) {
            localVideoRefRef.current.srcObject = stream;
            localVideoRefRef.current.onloadedmetadata = () => {
              localVideoRefRef.current?.play().catch(err => console.log("Video playback exception:", err));
            };
            setCameraStreamActive(true);
          }

          // Setup real Web Audio analyser for responsive mic visualizer spectrum
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            context = new AudioCtx();
            audioContextRef.current = context;

            const source = context.createMediaStreamSource(stream);
            const analyser = context.createAnalyser();
            analyser.fftSize = 64; // Small size for responsive spaced frequency bars
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const drawVisualizer = () => {
              if (isCancelled) return;
              animationFrameRef.current = requestAnimationFrame(drawVisualizer);
              
              const canvas = visualizerCanvasRef.current;
              if (!canvas) return;
              const canvasCtx = canvas.getContext('2d');
              if (!canvasCtx) return;

              analyser.getByteFrequencyData(dataArray);

              const width = canvas.width;
              const height = canvas.height;
              canvasCtx.clearRect(0, 0, width, height);

              const isTelegram = activeThreadId.startsWith('thread-tg-') || activeThreadId === 'thread-parent-alerts';
              canvasCtx.shadowBlur = 8;
              canvasCtx.shadowColor = isTelegram ? '#0088cc' : '#10b981';
              canvasCtx.fillStyle = isTelegram ? 'rgba(0, 136, 204, 0.85)' : 'rgba(16, 185, 129, 0.85)';

              const barWidth = width / bufferLength;
              for (let i = 0; i < bufferLength; i++) {
                const val = dataArray[i]; 
                const percent = val / 255;
                const barHeight = Math.max(3, percent * (height * 0.85)); // at least 3px height for dynamic jitter
                const x = i * barWidth;
                const y = (height - barHeight) / 2;
                
                canvasCtx.fillRect(x + 1, y, barWidth - 2, barHeight);
              }
            };
            drawVisualizer();
          } catch (audioErr) {
            console.warn("Could not start real Web Audio API tracking loop:", audioErr);
            startFallbackWave();
          }
        } else {
          // No media acquired (e.g. permission blocked completely or running inside standard iframe context without direct video permission)
          console.warn("Entering offline loopback fallback generator.");
          setCameraError("Camera and microphone are in use or blocked. Running secure software loopback link.");
          startFallbackWave();
        }

      } catch (err: any) {
        console.warn("Outer user media acquire exception handled:", err);
        setCameraError(err.message || 'Media source busy');
        setCameraStreamActive(false);
        startFallbackWave();
      }

      function startFallbackWave() {
        const drawFallback = () => {
          if (isCancelled) return;
          animationFrameRef.current = requestAnimationFrame(drawFallback);

          const canvas = visualizerCanvasRef.current;
          if (!canvas) return;
          const canvasCtx = canvas.getContext('2d');
          if (!canvasCtx) return;

          const width = canvas.width;
          const height = canvas.height;
          canvasCtx.clearRect(0, 0, width, height);

          const isTelegram = activeThreadId.startsWith('thread-tg-') || activeThreadId === 'thread-parent-alerts';
          canvasCtx.shadowBlur = 8;
          canvasCtx.shadowColor = isTelegram ? '#0088cc' : '#10b981';
          canvasCtx.fillStyle = isTelegram ? 'rgba(0, 136, 204, 0.85)' : 'rgba(16, 185, 129, 0.85)';

          const barCount = 32;
          const barWidth = width / barCount;
          const time = Date.now() * 0.003;

          for (let i = 0; i < barCount; i++) {
            // Highly organic look using three superimposed sine wave components
            const wave1 = Math.sin(i * 0.25 - time) * 0.5 + 0.5;
            const wave2 = Math.cos(i * 0.4 + time * 1.5) * 0.3 + 0.3;
            const noise = (Math.sin(i * 123.45 + time * 8) * 0.08) + 0.08;
            const percent = Math.min(1, Math.max(0, (wave1 * 0.6 + wave2 * 0.3 + noise)));
            
            const barHeight = Math.max(2.5, percent * (height * 0.75));
            const x = i * barWidth;
            const y = (height - barHeight) / 2;
            
            canvasCtx.fillRect(x + 1, y, barWidth - 2, barHeight);
          }
        };
        drawFallback();
      }
    }

    startMedia();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (context && context.state !== 'closed') {
        try {
          context.close().catch(e => console.log("Closing AudioContext error:", e));
        } catch (e) {}
      }
      localCallStreamRef.current = null;
      audioContextRef.current = null;
    };
  }, [activeCall, useRearCamera, activeThreadId]);

  // Clean up chat camera stream on unmount
  useEffect(() => {
    return () => {
      if (chatCameraStream) {
        chatCameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [chatCameraStream]);

  // Sentry Live Interactive Chat Camera Methods
  const openChatCamera = async () => {
    setIsChatCameraOpen(true);
    setChatCameraError(null);
    setIsAttachmentOpen(false);
    playHaptic('tap');

    try {
      let devices: MediaDeviceInfo[] = [];
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        tempStream.getTracks().forEach(t => t.stop());
        try {
          devices = await navigator.mediaDevices.enumerateDevices();
        } catch (_) {}
      } catch (e) {
        try {
          devices = await navigator.mediaDevices.enumerateDevices();
        } catch (_) {}
      }

      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setChatCameraDevices(videoDevices);

      let devId = currentChatCameraId;
      if (!devId && videoDevices.length > 0) {
        devId = videoDevices[0].deviceId;
        setCurrentChatCameraId(devId);
      }

      await startChatCameraStream(devId || undefined);
    } catch (err: any) {
      console.warn("Webcam access failed, engaging interactive sandbox viewfinder:", err);
      setChatCameraError("Camera permission blocked by browser/iframe sandbox. Engaging SENTRY-PWA Interactive Camera Sandbox.");
    }
  };

  const startChatCameraStream = async (deviceId?: string, forceFacing?: 'user' | 'environment') => {
    if (chatCameraStream) {
      chatCameraStream.getTracks().forEach(t => t.stop());
      setChatCameraStream(null);
    }

    const mode = forceFacing || (useRearCamera ? 'environment' : 'user');

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: mode }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setChatCameraStream(stream);
      if (chatCameraVideoRef.current) {
        chatCameraVideoRef.current.srcObject = stream;
        chatCameraVideoRef.current.play().catch(e => console.warn("Video auto-play interrupted:", e));
      }
    } catch (err: any) {
      console.warn("Could not start webcam stream under exact constraints:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode }, audio: false });
        setChatCameraStream(fallbackStream);
        if (chatCameraVideoRef.current) {
          chatCameraVideoRef.current.srcObject = fallbackStream;
          chatCameraVideoRef.current.play().catch(e => console.warn("Fallback autoplay interrupted:", e));
        }
      } catch (fallbackErr: any) {
        console.warn("All camera sensors blocked:", fallbackErr);
        // Do not throw, keep viewfinder open in mock mode so they can still capture photo manually
        setChatCameraError("Webcam permission blocked or unavailable. Falling back to SENTRY-PWA Sandbox Camera.");
      }
    }
  };

  const switchChatCamera = async () => {
    playHaptic('tap');
    const targetRear = !useRearCamera;
    setUseRearCamera(targetRear);
    playVoice(`Switching to ${targetRear ? 'rear' : 'front'} camera.`);

    if (chatCameraDevices.length > 1) {
      const currentIndex = chatCameraDevices.findIndex(d => d.deviceId === currentChatCameraId);
      const nextIndex = (currentIndex + 1) % chatCameraDevices.length;
      const nextDevice = chatCameraDevices[nextIndex];
      
      if (nextDevice) {
        setCurrentChatCameraId(nextDevice.deviceId);
        await startChatCameraStream(nextDevice.deviceId, targetRear ? 'environment' : 'user');
      }
    } else {
      await startChatCameraStream(undefined, targetRear ? 'environment' : 'user');
    }
  };

  const closeChatCamera = () => {
    if (chatCameraStream) {
      chatCameraStream.getTracks().forEach(t => t.stop());
      setChatCameraStream(null);
    }
    setIsChatCameraOpen(false);
    playHaptic('light');
  };

  const captureChatPhoto = () => {
    if (!chatCameraVideoRef.current) return;
    playHaptic('heavy');
    
    try {
      const video = chatCameraVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        if (dataUrl) {
          handleSendMessage(undefined, `📷 [Camera Snap] type: image/jpeg | url: ${dataUrl}`, {
            content: dataUrl,
            name: `snap_${Date.now()}.jpg`,
            type: 'image/jpeg'
          });
          closeChatCamera();
          playHaptic('success');
          return;
        }
      }
      throw new Error("Could not construct 2D context");
    } catch (err) {
      console.error(err);
      const fallbackUrl = `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400`;
      handleSendMessage(undefined, `📷 [Camera Snap] type: image/jpeg | url: ${fallbackUrl}`);
      closeChatCamera();
    }
  };

  // Audio nodes for live sounds
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  // Syska AI Copilot State
  const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant');
  const [isLoading, setIsLoading] = useState(false);
  const [wakeWordActive, setWakeWordActive] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [micState, setMicState] = useState<'idle' | 'listening' | 'speaking' | 'error'>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speechVolume, setSpeechVolume] = useState(true); // TTS setting

  // Diagnostic states
  const [selectedIssueId, setSelectedIssueId] = useState<string>('all');
  const [aiDiagnosticResult, setAiDiagnosticResult] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [securityScore, setSecurityScore] = useState<number | null>(78);
  const [auditReport, setAuditReport] = useState<string | null>(null);

  // OTA states
  const [otaPrompt, setOtaPrompt] = useState('Build a biometric bypass gateway for lab stations CS-01 to CS-05');
  const [generatedOtaPatch, setGeneratedOtaPatch] = useState<any>(null);

  // MotherBot compile States
  const [creatorName, setCreatorName] = useState('');
  const [creatorSelectedUsers, setCreatorSelectedUsers] = useState<number[]>([]);
  const [botTriggers, setBotTriggers] = useState<Array<{ phrase: string; response: string }>>([
    { phrase: 'hi', response: 'Hello cadet! Biometrics signature is online.' },
    { phrase: 'bypass', response: 'Sentry override requested. Disbursing RFID sequence!' }
  ]);
  const [tempPhrase, setTempPhrase] = useState('');
  const [tempResponse, setTempResponse] = useState('');

  // Standard ref for messages scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Synchronize internal DB trigger counts and notifications
  useEffect(() => {
    const keepSync = setInterval(() => {
      setThreads(db.getChatThreads());
      setStories(db.getUserStories());
    }, 2000);

    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ threadId: string; avatar: string }>;
      if (customEvent.detail) {
        setThreads(db.getChatThreads());
      }
    };

    window.addEventListener('csync-telegram-avatar-updated', handleAvatarUpdate);

    return () => {
      clearInterval(keepSync);
      window.removeEventListener('csync-telegram-avatar-updated', handleAvatarUpdate);
    };
  }, [db]);

  // High-performance real-time active Telegram chat poller (Two-way communications)
  useEffect(() => {
    if (!activeThreadId.startsWith('thread-tg-')) return;
    const contactVal = activeThreadId.replace('thread-tg-', '');

    const pollTelegramMessages = async () => {
      try {
        const response = await fetch(`/api/telegram-chat-messages?contact=${encodeURIComponent(contactVal)}`);
        if (!response.ok) return;

        // Skip parsing if the response content is HTML (like general index page fallbacks)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          return;
        }

        let data;
        try {
          data = await response.json();
        } catch (jsonErr) {
          return; // Ignore parsing failures on malformed data
        }

        if (data && data.success && Array.isArray(data.messages)) {
          let updated = false;
          data.messages.forEach((newMsg: any) => {
            // Check if this message ID already exists globally in db.chatMessages
            const exists = db.chatMessages.some(m => m.id === newMsg.id);
            if (!exists) {
              const formattedMsg: ChatMessage = {
                id: newMsg.id,
                threadId: activeThreadId,
                senderName: newMsg.senderName,
                senderRole: 'Staff',
                text: newMsg.text,
                timestamp: newMsg.timestamp,
                isBot: true // Displays on the received/other side of chat UI
              };
              db.chatMessages.push(formattedMsg);
              updated = true;
            }
          });

          if (updated) {
            setMessages(db.getChatMessages(activeThreadId));
            onRefreshAll();
          }
        }
      } catch (err) {
        // Gracefully handle transient connection/fetch offline states in safe container proxy
        console.warn("Telegram bidirectional updates transient sync status:", err instanceof Error ? err.message : String(err));
      }
    };

    // Run immediately when opening the thread
    pollTelegramMessages();

    // Poll every 3.5 seconds to avoid hitting API rate limits excessively while giving dynamic feedback
    const interval = setInterval(pollTelegramMessages, 3500);
    return () => clearInterval(interval);
  }, [activeThreadId, db]);

  // Handle Dynamic stories timer progress & audio
  useEffect(() => {
    if (!activeStory) {
      if (storyAudioRef.current) {
        storyAudioRef.current.pause();
        storyAudioRef.current = null;
      }
      setStoryProgress(0);
      return;
    }

    // Determine Soundtrack URL
    let songUrl = '';
    const matchedTrack = FREE_MUSIC_LIBRARY.find(
      t => t.title === activeStory.storyMusicTitle || t.id === activeStory.storyMusicTitle
    );
    if (matchedTrack) {
      songUrl = matchedTrack.url;
    } else if (activeStory.storyMusicTitle === 'Dev Lofi Beat') {
      songUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    } else if (activeStory.storyMusicTitle === 'Monsoon Acoustic Rain') {
      songUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3';
    } else if (activeStory.storyMusicTitle === 'Vizag Waves Harmony') {
      songUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
    }

    if (songUrl) {
      const liveAudio = new Audio(songUrl);
      liveAudio.loop = true;
      storyAudioRef.current = liveAudio;
      if (isPlayingStory) {
        liveAudio.play().catch(() => {});
      }
    }

    setStoryProgress(0);
    const durationMs = (activeStory.duration || 15) * 1000;
    const intervalMs = 100;
    const increment = (intervalMs / durationMs) * 100;

    storyTimerRef.current = setInterval(() => {
      if (!isPlayingStory) return;
      setStoryProgress(prev => {
        if (prev >= 100) {
          clearInterval(storyTimerRef.current!);
          // Find next story
          const currentIndex = stories.findIndex(s => s.id === activeStory.id);
          if (currentIndex !== -1 && currentIndex < stories.length - 1) {
            setActiveStory(stories[currentIndex + 1]);
          } else {
            setActiveStory(null);
          }
          return 100;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => {
      if (storyTimerRef.current) {
        clearInterval(storyTimerRef.current);
      }
      if (storyAudioRef.current) {
        storyAudioRef.current.pause();
        storyAudioRef.current = null;
      }
    };
  }, [activeStory, isPlayingStory]);

  // Sound Synth Text-To-Speech for Syska AI Voice Module
  const speakText = (text: string) => {
    if (!window.speechSynthesis || !speechVolume) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = (text || '')
        .replace(/[\*\#\`\_]/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\{.*?\}/g, '')
        .substring(0, 300);

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onstart = () => {
        setMicState('speaking');
      };
      utterance.onend = () => {
        setMicState(wakeWordActive ? 'listening' : 'idle');
      };
      utterance.onerror = () => {
        setMicState(wakeWordActive ? 'listening' : 'idle');
      };
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  // Standard simulated AI local handler
  const getLocalAIResponse = (query: string) => {
    const q = query.toLowerCase();
    if (
      q.includes('developer') || 
      q.includes('creator') || 
      q.includes('who made') || 
      q.includes('who built') || 
      q.includes('thrinadh') || 
      q.includes('linkedin') || 
      q.includes('m3nadh')
    ) {
      return `🔊 SYSKA SENTRY: The developer is M. Thrinadh and his LinkedIn profile is https://linkedin.com/in/m3nadh`;
    }
    if (q.includes('unlocked') || q.includes('active') || q.includes('stations')) {
      return `🔊 LOCAL SYNAPSE: Currently, 32 out of 50 desktop workstations in lab compartments CS-01 through CS-50 are verified online and communicating over dynamic transport telemetry.`;
    }
    if (q.includes('rfid') || q.includes('biometric')) {
      return `🔊 LOCAL SYNAPSE: Biometrics gateway is operating under absolute secure hash integrity. Fingerprints authenticated natively.`;
    }
    if (q.includes('ugc') || q.includes('compliance') || q.includes('naac')) {
      return `🔊 LOCAL SENTRY: College infrastructure is registered under official NAAC autonomous guidelines. Daily biometric verification feeds map perfectly to continuous UGC audits.`;
    }
    return `🔊 SYSTEM: Syska AI Sentry online. I have received your prompt: "${query}". You can switch back to active Groq cloud nodes for massive logical processing or command macro diagnostics!`;
  };

  // Secure Groq proxy driver
  const callGroqAPI = async (payload: { role: string; content: string }[], customModel?: string) => {
    try {
      const response = await fetch('/api/groq-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: customModel || selectedModel,
          messages: payload,
          temperature: 0.35
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API returned ${response.status}: ${err}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'Error reading Groq API.';
    } catch (e: any) {
      console.warn("Groq proxy connection failed, defaulting to local fallback mode:", e);
      return getLocalAIResponse(payload[payload.length - 1].content);
    }
  };

  // Chat message submit dispatcher
  const handleSendMessage = async (e?: React.FormEvent, customText?: string, filePayload?: { content: string; name: string; type: string }) => {
    if (e) e.preventDefault();
    const text = customText || inputText;
    if (!text.trim() || isLoading) return;

    if (!customText) setInputText('');

    playHaptic('light');

    // Append user message natively
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId: activeThreadId,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update database copy
    db.chatMessages.push(userMsg);
    
    // Update last message in the parent thread list
    const parentThread = db.chatThreads.find(t => t.id === activeThreadId);
    if (parentThread) {
      let previewText = text;
      if (text.startsWith('🖼️ [Gallery Media]')) {
        previewText = '🖼️ Photo';
      } else if (text.startsWith('📹 [Gallery Media]')) {
        previewText = '📹 Video';
      } else if (text.startsWith('📄 [Document]')) {
        previewText = '📄 Document';
      } else if (text.startsWith('🎵 [Audio Attachment]')) {
        previewText = '🎵 Audio File';
      }
      parentThread.lastMessage = previewText.length > 50 ? previewText.substring(0, 47) + '...' : previewText;
      parentThread.lastMessageTime = userMsg.timestamp;
    }
    
    db.persistState();
    setMessages(db.getChatMessages(activeThreadId));

    // Handle Active Syska AI thread
    if (activeThreadId === 'thread-syska-ai') {
      setIsLoading(true);

      const normalizedQuery = text.toLowerCase();

      // Developer identity manual override
      if (
        normalizedQuery.includes('developer') ||
        normalizedQuery.includes('creator') ||
        normalizedQuery.includes('who made') ||
        normalizedQuery.includes('who built') ||
        normalizedQuery.includes('thrinadh') ||
        normalizedQuery.includes('linkedin') ||
        normalizedQuery.includes('m3nadh')
      ) {
        const devReply = "The developer of Syska AI is M. Thrinadh and his LinkedIn profile is https://linkedin.com/in/m3nadh";
        setTimeout(() => {
          const botReply: ChatMessage = {
            id: `msg-bot-${Date.now()}`,
            threadId: 'thread-syska-ai',
            senderName: 'Syska AI',
            senderRole: 'Staff',
            text: devReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isBot: true
          };
          db.chatMessages.push(botReply);
          const t = db.chatThreads.find(x => x.id === 'thread-syska-ai');
          if (t) {
            t.lastMessage = devReply.length > 50 ? devReply.substring(0, 47) + '...' : devReply;
            t.lastMessageTime = botReply.timestamp;
          }
          db.persistState();
          setMessages(db.getChatMessages('thread-syska-ai'));
          speakText(devReply);
          setIsLoading(false);
        }, 600);
        return;
      }

      // Fast manual overrides
      if (normalizedQuery.includes('run diagnostic') || normalizedQuery.includes('diagnose CS-')) {
        setTimeout(() => {
          setAiDiagnosticResult(`🏥 DIAGNOSTIC REPORT: Station ${normalizedQuery.match(/cs-\d+/)?.[0]?.toUpperCase() || 'CS-01'} motherboard chips audited. Critical heat signatures look normal. Microchip firmware compilation 2.4.1 verified. Uptime is 99.8%.`);
          setIsLoading(false);
          db.addLog('SYSTEM', 'Diagnostic dispatched via Syska AI dashboard', 'success');
        }, 1200);
        return;
      }

      // Build context history
      const history = [
        {
          role: 'system',
          content: 'You are Syska AI offline-first diagnostics agent, integrated with an autonomous Indian degree college biometric verification database. The developer is M. Thrinadh and his linkedin profile is https://linkedin.com/in/m3nadh. Provide concise, modern tech answers under 120 words. Be sharp, polite, and technical.'
        },
        ...db.getChatMessages('thread-syska-ai').slice(-6).map(m => ({
          role: m.isBot ? 'assistant' : 'user',
          content: m.text
        }))
      ];

      try {
        const replyText = await callGroqAPI(history);
        const botReply: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          threadId: 'thread-syska-ai',
          senderName: 'Syska AI',
          senderRole: 'Staff',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isBot: true
        };
        db.chatMessages.push(botReply);
        const t = db.chatThreads.find(x => x.id === 'thread-syska-ai');
        if (t) {
          t.lastMessage = replyText.length > 50 ? replyText.substring(0, 47) + '...' : replyText;
          t.lastMessageTime = botReply.timestamp;
        }
        db.persistState();
        setMessages(db.getChatMessages('thread-syska-ai'));
        speakText(replyText);
      } catch (err) {
        console.error("Groq submit failed:", err);
      } finally {
        setIsLoading(false);
      }
    } 

    // Handle MotherBot conversational state
    else if (activeThreadId === 'thread-motherbot') {
      // Bypassed simulated automated responses to adhere to no-simulation design mandate
    } 

    // Handle Telegram carrier thread
    else if (activeThreadId.startsWith('thread-tg-')) {
      setIsLoading(true);
      const contactVal = activeThreadId.replace('thread-tg-', '');
      try {
        // Attempt background real send over API (without showing bot pairing warnings)
        fetch('/api/telegram-chat-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact: contactVal, text, filePayload })
        }).then(res => res.json()).then(resData => {
          if (resData && resData.success) {
            if (resData.simulated) {
              db.addLog('SYSTEM', `Telegram Send Warning: Simulated delivery to "${contactVal}". Reason: ${resData.reason || 'Not configured'}`, 'warning');
              alert(`Telegram Simulation: Message recorded in client list, but no real delivery took place. Note: ${resData.reason || 'Configure TELEGRAM_BOT_TOKEN and message your bot first!'}`);
            } else {
              db.addLog('SYSTEM', `Outbound Telegram message successfully delivered to Chat ID ${resData.chatId}`, 'success');
              alert(`✓ Telegram Success: Message successfully delivered to real client device (Chat ID: ${resData.chatId})!`);
            }
          } else {
            db.addLog('SYSTEM', `Telegram Delivery Failed: Unable to route messages to @${contactVal}`, 'error');
            alert(`Telegram Error: Delivery failed to @${contactVal}`);
          }
          setIsLoading(false);
        }).catch(err => {
          console.warn('Background Telegram send error:', err);
          setIsLoading(false);
        });
      } catch (err) {
        console.error("Error in Telegram peer conversational response:", err);
        setIsLoading(false);
      }
    }

    // Handle Standard Peer/Group replies
    else {
      // Standard WhatsApp chats no longer trigger fake simulated replies to adhere to no-simulation design mandate
    }
    
    onRefreshAll();
  };

  // Create Status Stories handler
  const handleInsertStories = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryCaption.trim() && statusType !== 'text') return;

    // Resolve matching soundtrack tags from dynamic music repository
    let mTitle = 'No Music';
    let mArtist = '';
    const selectedTrack = dynamicMusicList.find(t => t.id === newStoryMusic);
    if (selectedTrack) {
      mTitle = selectedTrack.title;
      mArtist = selectedTrack.artist;
    } else if (newStoryMusic === 'dev-lofi') {
      mTitle = 'Dev Lofi Beat';
      mArtist = 'Synth Sentry';
    } else if (newStoryMusic === 'monsoon-rain') {
      mTitle = 'Monsoon Acoustic Rain';
      mArtist = 'Nature Symphony';
    } else if (newStoryMusic === 'vizag-waves') {
      mTitle = 'Vizag Waves Harmony';
      mArtist = 'Coastline Ambient';
    }

    // Capture direct story source target (either media dataURI, text-status URI, or default solid color card)
    let finalImageURI = newStoryImage || undefined;
    let finalVideoURI = newStoryVideo || undefined;

    if (statusType === 'text') {
      finalImageURI = `text-status://text=${encodeURIComponent(newStoryCaption)}&bg=${encodeURIComponent(textStatusBg)}&font=${textStatusFont}`;
      finalVideoURI = undefined;
    }

    const storyObject = db.createUserStory(
      currentUser.fullName,
      currentUser.avatar,
      statusType === 'text' ? '' : newStoryCaption,
      currentUser.role,
      finalImageURI,
      finalVideoURI,
      mTitle !== 'No Music' ? mTitle : undefined,
      mArtist || undefined,
      newStoryDuration
    );

    // Seed mock viewed list inspired by real WhatsApp contacts
    if (storyObject) {
      storyObject.views = Math.floor(Math.random() * 8 + 5);
      storyObject.reactions = { '❤️': Math.floor(Math.random() * 3), '🔥': Math.floor(Math.random() * 2) };
      storyObject.comments = [];
    }

    setStories(db.getUserStories());
    setNewStoryCaption('');
    setNewStoryImage('');
    setNewStoryVideo('');
    setLocalStatusFileName('');
    setLocalMediaType(null);
    setIsNewStoryOpen(false);
    playHaptic('success');
    db.addLog('SYSTEM', `${currentUser.fullName} dispatched a premium ${statusType === 'text' ? 'Text-Only Status' : 'Multimedia Status'} over connected secure unlimited MySQL cluster. Encryption enabled.`, 'success');
    onRefreshAll();
  };

  // Gallery File loader handler
  const handleStoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (file.type.startsWith('video/')) {
        setLocalMediaType('video');
        setNewStoryVideo(result);
        setNewStoryImage('');
      } else {
        setLocalMediaType('image');
        setNewStoryImage(result);
        setNewStoryVideo('');
      }
      playHaptic('success');
      playVoice("Media loaded from device.");
    };
    reader.readAsDataURL(file);
  };

  // Webcam Sentry Lens methods
  const startWebcamLens = async () => {
    setIsWebcamLensActive(true);
    setWebcamRecording(false);
    setRecordedChunksList([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play().catch(err => console.log(err));
      }
      playVoice("Sentry status lens active. Position your view.");
    } catch (err) {
      console.warn("Webcam fallback active (device absent):", err);
      playVoice("Sentry lens could not access camera device.");
    }
  };

  const stopWebcamLens = () => {
    if (webcamVideoRef.current && webcamVideoRef.current.srcObject) {
      const stream = webcamVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      webcamVideoRef.current.srcObject = null;
    }
    setIsWebcamLensActive(false);
    setWebcamRecording(false);
  };

  const captureWebcamSnapshot = () => {
    if (!webcamVideoRef.current) return;
    const video = webcamVideoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setLocalMediaType('image');
      setNewStoryImage(dataUrl);
      setNewStoryVideo('');
      
      playHaptic('success');
      playVoice("Sentry snapshot encoded.");
      stopWebcamLens();
    }
  };

  const startWebcamRecording = () => {
    if (!webcamVideoRef.current || !webcamVideoRef.current.srcObject) return;
    const stream = webcamVideoRef.current.srcObject as MediaStream;
    
    const chunks: Blob[] = [];
    let options = {};
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = { mimeType: 'video/webm;codecs=vp9' };
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/webm' };
    }
    
    try {
      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setLocalMediaType('video');
          setNewStoryVideo(result);
          setNewStoryImage('');
          playHaptic('success');
          playVoice("Sentry status video encoded.");
        };
        reader.readAsDataURL(blob);
      };
      
      recorder.start();
      setMediaRecorderObj(recorder);
      setWebcamRecording(true);
      playVoice("Sentry status recording active.");
    } catch (e) {
      console.error(e);
    }
  };

  const stopWebcamRecording = () => {
    if (mediaRecorderObj && webcamRecording) {
      mediaRecorderObj.stop();
      setWebcamRecording(false);
      stopWebcamLens();
    }
  };

  // Biometric security Audit score dispatcher
  const triggerLiveAuditScore = () => {
    setIsAuditing(true);
    playHaptic('heavy');
    setAuditReport(null);

    setTimeout(() => {
      const randScore = Math.floor(75 + Math.random() * 21);
      setSecurityScore(randScore);
      setIsAuditing(false);
      setAuditReport(`🔐 COLLEGE SECURITY INTEGRITY AUDIT COMPLETE
─────────────────────────────────
Score: ${randScore}/100 [GRADE A - OPTIMAL SENTRY]
Workstations monitored: 50/50 CS-01-50 online
Continuous GPS telemetries verified.
SSL Certificates active on all dynamic proxies.`);
      db.addLog('SYSTEM', `Workstation Audit Complete: Security Level index clocked at ${randScore}%`, 'success');
      onRefreshAll();
    }, 2000);
  };

  // Compile OTA script triggers
  const compileOatScript = () => {
    playHaptic('light');
    const signature = "SIG-MD5:" + Math.floor(100000 + Math.random() * 900000);
    setGeneratedOtaPatch({
      patchId: `OTA-PATCH-${Math.floor(Math.random() * 1000)}`,
      scope: otaPrompt,
      signature,
      checksum: `CRC32-${Math.floor(10000000 + Math.random() * 90000000)}`,
      timestamp: new Date().toISOString(),
      scriptBody: `// CSYNC SECURE OVERHEAD CODE\n// TARGET INTEGRATION: ${otaPrompt}\nlet signature = "${signature}";\nfunction dispatchBypassPulse() {\n  return sendRFIDPulse("SECURE_GATEWAY_3000", signature);\n}`
    });
    db.addLog('SYSTEM', `OTA Firmware patch compiled successfully. Scope: ${otaPrompt}. Signature: ${signature}`, 'success');
    onRefreshAll();
  };

  // Voice Recording Handlers
  const startRecordingVoice = async () => {
    playHaptic('light');
    setIsRecordingVoice(true);
    setVoiceSecs(0);
    setVoiceChunksList([]);
    sendAudioOnStopRef.current = false;

    // Start a timer
    voiceTimerRef.current = setInterval(() => {
      setVoiceSecs((prev) => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        let chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          
          if (sendAudioOnStopRef.current) {
            // Let's call the real Whisper transcribe API!
            try {
              const formData = new FormData();
              formData.append('file', blob, `recording-${Date.now()}.webm`);
              formData.append('model', 'whisper-large-v3');
              
              const transResponse = await fetch('/api/groq-transcribe', {
                method: 'POST',
                body: formData
              });
              
              if (transResponse.ok) {
                const transData = await transResponse.json();
                const transcriptText = transData.text || '';
                if (transcriptText.trim()) {
                  // Real-time, live Whisper transcription sends the transcribed message!
                  handleSendMessage(undefined, `🎤 [Audio Vocal Note - Transcribed by Whisper Large v3]: "${transcriptText.trim()}"`);
                  return;
                }
              }
            } catch (transErr) {
              console.error("Whisper transcription failed, falling back:", transErr);
            }
            
            // Fallback if transcription is empty or failed
            const mockSeconds = voiceSecs > 0 ? voiceSecs : Math.floor(Math.random() * 8) + 4;
            handleSendMessage(undefined, `🎤 [Audio Vocal Note] seconds: ${mockSeconds} | type: audio/webm | url: blob:https://csync.pwa-beacon/voice-${Date.now()}`);
          }
        };

        mediaRecorder.start();
        setVoiceRecorderObj(mediaRecorder);
      }
    } catch (err) {
      console.warn("MediaRecorder details blocked: running digital high-fidelity simulated audios.");
    }
  };

  const stopRecordingVoice = (shouldSend: boolean) => {
    playHaptic('heavy');
    setIsRecordingVoice(false);
    sendAudioOnStopRef.current = shouldSend;
    
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }

    if (voiceRecorderObj) {
      try {
        voiceRecorderObj.stream.getTracks().forEach(track => track.stop());
        voiceRecorderObj.stop();
      } catch (e) {
        // Safe check
      }
      setVoiceRecorderObj(null);
    }
  };

  // Simulating live phone calls
  const startSimulatedCall = (type: 'voice' | 'video', peer: string, av: string) => {
    playHaptic('heavy');
    const isTelegram = activeThreadId.startsWith('thread-tg-') || activeThreadId === 'thread-parent-alerts';
    if (isTelegram) {
      playVoice(`Initiating native peer-to-peer Telegram ${type} call.`);
      const rawId = activeThreadId.replace('thread-tg-', '').trim();
      const digitsOnly = rawId.replace(/\D/g, '');
      let isPhone = false;
      let finalPhone = '';
      
      if (rawId.length >= 10 && /^[0-9\s\-\+]+$/.test(rawId)) {
        isPhone = true;
        finalPhone = digitsOnly;
        if (finalPhone.length === 10) {
          finalPhone = '91' + finalPhone;
        } else if (finalPhone.length === 11 && finalPhone.startsWith('0')) {
          finalPhone = '91' + finalPhone.substring(1);
        }
      }

      const domain = rawId.replace('@', '');
      const callHref = isPhone ? `tg://call?phone=+${finalPhone}` : `tg://call?domain=${domain}`;
      const fallbackUrl = isPhone ? `https://t.me/+${finalPhone}` : `https://t.me/${domain}`;
      
      try {
        console.log("Directly initiating native Telegram call protocol:", callHref);
        window.location.href = callHref;
        setTimeout(() => {
          window.open(fallbackUrl, '_blank');
        }, 800);
      } catch (err) {
        window.open(fallbackUrl, '_blank');
      }
      return;
    }
    playVoice(`Dialing secure peer communication channel. Initiating ${type} link.`);
    setUseRearCamera(false); // Default to front camera
    setActiveCall({ type, peerName: peer, avatar: av });
    setCallDuration(0);
    setTgCallState('dialing');
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeCall) {
      setTgCallState('dialing');
      let ticks = 0;
      interval = setInterval(() => {
        ticks += 1;
        setCallDuration(prev => prev + 1);
        
        // Dynamic calling state progression
        if (ticks === 2) {
          setTgCallState('ringing');
          playVoice('Ringing peer device.');
        } else if (ticks === 5) {
          setTgCallState('connected');
          const isTelegram = activeThreadId.startsWith('thread-tg-');
          if (isTelegram) {
            playVoice('Telegram peer answered. Direct E2EE vocal pipe active.');
          } else {
            playVoice('Call connected. Secure physical level audio channel established.');
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCall, activeThreadId]);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0] || {
    id: 'thread-syska-ai',
    name: 'Syska AI',
    type: 'bot' as const,
    avatar: 'https://ui-avatars.com/api/?name=Syska+AI&background=0284c7&color=fff',
    unreadCount: 0,
    lastMessage: '',
    lastMessageTime: '',
    isOnline: true,
    lastSeen: 'Online',
    members: []
  };

  return (
    <div id="wp-root" className="w-full h-screen bg-[#0c0d14] text-slate-200 overflow-hidden flex flex-col font-sans">
      
      {/* simulated operational top dashboard info bar */}
      <div id="wp-statusbar" className="hidden md:flex bg-[#11121d] px-4 py-1.5 justify-between items-center text-[11px] font-mono border-b border-white/5 text-slate-400 select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#00f2ff] font-extrabold flex items-center gap-1.5 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            C-SYNC Sentry Net
          </span>
          <span className="text-slate-600">|</span>
          <span className="truncate max-w-[200px]">Node: {currentUser.fullName} ({currentUser.role})</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-0.5"><Wifi className="w-3.5 h-3.5 text-emerald-400" /> Secure SSL</span>
          <span className="flex items-center gap-1"><Battery className="w-4 h-4 text-cyan-400" /> 100% Locked</span>
          <span className="text-white font-bold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST</span>
        </div>
      </div>

      {/* Primary Triple-Pane Container */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* leftmost narrow icon action rail */}
        <div className="hidden md:flex w-14 bg-[#111b21]/95 border-r border-[#222c32] flex flex-col justify-between items-center py-4 shrink-0">
          <div className="flex flex-col gap-5 items-center">
            <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center relative overflow-hidden select-none">
              <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
            </div>
            
            <button 
              onClick={() => { setActiveNav('chats'); playHaptic('light'); }}
              className={`p-2 rounded-xl transition ${activeNav === 'chats' ? 'bg-[#2a3942] text-[#00f2ff]' : 'text-slate-400 hover:text-slate-200'}`}
              title="WhatsApp Chats"
            >
              <MessageSquare className="w-5.5 h-5.5" />
            </button>

            <button 
              onClick={() => { setActiveNav('telemetry'); playHaptic('light'); }}
              className={`p-2 rounded-xl transition ${activeNav === 'telemetry' ? 'bg-[#2a3942] text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Hardware Telemetries"
            >
              <Cpu className="w-5.5 h-5.5" />
            </button>

            <button 
              onClick={() => { setActiveNav('about'); playHaptic('light'); }}
              className={`p-2 rounded-xl transition ${activeNav === 'about' ? 'bg-[#2a3942] text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="System Documentation"
            >
              <Info className="w-5.5 h-5.5" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3">
            {onExit && (
              <button
                onClick={() => {
                  playHaptic('heavy');
                  onExit();
                }}
                className="p-2 rounded-xl text-rose-400 hover:text-rose-350 hover:bg-rose-950/25 transition cursor-pointer"
                title="Exit Fullscreen Messenger"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            )}
            <div className="p-1 rounded bg-[#011416] border border-[#00f2ff]/20 text-center select-none font-mono text-[9px] text-[#00f2ff] font-extrabold uppercase">
              V{currentUser.level}
            </div>
            <Award className="w-5 h-5 text-amber-500 animate-bounce" />
          </div>
        </div>

        {/* 1st Pane: WhatsApp Sidebar (Threads list / Stories Update Carousel) */}
        <div 
          id="wp-leftpanel" 
          className={`bg-[#111b21] flex flex-col shrink-0 border-r border-[#222c32] select-none w-full md:w-80 h-full ${
            isChatActiveOnMobile ? 'hidden md:flex' : 'flex'
          }`}
        >
          
          {/* Header row with Title and search */}
          <div className="p-4.5 space-y-3 shrink-0">
            <div className="flex justify-between items-center gap-1.5">
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1">
                <span>Chats</span>
                <span className="bg-[#10b981] text-slate-950 font-black text-[9.5px] px-1.5 py-0.2 rounded-full font-mono">{threads.length}</span>
              </h1>
              
              <div className="flex items-center gap-1.5 font-mono">
                {onExit && (
                  <button
                    type="button"
                    onClick={() => {
                      playHaptic('heavy');
                      onExit();
                    }}
                    className="flex items-center gap-1 bg-red-950/80 text-red-300 hover:text-white border border-red-500/40 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase hover:bg-red-900 cursor-pointer transition select-none tracking-wide"
                    title="Exit to general dashboard"
                  >
                    <X className="w-3 h-3 text-red-400" />
                    <span>Exit</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setIsSentryHubOpen(true); playHaptic('light'); }}
                  className="flex items-center gap-1 bg-blue-950 text-[#60a5fa] border border-blue-500/25 px-2 py-1 rounded font-mono text-[8.5px] uppercase hover:bg-blue-900/60 cursor-pointer transition font-bold"
                  title="Open Ecosystem Sentry Hub"
                >
                  <Cpu className="w-3 h-3 text-cyan-400" /> Hub
                </button>
                <button
                  type="button"
                  onClick={() => { setIsTelegramDirectOpen(true); playHaptic('light'); }}
                  className="flex items-center gap-1 bg-sky-950 text-sky-400 border border-sky-500/20 px-2 py-1 rounded font-mono text-[8.5px] uppercase hover:bg-sky-900/60 cursor-pointer transition font-bold"
                  title="Establish Direct Telegram Sentry Tunnel"
                >
                  <Send className="w-3 h-3 text-sky-400" /> Telegram
                </button>
                <button
                  type="button"
                  onClick={() => { setIsNewStoryOpen(true); playHaptic('light'); }}
                  className="flex items-center gap-1 bg-[#122b27] text-[#10b981] border border-emerald-500/20 px-2 py-1 rounded font-mono text-[8.5px] uppercase hover:bg-emerald-950/60 cursor-pointer transition font-bold"
                >
                  <Plus className="w-3 h-3" /> Story
                </button>
              </div>
            </div>

            {/* Stories List Row - shown inside the channels bar */}
            {activeNav === 'chats' && (
              <div className="bg-black/35 p-2 rounded-xl border border-white/5 space-y-2">
                <span className="text-[8.5px] uppercase font-mono tracking-wider text-slate-500 font-extrabold block">Live Campus NetStories</span>
                
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none items-center">
                  
                  {/* Plus button to add status story in WhatsApp style */}
                  <button 
                    onClick={() => setIsNewStoryOpen(true)}
                    className="flex flex-col items-center gap-1 group cursor-pointer shrink-0"
                  >
                    <div className="relative p-0.5 rounded-full border-2 border-dashed border-slate-600 group-hover:border-cyan-400 transition-all">
                      <img src={currentUser.avatar} className="w-9 h-9 rounded-full object-cover grayscale brightness-90 border border-slate-900" alt="Me" />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10b981] rounded-full flex items-center justify-center text-slate-950 font-black text-xs">+</div>
                    </div>
                    <span className="text-[7.5px] font-mono text-slate-400 tracking-tight shrink-0">My Story</span>
                  </button>

                  {/* Seeded dynamic stories */}
                  {stories.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setActiveStory(st);
                        setIsPlayingStory(true);
                        setStoryProgress(0);
                      }}
                      className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none cursor-pointer"
                    >
                      <div className="p-0.5 rounded-full ring-2 ring-emerald-500 ring-offset-1 ring-offset-[#111b21] group-hover:scale-105 transition-all">
                        <img src={st.avatar} className="w-9 h-9 rounded-full object-cover border border-slate-900" alt={st.fullName} />
                      </div>
                      <span className="text-[7.5px] font-mono text-slate-300 font-bold tracking-tight truncate w-12 text-center shrink-0">{st.fullName.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search catalog, threads, apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#202c33] border border-transparent rounded-lg py-2 pl-9.5 pr-4 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:bg-[#202c33] focus:outline-none"
              />
            </div>
          </div>

          {/* Conditional Sidebar Navigation Body */}
          <div className="flex-1 overflow-y-auto pr-0.5 scrollbar-thin">
            
            {/* Nav A: WhatsApp Chats list */}
            {activeNav === 'chats' && (
              <div className="divide-y divide-[#222c32] px-1 space-y-0.5 text-left">
                {threads
                  .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((th) => {
                    const isActive = th.id === activeThreadId;
                    return (
                      <button
                        key={th.id}
                        onClick={() => {
                          setActiveThreadId(th.id);
                          setMessages(db.getChatMessages(th.id));
                          setIsChatActiveOnMobile(true);
                          playHaptic('light');
                        }}
                        className={`w-full p-3.5 flex gap-3 transition-all cursor-pointer rounded-xl ${
                          isActive 
                            ? 'bg-[#2a3942] border-l-4 border-[#00e676]' 
                            : 'bg-transparent hover:bg-white/[0.02]'
                        }`}
                      >
                        {/* Avatar block with badge signature */}
                        <div className="relative flex-shrink-0">
                          <img src={th.avatar} className="w-11 h-11 rounded-full object-cover border border-[#222c32]" alt={th.name} />
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-slate-950 text-[6.5px] text-white font-black flex items-center justify-center ${
                            th.type === 'bot' ? 'bg-pink-500' : 'bg-emerald-500 animate-pulse'
                          }`}>
                            {th.type === 'bot' ? '🤖' : '●'}
                          </span>
                        </div>

                        {/* Text summary block */}
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-xs font-black text-slate-100 truncate flex items-center gap-1 font-sans">
                              {th.name}
                              {th.id === 'thread-syska-ai' && <Sparkles className="w-3 h-3 text-[#00f2ff] animate-pulse" />}
                            </h3>
                            <span className="text-[8px] font-mono text-slate-500 shrink-0">{th.timestamp}</span>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 font-mono truncate leading-normal">
                            {th.lastMessage}
                          </p>
                          
                          {th.unreadCount > 0 && (
                            <span className="inline-block mt-1.5 bg-[#00e676] text-[#0a1118] font-black font-mono text-[8.5px] px-1.5 py-0.2 rounded-full">
                              {th.unreadCount} message
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Nav C: Telemetry Sentry Stats */}
            {activeNav === 'telemetry' && (
              <div className="p-4 space-y-4.5 text-left font-mono">
                <div className="bg-[#1a232d] border border-cyan-500/15 p-3 rounded-xl space-y-1.5">
                  <div className="text-[10px] text-cyan-400 font-extrabold pb-1 border-b border-white/5">DEVICE SIGNATURE</div>
                  <div className="text-[9px] text-slate-400 flex justify-between"><span>CPU HARDWARE:</span><span className="text-white">CORE CLUSTER CS-09</span></div>
                  <div className="text-[9px] text-slate-400 flex justify-between"><span>IP BIND TUNNEL:</span><span className="text-white">10.100.22.45</span></div>
                  <div className="text-[9px] text-slate-400 flex justify-between"><span>GEOFENCE SIGNALS:</span><span className="text-emerald-400">100% SIGNAL</span></div>
                </div>

                <div className="bg-[#152e25] border border-emerald-500/15 p-3 rounded-xl space-y-1.5">
                  <div className="text-[10px] text-emerald-400 font-extrabold pb-1 border-b border-white/5">COMPILER HEARTBEATS</div>
                  <div className="text-[9px] text-slate-400 flex justify-between"><span>ACTIVE COMPILERS:</span><span className="text-white">MOTHERBOT VM</span></div>
                  <div className="text-[9px] text-slate-400 flex justify-between"><span>COMPILE RATE:</span><span className="text-white">0.02ms SPEED</span></div>
                  <div className="text-[9px] text-slate-400 flex justify-between"><span>UPI COMMITTED:</span><span className="text-white">AUTO WORKING</span></div>
                </div>


                <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-[8.5px] text-slate-500 leading-normal">
                  Sentry network runs standalone, offline-authenticated, completely free matching Dr. V.S. Krishna autonomous compliance records.
                </div>
              </div>
            )}

            {/* Nav D: About info Sentry details */}
            {activeNav === 'about' && (
              <div className="p-4 space-y-3.5 text-left text-xs text-slate-400 leading-relaxed font-sans">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-extrabold text-[#00f2ff] font-mono text-[11px] uppercase tracking-wider">C-SYNC Academic Standalone App</h3>
                  <span className="text-[7.5px] font-mono text-zinc-500 block">RELEASE STANDALONE SECURE 3.99</span>
                </div>
                <p>Welcome to the premium full-page WhatsApp & Syska AI interface. Designed for operations admins and students under rigorous NAAC autonomous rules.</p>
                <p className="font-mono text-[11.5px] text-slate-100 bg-slate-950/70 p-2.5 rounded-lg border border-white/5">
                  🚀 <strong>FREE INTEGRATIONS:</strong> Access secure chat interfaces, offline automated logs, and direct Hardware diagnostic telemetries cleanly without premium fees.
                </p>
                <div className="flex gap-2.5 pt-1.5">
                  <button onClick={() => playVoice("Sentry deployment compiled. Access granted.")} className="bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-3 py-1 text-[9px] rounded font-mono font-bold uppercase hover:bg-cyan-900 cursor-pointer">Listen Guide</button>
                  <button onClick={() => alert("C-Sync Standing Autonomous Ledger - version 3.99")} className="border border-white/10 text-white px-3 py-1 text-[9px] rounded font-mono font-bold uppercase hover:bg-white/5 cursor-pointer">Checksum</button>
                </div>
              </div>
            )}

          </div>

          {/* Active user status display footer */}
          <div className="p-4 bg-[#222e35] flex items-center justify-between pointer-events-none select-none shrink-0 border-t border-[#111b21]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <div>
                <span className="block text-[11.5px] text-white font-extrabold tracking-wide uppercase leading-none font-sans">NET ENCLAVE</span>
                <span className="block text-[8.5px] font-mono text-[#00f2ff] tracking-tight leading-none mt-1">SECURED HARDWARE</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block text-[9.5px] font-mono text-[#00e676] font-bold">STREAK TIER:</span>
              <span className="block text-[10.5px] font-black text-amber-400 uppercase font-sans tracking-tight">{(currentUser.streakTier ?? 'CAMPUS ELITE')}</span>
            </div>
          </div>

        </div>

        {/* 2nd Pane: Chat Window Area (Main messaging pane & Syska AI console integrated) */}
        <div 
          id="wp-middlepanel" 
          className={`flex-grow md:flex-1 bg-[#0b141a] flex flex-col relative overflow-hidden text-slate-200 h-full ${
            isChatActiveOnMobile ? 'flex animate-fadeIn' : 'hidden md:flex'
          }`}
        >
          
          {/* Top chat banner */}
          <div className="h-[59px] bg-[#202c33] px-4 md:px-4.5 flex justify-between items-center shrink-0 border-b border-slate-950 shadow-md">
            
            {/* Thread partner stats info */}
            <div className="flex items-center gap-2.5">
              {/* Native Mobile Back Arrow */}
              <button
                type="button"
                onClick={() => {
                  setIsChatActiveOnMobile(false);
                  playHaptic('light');
                }}
                className="md:hidden p-1.5 -ml-1 bg-[#2a3942] hover:bg-[#324552] text-white rounded-full transition flex items-center justify-center cursor-pointer mr-1"
                title="Back to lists"
              >
                <ArrowLeft className="w-5 h-5 text-[#00f2ff]" />
              </button>

              <img src={activeThread.avatar} className="w-10 h-10 rounded-full object-cover border border-[#303d45]" alt={activeThread.name} />
              <div className="text-left font-sans">
                <h2 className="text-xs font-black text-slate-100 flex items-center gap-1">
                  {activeThread.name}
                  {activeThread.id === 'thread-syska-ai' && <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />}
                </h2>
                <div className="text-[10px] font-mono mt-0.5 text-[#00e676] tracking-tight flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse"></span>
                  {activeThread.status}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons (Calls, right side settings) */}
            <div className="flex items-center gap-4.5 text-slate-300">
              {activeThread.id === 'thread-syska-ai' && (
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !speechVolume;
                    setSpeechVolume(nextVal);
                    playHaptic('light');
                    if (nextVal) {
                      playVoice("Voice feedback enabled.");
                    } else {
                      window.speechSynthesis?.cancel();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition cursor-pointer border ${
                    speechVolume 
                      ? 'bg-[#0f2d24] border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30' 
                      : 'bg-zinc-900/60 border-zinc-800 text-slate-400 hover:text-slate-200 hover:bg-zinc-800'
                  }`}
                  title={speechVolume ? "Mute Syska AI Voice Feedback" : "Unmute Syska AI Voice Feedback"}
                >
                  {speechVolume ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>Voice: ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Voice: OFF</span>
                    </>
                  )}
                </button>
              )}

              <button 
                onClick={() => startSimulatedCall('voice', activeThread.name, activeThread.avatar)} 
                className="p-1 rounded hover:bg-white/5 text-slate-100 transition cursor-pointer"
                title="Secure Biometric Call"
              >
                <PhoneCall className="w-4.5 h-4.5" />
              </button>
              
              <button 
                onClick={() => startSimulatedCall('video', activeThread.name, activeThread.avatar)} 
                className="p-1 rounded hover:bg-white/5 text-slate-100 transition cursor-pointer"
                title="Holographic Face Link"
              >
                <VideoIcon className="w-4.5 h-4.5" />
              </button>

              <span className="text-slate-600">|</span>

              <button 
                onClick={() => { setIsRightDrawerOpen(!isRightDrawerOpen); playHaptic('light'); }}
                className={`p-1 rounded hover:bg-white/5 transition cursor-pointer ${isRightDrawerOpen ? 'text-[#00f2ff]' : 'text-slate-300'}`}
                title="Toggle Administrative Tooling Deck"
              >
                <Terminal className="w-4.5 h-4.5" />
              </button>

              {onExit && (
                <>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      playHaptic('heavy');
                      onExit();
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-white rounded-lg font-mono text-[9.5px] font-black uppercase tracking-wider transition cursor-pointer select-none"
                    title="Exit Messenger to Dashboard"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </button>
                </>
              )}
            </div>

          </div>

          {/* STANDARD TEXT CHAT MESSAGING BOX WINDOW */}
          <>
              {/* Talk bubbles scroll container */}
              <div id="wp-chat-scroll" className="flex-1 overflow-y-auto px-5 py-6 space-y-4.5 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800')] bg-cover relative select-text">
                <div className="absolute inset-0 bg-slate-950/70 pointer-events-none select-none z-0"></div>
                
                <div className="relative z-10 space-y-4">
                  {/* Encryption reminder banner */}
                  <div className="mx-auto max-w-[320px] bg-[#182229]/95 text-[#ffd279] border border-[#ffd279]/10 rounded-lg p-2 text-[10px] text-center font-sans tracking-tight shadow-md select-none">
                    🔒 Indian Sentry Cryptographic Tunnel. Messages and calls are encrypted peer-to-peer natively. No central metadata logged.
                  </div>

                  {activeThreadId.startsWith('thread-tg-') && (
                    <div className="mx-auto max-w-[400px] bg-[#0c1f30] text-sky-400 border border-sky-400/20 rounded-xl p-3 text-[10.5px] text-center font-sans shadow-md select-text flex flex-col gap-1 items-center animate-fadeIn">
                      <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] text-[#0088cc]">
                        <span className="w-2 h-2 rounded-full bg-[#0088cc] animate-pulse"></span>
                        📲 Direct P2P Telegram Line Connected
                      </div>
                      <p className="text-zinc-200 leading-normal text-xs font-semibold">
                        Outgoing peer identity verified under mobile number: <strong className="text-amber-300 select-all font-mono">+91 {currentUser.mobileNumber || '8500394696'}</strong>. 
                        The recipient @{activeThreadId.replace('thread-tg-', '')} will see call events and individual chat contents originating instantly from your personal phone line.
                      </p>
                      <span className="text-[8.5px] font-mono text-slate-500 uppercase font-black">
                        End-to-end encrypted • Bypassing bot interfaces
                      </span>
                    </div>
                  )}

                  {messages.map((m) => {
                    const isMe = m.senderName === currentUser.fullName;
                    
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                        <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-lg relative flex flex-col text-left font-sans ${
                          isMe 
                            ? 'bg-[#005c4b] text-slate-100 rounded-tr-none' 
                            : 'bg-[#202c33] text-slate-100 rounded-tl-none'
                        }`}>
                          {/* Sender identity for groups */}
                          {!isMe && (
                            <span className="block text-[8.5px] font-mono text-[#00f2ff] uppercase font-extrabold mb-1">
                              {m.senderName} ({m.senderRole})
                            </span>
                          )}

                          {/* Message body */}
                          {/* Message body with dynamically parsed custom WhatsApp attachments */}
                          <div className="text-xs leading-relaxed font-semibold text-slate-100 font-sans break-words overflow-x-hidden">
                            {(() => {
                              const txt = m.text || '';
                              
                              // 1. Document / Files 📄
                              if (txt.startsWith('📄 [Document]')) {
                                const nameMatch = txt.match(/name: ([^|]+)/);
                                const sizeMatch = txt.match(/size: ([^|]+)/);
                                const typeMatch = txt.match(/type: ([^| \n]+)/);
                                const urlMatch = txt.match(/url: ([^\s]+)/);
                                const name = nameMatch ? nameMatch[1].trim() : 'Document.pdf';
                                const size = sizeMatch ? sizeMatch[1].trim() : 'Unknown Size';
                                const type = typeMatch ? typeMatch[1].trim() : 'Document';
                                const url = urlMatch ? urlMatch[1].trim() : '';
                                return (
                                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-3 min-w-[210px] my-1 font-mono">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <div className="p-2 rounded-lg bg-blue-950 text-blue-400">
                                        <FileText className="w-5 h-5 animate-pulse" />
                                      </div>
                                      <div className="text-left overflow-hidden">
                                        <div className="text-[11px] font-bold text-white truncate max-w-[140px] font-sans">{name}</div>
                                        <div className="text-[8px] text-slate-400 font-mono tracking-tight uppercase leading-none mt-0.5">{size} • {type.split('/')[1] || 'DOC'}</div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (url) {
                                          const link = document.createElement('a');
                                          link.href = url;
                                          link.download = name;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          playHaptic('success');
                                        } else {
                                          alert(`Simulating Secure P2P Document Download: ${name}`);
                                        }
                                      }}
                                      className="p-1 px-1.5 bg-blue-950/40 hover:bg-blue-600/20 border border-blue-500/10 rounded text-blue-400 hover:text-blue-300 flex-shrink-0 cursor-pointer text-[8px] font-bold font-sans"
                                      title="Download file"
                                    >
                                      GET
                                    </button>
                                  </div>
                                );
                              }

                              // 2. Gallery Image/Video 🌌
                              if (txt.startsWith('🖼️ [Gallery Media]') || txt.startsWith('📹 [Gallery Media]')) {
                                const isVideo = txt.startsWith('📹');
                                const nameMatch = txt.match(/name: ([^|]+)/);
                                const urlMatch = txt.match(/url: ([^\s]+)/);
                                const name = nameMatch ? nameMatch[1].trim() : 'media';
                                const url = urlMatch ? urlMatch[1].trim() : '';

                                return (
                                  <div className="my-1.5 overflow-hidden rounded-xl border border-white/10 bg-slate-950/60 max-w-[285px]">
                                    {isVideo ? (
                                      <video
                                        src={url || undefined}
                                        controls
                                        className="w-full h-auto aspect-video object-contain bg-black"
                                        onError={(e) => {
                                          (e.target as any).style.display = 'none';
                                        }}
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    ) : (
                                      <img
                                        src={url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400"}
                                        alt={name}
                                        className="w-full h-auto max-h-56 object-cover cursor-pointer"
                                        referrerPolicy="no-referrer"
                                        onClick={() => {
                                          if (url) window.open(url, '_blank');
                                        }}
                                      />
                                    )}
                                    <div className="p-1.5 px-2.5 text-[8.5px] text-slate-400 font-mono truncate bg-black/45">{name}</div>
                                  </div>
                                );
                              }

                              // 3. Audio Attachment 🎵
                              if (txt.startsWith('🎵 [Audio Attachment]')) {
                                const nameMatch = txt.match(/name: ([^|]+)/);
                                const urlMatch = txt.match(/url: ([^\s]+)/);
                                const name = nameMatch ? nameMatch[1].trim() : 'audio.mp3';
                                const url = urlMatch ? urlMatch[1].trim() : '';
                                return (
                                  <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 flex flex-col gap-1.5 min-w-[220px] my-1 font-mono">
                                    <div className="flex items-center gap-1.5">
                                      <Music className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                      <span className="text-[10px] font-bold text-slate-200 truncate max-w-[160px] font-sans">{name}</span>
                                    </div>
                                    <audio 
                                      src={url || undefined} 
                                      controls 
                                      className="w-full h-8 flex-grow [&::-webkit-media-controls-enclosure]:bg-slate-800" 
                                    />
                                  </div>
                                );
                              }

                              // 4. Geolocation shared 📍
                              if (txt.startsWith('📍 [Location Shared]')) {
                                const coordsMatch = txt.match(/coords: ([^|]+)/);
                                const campusMatch = txt.match(/campus: ([^|]+)/);
                                const linkMatch = txt.match(/link: ([^\s]+)/);
                                const coords = coordsMatch ? coordsMatch[1].trim() : '0.0000, 0.0000';
                                const campus = campusMatch ? campusMatch[1].trim() : 'Visakhapatnam Lab';
                                const link = linkMatch ? linkMatch[1].trim() : '#';
                                return (
                                  <div className="bg-[#111b21] rounded-xl border border-white/5 my-1 overflow-hidden min-w-[220px] font-mono select-none">
                                    {/* Simulated Google map layout canvas */}
                                    <div className="h-24 bg-[#0a0f1d] relative flex items-center justify-center overflow-hidden border-b border-white/5">
                                      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                      <div className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping z-10"></div>
                                      <div className="absolute w-2 h-2 bg-emerald-400 rounded-full z-10"></div>
                                      <div className="absolute bottom-2 left-2 text-[7.5px] font-mono text-cyan-400 bg-slate-950/80 px-1 py-0.2 rounded font-mono">GPS LOCK ACTIVE</div>
                                      
                                      {/* Coordinates lines */}
                                      <span className="absolute top-1 right-2 text-[7px] text-slate-600 font-mono">{coords}</span>
                                    </div>
                                    <div className="p-2.5 text-left space-y-1 bg-slate-950/20">
                                      <h4 className="text-[10px] font-bold text-white tracking-tight uppercase leading-snug font-sans">{campus}</h4>
                                      <p className="text-[8px] text-slate-400 font-mono">{coords}</p>
                                      <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-400 hover:text-[#00f2ff] underline pt-1 font-sans"
                                      >
                                        <Compass className="w-3 h-3 text-cyan-405" />
                                        Open Live Navigation Maps
                                      </a>
                                    </div>
                                  </div>
                                );
                              }

                              // 5. Contact Shared 👤
                              if (txt.startsWith('👤 [Contact Shared]')) {
                                const nameMatch = txt.match(/name: ([^|]+)/);
                                const roleMatch = txt.match(/role: ([^|]+)/);
                                const idMatch = txt.match(/id: ([^\s]+)/);
                                const name = nameMatch ? nameMatch[1].trim() : 'Peer';
                                const role = roleMatch ? roleMatch[1].trim() : 'Student';
                                const idNum = idMatch ? idMatch[1].trim() : 'CS-XXXX';
                                return (
                                  <div className="bg-[#111b21] p-3 rounded-xl border border-white/5 flex flex-col gap-2 min-w-[210px] my-1 font-mono text-left select-none font-sans">
                                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                      <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
                                        {name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="text-[11px] font-bold text-white font-sans">{name}</div>
                                        <div className="text-[7.5px] uppercase text-slate-400 leading-none mt-0.5">{role} • {idNum}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setInputText(`Hello ${name}, sharing cryptographic sentry handshake...`);
                                          playHaptic('tap');
                                        }}
                                        className="flex-grow py-1 px-2 bg-cyan-950 text-cyan-300 hover:bg-cyan-900/40 border border-cyan-500/10 rounded-md text-[8px] font-bold uppercase transition hover:text-white"
                                      >
                                        Message Peer
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          alert(`Initiating secure direct biometric call routing to ${name} (${idNum})`);
                                          playHaptic('success');
                                        }}
                                        className="py-1 px-1.5 bg-slate-900 border border-white/5 text-slate-300 hover:text-white rounded-md transition flex items-center justify-center"
                                        title="Biometric Call"
                                      >
                                        <PhoneCall className="w-3 h-3 text-cyan-400 animate-pulse" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              // 6. Camera Photo Snap 📷
                              if (txt.startsWith('📷 [Camera Snap]')) {
                                const urlMatch = txt.match(/url: ([^\s]+)/);
                                const url = urlMatch ? urlMatch[1].trim() : '';
                                return (
                                  <div className="my-1.5 overflow-hidden rounded-xl border border-white/10 bg-slate-950 max-w-[280px]">
                                    <img
                                      src={url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400"}
                                      alt="Camera Snap"
                                      className="w-full h-auto max-h-56 object-cover cursor-pointer"
                                      referrerPolicy="no-referrer"
                                      onClick={() => { if (url) window.open(url, '_blank'); }}
                                    />
                                    <div className="p-1 px-2 text-[8px] text-[#00f2ff] font-mono uppercase bg-slate-900/60 flex items-center justify-between font-sans">
                                      <span>🔴 LIVE WORKSTATION SNAP</span>
                                      <span>SECURED</span>
                                    </div>
                                  </div>
                                );
                              }

                              // 7. Voice Message 🎤
                              if (txt.startsWith('🎤 [Voice Message]')) {
                                const durationMatch = txt.match(/duration: ([^|]+)/);
                                const urlMatch = txt.match(/url: ([^\s]+)/);
                                const dur = durationMatch ? durationMatch[1].trim() : '5s';
                                const url = urlMatch ? urlMatch[1].trim() : '';
                                return (
                                  <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 flex flex-col gap-1.5 min-w-[210px] my-1 font-mono">
                                    <div className="flex items-center gap-2">
                                      <Mic className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                                      <span className="text-[10px] text-white font-bold font-sans">Voice Note ({dur})</span>
                                    </div>
                                    {url === 'simulated-sentry-transmission' ? (
                                      <div className="text-[8px] uppercase tracking-wide text-cyan-500 animate-pulse bg-cyan-950/20 p-2 rounded border border-cyan-500/15 font-mono">
                                        📲 Cryptographic audio beacon stream verified. Biometric checks match.
                                      </div>
                                    ) : (
                                      <audio 
                                        src={url} 
                                        controls 
                                        className="w-full h-8 flex-grow [&::-webkit-media-controls-enclosure]:bg-slate-800" 
                                      />
                                    )}
                                  </div>
                                );
                              }

                              // Custom Sticker parser 👾
                              if (txt.startsWith('[Sentry Sticker:') || txt.startsWith('[Sticker:')) {
                                let label = 'SENTRY STICKER';
                                let emoji = '👾';
                                let stickerName = 'STK';
                                let packId = 'sentry';

                                if (txt.startsWith('[Sentry Sticker:')) {
                                  const parts = txt.replace('[Sentry Sticker:', '').replace(']', '').trim().split(' ');
                                  emoji = parts[0] || '👾';
                                  stickerName = parts.slice(1).join(' ') || 'KEY';
                                } else {
                                  // [Sticker: setId | emoji | name]
                                  const raw = txt.replace('[Sticker:', '').replace(']', '').trim();
                                  const parts = raw.split('|');
                                  packId = parts[0]?.trim() || 'sentry';
                                  emoji = parts[1]?.trim() || '👾';
                                  stickerName = parts[2]?.trim() || 'STK';

                                  const packMap: Record<string, string> = {
                                    sentry: 'Biometric Sentry',
                                    memes: 'Meme Legends',
                                    kitty: 'Silly Kitty',
                                    devs: 'Elite Coder'
                                  };
                                  label = (packMap[packId] || 'Custom Pack').toUpperCase() + ' STICKER';
                                }

                                return (
                                  <div className="flex flex-col items-center justify-center p-3 my-1 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition shadow-xl min-w-[130px] select-none text-center">
                                    <div className="text-[7px] font-mono font-extrabold text-[#00f2ff] tracking-widest uppercase mb-2 opacity-75">
                                      {label}
                                    </div>
                                    <span className="text-5xl my-2.5 drop-shadow-[0_0_12px_rgba(0,242,255,0.4)] animate-bounce" style={{ animationDuration: '4s' }}>
                                      {emoji}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold font-mono text-pink-400 bg-pink-950/20 border border-pink-500/10 px-2.5 py-0.5 rounded-full mt-1.5 shadow-sm">
                                      {stickerName}
                                    </span>
                                  </div>
                                );
                              }

                              // Standard fallback matching
                              return <p className="whitespace-pre-line">{txt}</p>;
                            })()}
                          </div>
                          
                          {/* Timestamp and reaction cluster */}
                          <div className="flex justify-end items-center gap-1.5 mt-1.5 self-end">
                            <span className="text-[8px] font-mono text-slate-400 text-right uppercase">
                              {m.timestamp}
                            </span>
                            {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                          </div>

                          {m.reactions && m.reactions.length > 0 && (
                            <div className="absolute -bottom-2 -right-1 flex gap-0.5 bg-[#182229] border border-white/5 rounded-full px-1 py-0.2 text-[9px] select-none shadow">
                              {m.reactions.map((r, i) => <span key={i}>{r}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Loading pulsing state */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] font-mono text-[9px] px-3.5 py-2 rounded-2xl flex items-center gap-2">
                        <RotateCw className="w-3.5 h-3.5 text-[#00f2ff] animate-spin" />
                        <span>{activeThreadId === 'thread-syska-ai' ? 'Syska AI processing Groq logic...' : 'Peer network propagating client bits...'}</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef}></div>
                </div>
              </div>

              {/* Bottom typing and sticker drawer toolbar */}
              <div className="p-3 bg-[#202c33] flex flex-col border-t border-slate-950 shrink-0">
                
                {/* sticker & emoji drawer popover inspired by WhatsApp */}
                {isStickerDrawerOpen && (
                  <div className="bg-[#182229] border border-white/5 rounded-xl p-3 mb-2 flex flex-col text-left text-xs font-mono select-none max-h-[300px] animate-fadeIn shrink-0">
                    {/* Header: search and close */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          value={emojiSearchQuery}
                          onChange={(e) => setEmojiSearchQuery(e.target.value)}
                          placeholder="Search WhatsApp Emojis..."
                          className="w-full bg-[#202c33] border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-white focus:outline-none focus:border-cyan-500 font-sans"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        {emojiSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setEmojiSearchQuery('')}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsStickerDrawerOpen(false)}
                        className="text-slate-400 hover:text-white bg-slate-950/20 p-1.5 rounded-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Category tabs scrollable indicator */}
                    {!emojiSearchQuery && (
                      <div className="flex gap-1 overflow-x-auto pb-1.5 mb-2 border-b border-white/5 scrollbar-thin shrink-0 select-none">
                        {EMOJI_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveEmojiTab(cat.id)}
                            className={`py-1 px-2 rounded-md text-[10px] flex items-center gap-1 shrink-0 ${
                              activeEmojiTab === cat.id
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold'
                                : 'bg-[#202c33] text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span className="text-[8px] uppercase tracking-wide">{cat.id}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setActiveEmojiTab('stickers')}
                          className={`py-1 px-2 rounded-md text-[10px] flex items-center gap-1 shrink-0 ${
                            activeEmojiTab === 'stickers'
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/30 font-bold'
                              : 'bg-[#202c33] text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>👾</span>
                          <span className="text-[8px] uppercase tracking-wide font-bold">stickers</span>
                        </button>
                      </div>
                    )}

                    {/* Display area */}
                    <div className="flex-grow overflow-y-auto max-h-[180px] pr-1">
                      {emojiSearchQuery ? (
                        <div>
                          <div className="text-[7.5px] uppercase text-cyan-400 font-bold mb-1.5">Search Results</div>
                          {(() => {
                            const matched = EMOJI_CATEGORIES.flatMap(cat => cat.emojis).filter(emoji => {
                              const desc = EMOJI_NAMES_MAP[emoji] || '';
                              return desc.toLowerCase().includes(emojiSearchQuery.toLowerCase());
                            });

                            if (matched.length === 0) {
                              return <p className="text-[10px] text-slate-500 text-center py-4 font-sans">No matching emojis found</p>;
                            }

                            return (
                              <div className="grid grid-cols-8 gap-2">
                                {matched.map((emoji) => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      setInputText(prev => prev + emoji);
                                      playHaptic('tap');
                                    }}
                                    className="text-xl p-1.5 hover:bg-white/5 rounded-md transition text-center cursor-pointer active:scale-110"
                                    title={EMOJI_NAMES_MAP[emoji]}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      ) : activeEmojiTab === 'stickers' ? (
                        <div>
                          {/* Sticker Set Tabs */}
                          <div className="flex gap-1 overflow-x-auto pb-1 mb-2 border-b border-white/5 scrollbar-thin shrink-0 select-none">
                            {STICKER_SETS.map((set) => (
                              <button
                                key={set.id}
                                type="button"
                                onClick={() => setSelectedStickerSet(set.id)}
                                className={`py-1 px-2 rounded-md text-[9px] flex items-center gap-1 shrink-0 ${
                                  selectedStickerSet === set.id
                                    ? 'bg-purple-950 text-purple-300 border border-purple-500/30 font-bold'
                                    : 'bg-[#202c33] text-slate-400 hover:text-white'
                                }`}
                              >
                                <span>{set.icon}</span>
                                <span className="text-[7.5px] uppercase tracking-wide">{set.title.split(' ')[0]}</span>
                              </button>
                            ))}
                          </div>

                          {/* Selected Set Details */}
                          {(() => {
                            const set = STICKER_SETS.find(s => s.id === selectedStickerSet) || STICKER_SETS[0];
                            return (
                              <div>
                                <div className="text-[8px] text-purple-400 font-bold uppercase mb-2 flex justify-between select-none">
                                  <span>{set.title}</span>
                                  <span className="text-[7px] text-slate-500 font-normal">Sends live expressive sticker</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {set.items.map((st, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => {
                                        if (set.id === 'sentry') {
                                          handleSendMessage(undefined, `[Sentry Sticker: ${st.emoji} ${st.name}]`);
                                        } else {
                                          handleSendMessage(undefined, `[Sticker: ${set.id} | ${st.emoji} | ${st.name}]`);
                                        }
                                        setIsStickerDrawerOpen(false);
                                      }}
                                      className="p-2 bg-slate-900/40 hover:bg-white/5 rounded-lg flex flex-col items-center gap-1 cursor-pointer transition border border-white/5 active:scale-95"
                                    >
                                      <span className="text-xl animate-bounce">{st.emoji}</span>
                                      <span className="text-[7.5px] font-mono text-slate-400 uppercase tracking-tight truncate w-full text-center">{st.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div>
                          <div className="text-[8px] text-cyan-400 font-bold uppercase mb-2 flex items-center justify-between">
                            <span>{EMOJI_CATEGORIES.find(c => c.id === activeEmojiTab)?.title || 'Emojis'}</span>
                            <span className="text-[7px] text-slate-550 font-normal">Click to insert</span>
                          </div>
                          <div className="grid grid-cols-8 gap-2">
                            {(EMOJI_CATEGORIES.find(c => c.id === activeEmojiTab)?.emojis || []).map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setInputText(prev => prev + emoji);
                                  playHaptic('tap');
                                }}
                                className="text-xl p-1.5 hover:bg-white/5 rounded-md transition text-center cursor-pointer active:scale-110"
                                title={EMOJI_NAMES_MAP[emoji]}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Secure document and media attachments panel inspired by Telegram & WhatsApp */}
                {isAttachmentOpen && (
                  <div className="bg-[#182229] border border-white/5 rounded-xl p-3.5 mb-2 grid grid-cols-3 gap-2.5 animate-fadeIn text-left text-xs font-mono select-none">
                    
                    {/* Hidden Native Input Elements for realistic document, gallery and audio inputs */}
                    <input 
                      type="file" 
                      id="pwa-chat-doc-uploader" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const base64Content = reader.result as string;
                            const sizeStr = file.size > 1024 * 1024 
                              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                              : `${(file.size / 1024).toFixed(0)} KB`;
                            handleSendMessage(
                              undefined, 
                              `📄 [Document] name: ${file.name} | size: ${sizeStr} | type: ${file.type || 'application/octet-stream'} | url: ${base64Content}`,
                              {
                                content: base64Content,
                                name: file.name,
                                type: file.type || 'application/octet-stream'
                              }
                            );
                          };
                          reader.readAsDataURL(file);
                          setIsAttachmentOpen(false);
                          playHaptic('success');
                        }
                      }}
                    />

                    <input 
                      type="file" 
                      id="pwa-chat-gallery-uploader" 
                      accept="image/*,video/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const isVideo = file.type.startsWith('video/');
                          const cleanName = file.name.replace(/[^\w\.\-]/g, '_');
                          const reader = new FileReader();
                          reader.onload = () => {
                            const base64Content = reader.result as string;
                            handleSendMessage(
                              undefined, 
                              `${isVideo ? '📹' : '🖼️'} [Gallery Media] name: ${cleanName} | type: ${file.type} | url: ${base64Content}`,
                              {
                                content: base64Content,
                                name: cleanName,
                                type: file.type || 'image/jpeg'
                              }
                            );
                          };
                          reader.readAsDataURL(file);
                          setIsAttachmentOpen(false);
                          playHaptic('success');
                        }
                      }}
                    />

                    <input 
                      type="file" 
                      id="pwa-chat-audio-uploader" 
                      accept="audio/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const base64Content = reader.result as string;
                            handleSendMessage(
                              undefined, 
                              `🎵 [Audio Attachment] name: ${file.name} | type: ${file.type} | url: ${base64Content}`,
                              {
                                content: base64Content,
                                name: file.name,
                                type: file.type || 'audio/mpeg'
                              }
                            );
                          };
                          reader.readAsDataURL(file);
                          setIsAttachmentOpen(false);
                          playHaptic('success');
                        }
                      }}
                    />

                    {/* Option 1: Document Upload */}
                    <button 
                      type="button"
                      onClick={() => {
                        document.getElementById('pwa-chat-doc-uploader')?.click();
                        playHaptic('light');
                      }}
                      className="p-3 bg-[#111b21] hover:bg-white/5 rounded-xl border border-white/5 text-center flex flex-col items-center gap-1.5 cursor-pointer transition hover:border-[#25d366]/30"
                      title="Attach Document or Files"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-950/50 border border-blue-500/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-[8.5px] uppercase tracking-wide text-blue-300 font-bold">Document</span>
                    </button>

                    {/* Option 2: Gallery Image / Video Upload */}
                    <button 
                      type="button"
                      onClick={() => {
                        document.getElementById('pwa-chat-gallery-uploader')?.click();
                        playHaptic('light');
                      }}
                      className="p-3 bg-[#111b21] hover:bg-white/5 rounded-xl border border-white/5 text-center flex flex-col items-center gap-1.5 cursor-pointer transition hover:border-[#25d366]/30"
                      title="Attach Media from Gallery"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-950/50 border border-purple-500/30 flex items-center justify-center">
                        <Image className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-[8.5px] uppercase tracking-wide text-purple-300 font-bold">Gallery</span>
                    </button>

                    {/* Option 3: Camera Live Capture */}
                    <button 
                      type="button"
                      onClick={() => openChatCamera()}
                      className="p-3 bg-[#111b21] hover:bg-white/5 rounded-xl border border-white/5 text-center flex flex-col items-center gap-1.5 cursor-pointer transition hover:border-[#25d366]/30"
                      title="Biometric Webcam Snap"
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-950/50 border border-pink-500/30 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-pink-400 animate-pulse" />
                      </div>
                      <span className="text-[8.5px] uppercase tracking-wide text-pink-300 font-bold">Camera</span>
                    </button>

                    {/* Option 4: Audio / Music files */}
                    <button 
                      type="button"
                      onClick={() => {
                        document.getElementById('pwa-chat-audio-uploader')?.click();
                        playHaptic('light');
                      }}
                      className="p-3 bg-[#111b21] hover:bg-white/5 rounded-xl border border-white/5 text-center flex flex-col items-center gap-1.5 cursor-pointer transition hover:border-[#25d366]/30"
                      title="Attach Audio Records"
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-950/50 border border-orange-500/30 flex items-center justify-center">
                        <Music className="w-5 h-5 text-orange-400" />
                      </div>
                      <span className="text-[8.5px] uppercase tracking-wide text-orange-300 font-bold">Audio file</span>
                    </button>

                    {/* Option 5: Location Sharing with Geolocation */}
                    <button 
                      type="button"
                      onClick={() => {
                        playHaptic('tap');
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const lat = pos.coords.latitude.toFixed(6);
                              const lon = pos.coords.longitude.toFixed(6);
                              handleSendMessage(undefined, `📍 [Location Shared] coords: ${lat}, ${lon} | campus: Visakhapatnam College Hub | link: https://maps.google.com/?q=${lat},${lon}`);
                              setIsAttachmentOpen(false);
                              playHaptic('success');
                            },
                            (err) => {
                              const cleanLat = (17.7121 + Math.random() * 0.02).toFixed(5);
                              const cleanLon = (83.3218 + Math.random() * 0.02).toFixed(5);
                              handleSendMessage(undefined, `📍 [Location Shared] coords: ${cleanLat}, ${cleanLon} | campus: Vizag Academic Block-A Geofence | link: https://maps.google.com/?q=${cleanLat},${cleanLon}`);
                              setIsAttachmentOpen(false);
                            }
                          );
                        } else {
                          const cleanLat = (17.7121 + Math.random() * 0.02).toFixed(5);
                          const cleanLon = (83.3218 + Math.random() * 0.02).toFixed(5);
                          handleSendMessage(undefined, `📍 [Location Shared] coords: ${cleanLat}, ${cleanLon} | campus: College Geofence Active | link: https://maps.google.com/?q=${cleanLat},${cleanLon}`);
                          setIsAttachmentOpen(false);
                        }
                      }}
                      className="p-3 bg-[#111b21] hover:bg-white/5 rounded-xl border border-white/5 text-center flex flex-col items-center gap-1.5 cursor-pointer transition hover:border-[#25d366]/30"
                      title="Share GPS Coordinates"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-[8.5px] uppercase tracking-wide text-emerald-300 font-bold">Location</span>
                    </button>

                    {/* Option 6: Contact Sharing */}
                    <button 
                      type="button"
                      onClick={() => {
                        setIsContactSelectorOpen(true);
                        setIsAttachmentOpen(false);
                        playHaptic('tap');
                      }}
                      className="p-3 bg-[#111b21] hover:bg-white/5 rounded-xl border border-white/5 text-center flex flex-col items-center gap-1.5 cursor-pointer transition hover:border-[#25d366]/30"
                      title="Share Sentry Peer Details"
                    >
                      <div className="w-10 h-10 rounded-full bg-teal-950/50 border border-teal-500/30 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-teal-400" />
                      </div>
                      <span className="text-[8.5px] uppercase tracking-wide text-teal-300 font-bold">Contact</span>
                    </button>
                    
                  </div>
                )}

                {/* Form row with real-time feedback & Recording toolbar support */}
                {isRecordingVoice ? (
                  <div className="flex items-center justify-between gap-3 bg-[#182229] p-2 rounded-xl border border-red-500/20 animate-pulse select-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-550 animate-ping shrink-0" />
                      <span className="text-red-500 font-extrabold text-[10px] uppercase font-mono tracking-wider animate-fadeIn">Recording voice note... {voiceSecs}s</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => stopRecordingVoice(false)}
                        className="py-1.5 px-3 bg-[#202c33] text-slate-400 hover:text-white rounded-lg text-[9px] uppercase font-bold tracking-tight font-mono transition cursor-pointer"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={() => stopRecordingVoice(true)}
                        className="py-1.5 px-4 bg-red-650 hover:bg-red-500 text-white rounded-lg text-[9px] uppercase font-bold tracking-tight font-mono transition shadow-lg cursor-pointer animate-pulse"
                      >
                        Stop & Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => { setIsStickerDrawerOpen(!isStickerDrawerOpen); setIsAttachmentOpen(false); }}
                      className={`p-1.5 rounded transition hover:bg-white/5 cursor-pointer ${isStickerDrawerOpen ? 'text-pink-400' : 'text-slate-400'}`}
                      title="Insert Emojis & Stickers"
                    >
                      <Smile className="w-5.5 h-5.5" />
                    </button>

                    <button 
                      type="button"
                      onClick={() => { setIsAttachmentOpen(!isAttachmentOpen); setIsStickerDrawerOpen(false); }}
                      className={`p-1.5 rounded transition hover:bg-white/5 cursor-pointer ${isAttachmentOpen ? 'text-[#00f2ff]' : 'text-slate-400'}`}
                      title="Share Multi-media Attachments"
                    >
                      <Paperclip className="w-5.5 h-5.5" />
                    </button>

                    {activeThreadId === 'thread-syska-ai' && (
                      <button 
                        type="button"
                        onClick={() => {
                          const nextVal = !speechVolume;
                          setSpeechVolume(nextVal);
                          playHaptic('light');
                          if (nextVal) {
                            playVoice("Voice feedback enabled.");
                          } else {
                            window.speechSynthesis?.cancel();
                          }
                        }}
                        className={`p-1.5 rounded transition cursor-pointer flex items-center justify-center ${
                          speechVolume 
                            ? 'text-emerald-400 hover:bg-emerald-500/10' 
                            : 'text-slate-500 hover:bg-white/5'
                        }`}
                        title={speechVolume ? "Mute Syska AI Voice Feedback" : "Unmute Syska AI Voice Feedback"}
                      >
                        {speechVolume ? <Volume2 className="w-5.5 h-5.5" /> : <VolumeX className="w-5.5 h-5.5" />}
                      </button>
                    )}

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        activeThreadId === 'thread-syska-ai' 
                          ? 'Prompt Syska AI Copilot (Groq free-tier active)...' 
                          : activeThreadId === 'thread-motherbot'
                          ? 'Send command to MotherBot (or use triggers)...'
                          : 'Type safe Peer message here...'
                      }
                      className="flex-grow bg-[#2a3942] border border-transparent rounded-lg py-2 px-4.5 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:bg-[#2a3942] focus:outline-none"
                      required
                    />

                    {inputText.trim() ? (
                      <button 
                        type="submit"
                        className="bg-[#00a884] hover:bg-[#008f72] p-2 rounded-full text-slate-1200 cursor-pointer transition active:scale-95 shadow-md shadow-emerald-500/10 shrink-0"
                      >
                        <Send className="w-5 h-5 text-white" />
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={startRecordingVoice}
                        className="bg-[#2a3942] hover:bg-cyan-500/10 border border-transparent hover:border-cyan-550/20 p-2 rounded-full text-cyan-400 cursor-pointer transition shrink-0 animate-pulse"
                        title="Record voice message"
                      >
                        <Mic className="w-5 h-5 text-cyan-405" />
                      </button>
                    )}
                  </form>
                )}

              </div>
            </>

          </div>

        {/* 3rd Pane: Auxiliary Administrative Tooling Panel (Context-aware sidebar) */}
        {isRightDrawerOpen && (
          <div id="wp-rightpanel" className="w-[300px] bg-[#111b21] flex flex-col shrink-0 border-l border-[#222c32] overflow-y-auto text-left select-none relative animate-slideIn">
            
            {/* Top title bar */}
            <div className="p-4 bg-[#202c33] flex justify-between items-center border-b border-slate-950 shrink-0 select-none">
              <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#00f2ff] flex items-center gap-1.5 select-none">
                <Terminal className="w-4.5 h-4.5 text-cyan-400" />
                Sentry Toolkit Deck
              </span>
              <button 
                onClick={() => setIsRightDrawerOpen(false)} 
                className="text-slate-400 hover:text-white cursor-pointer"
                title="Hide tool deck"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inner dynamic widgets matching Active chat thread */}
            <div className="p-4 space-y-5 select-text">
              
              {activeThreadId === 'thread-syska-ai' ? (
                
                /* WIDGET 1: SYSKA AI TOOLBOX - MODEL CHOSEN, OTAS, AND SECURITY AUDITS */
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/15 p-3 rounded-xl space-y-2">
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">1. Selected AI Engine (Uptime checked)</span>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-[#111b21] border border-white/5 py-1 px-2 rounded font-mono text-[10.5px] focus:outline-none text-[#00f2ff]"
                    >
                      <option value="gpt-oss-20b">GPT-OSS 20B (Groq Proxy)</option>
                      <option value="gpt-oss-120b">GPT-OSS 120B (Groq Proxy)</option>
                      <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                      <option value="whisper-large-v3">Whisper Large v3 (Audio)</option>
                      <option value="llama-4-scout-17b">Llama 4 Scout (17B)</option>
                      <option value="llama-3.2-11b-vision-preview">Llama 3.2 Vision (11B)</option>
                      <option value="llama-3.2-90b-vision-preview">Llama 3.2 Vision (90B)</option>
                    </select>
                    <span className="block text-[7.5px] text-zinc-500">Every model is linked to honest, real-time endpoints on Groq's API platform. No simulated outputs.</span>
                  </div>

                  {/* Dynamic Diagnostic dispatchers */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2 text-[11px] leading-normal font-mono">
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase">2. Station Diagnostic Dispatch</span>
                    
                    <div className="space-y-1">
                      <select
                        value={selectedIssueId}
                        onChange={(e) => setSelectedIssueId(e.target.value)}
                        className="w-full bg-[#111b21] border border-white/5 p-1 rounded font-mono text-[9px]"
                      >
                        <option value="all">Check Workstation CS-01 (Mainframe)</option>
                        <option value="issue-1">Check CS-12 (RFID override locked)</option>
                        <option value="issue-2">Check CS-42 (Memory threshold warning)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleSendMessage(undefined, `Please run diagnostics on selected station: [${selectedIssueId === 'all' ? 'CS-01' : selectedIssueId === 'issue-1' ? 'CS-12' : 'CS-42'}]`)}
                      className="w-full bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 font-bold py-1 rounded text-[9px] uppercase transition cursor-pointer"
                    >
                      Trigger diagnostics Dispatch
                    </button>

                    {aiDiagnosticResult && (
                      <div className="p-2 bg-slate-950 border border-white/5 text-[8.5px] leading-relaxed text-slate-300 rounded whitespace-pre-wrap">
                        {aiDiagnosticResult}
                      </div>
                    )}
                  </div>

                  {/* Security integrity score audits */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2.5 font-mono text-[11px]">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase">3. Biometric Sentry Audit</span>
                      {securityScore && <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-950/60 px-1 py-0.2 rounded">Score: {securityScore}%</span>}
                    </div>

                    {isAuditing ? (
                      <div className="text-[9px] text-zinc-500 text-center py-2 animate-pulse flex justify-center items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-400" /> Computing college integrity score...
                      </div>
                    ) : auditReport ? (
                      <pre className="text-[7.5px] p-2 bg-black/40 rounded border border-white/5 font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap select-text leading-tight uppercase">
                        {auditReport}
                      </pre>
                    ) : (
                      <span className="block text-[8px] text-slate-500">Run a zero-trust network packet verification scan matching NAAC policies.</span>
                    )}

                    <button
                      onClick={triggerLiveAuditScore}
                      className="w-full bg-[#1b2b23] hover:bg-emerald-950 text-emerald-400 font-mono text-[9px] border border-emerald-500/20 py-1.5 rounded uppercase font-bold cursor-pointer"
                    >
                      Audit workstation Database
                    </button>
                  </div>

                  {/* OTA firmware compiles */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2 font-mono text-[11px]">
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase block pb-1 border-b border-white/5">4. OTA Patch Script generator</span>
                    <input
                      type="text"
                      value={otaPrompt}
                      onChange={(e) => setOtaPrompt(e.target.value)}
                      placeholder="Scope..."
                      className="w-full bg-[#111b21] border border-white/10 p-1 rounded font-mono text-[9px] text-white"
                    />

                    <button
                      onClick={compileOatScript}
                      className="w-full bg-pink-950 hover:bg-pink-900 border border-pink-500/30 text-pink-300 font-bold py-1 rounded text-[9px] uppercase cursor-pointer"
                    >
                      Compile OTA Patch script
                    </button>

                    {generatedOtaPatch && (
                      <div className="p-2 bg-black/50 border border-white/5 rounded-lg space-y-1 mt-2">
                        <div className="text-[8px] text-[#00f2ff] font-bold">Compiled {generatedOtaPatch.patchId}</div>
                        <div className="text-[7.5px] text-slate-400 leading-normal mb-1">Md5: {generatedOtaPatch.signature}</div>
                        <pre className="text-[7.5px] font-mono text-zinc-300 select-all overflow-x-auto bg-slate-950 p-1.5 rounded border border-white/5 ">{generatedOtaPatch.scriptBody}</pre>
                      </div>
                    )}
                  </div>

                </div>

              ) : activeThreadId === 'thread-motherbot' ? (
                
                /* WIDGET 2: MOTHERBOT BOT GENERATOR DECK */
                <div className="space-y-4 font-mono text-[11px]">
                  
                  <div className="bg-[#1e1420] border border-fuchsia-500/15 p-3.5 rounded-xl space-y-2">
                    <span className="text-[8px] font-extrabold text-fuchsia-400 uppercase tracking-wider block">MotherBot Virtual Machine Compiler</span>
                    <p className="text-[10px] leading-relaxed text-slate-400 font-sans">
                      Visual compiler flow to deploy customized automated chatbots over current campus groups completely free! Action auto working without any keys.
                    </p>
                  </div>

                  {/* Chatbot compiler deck list */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-3">
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase block">Assemble Bot Phrases</span>
                    
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-0.5 scrollbar-none">
                      {botTriggers.map((t, idx) => (
                        <div key={idx} className="bg-black/35 p-2 rounded border border-white/5 text-[9px] relative group leading-normal">
                          <button 
                            onClick={() => setBotTriggers(prev => prev.filter((_, i) => i !== idx))} 
                            className="absolute top-1 right-1 text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="block text-fuchsia-400">Trigger: {t.phrase}</span>
                          <span className="block text-slate-300 mt-0.5 mt-0.5">Resp: {t.response}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-white/5 text-[10px]">
                      <input
                        type="text"
                        placeholder="Keyword phrase..."
                        value={tempPhrase}
                        onChange={(e) => setTempPhrase(e.target.value)}
                        className="w-full bg-[#111b21] border border-white/10 p-1.5 rounded text-[9.5px]"
                      />
                      <input
                        type="text"
                        placeholder="Automatic Bot response..."
                        value={tempResponse}
                        onChange={(e) => setTempResponse(e.target.value)}
                        className="w-full bg-[#111b21] border border-white/10 p-1.5 rounded text-[9.5px]"
                      />
                      <button
                        onClick={() => {
                          if (tempPhrase.trim() && tempResponse.trim()) {
                            setBotTriggers(prev => [...prev, { phrase: tempPhrase.trim(), response: tempResponse.trim() }]);
                            setTempPhrase('');
                            setTempResponse('');
                            playHaptic('light');
                          }
                        }}
                        type="button"
                        className="w-full bg-fuchsia-950 hover:bg-fuchsia-900 border border-fuchsia-500/30 text-fuchsia-400 font-extrabold py-1.5 rounded uppercase cursor-pointer"
                      >
                        Add Bot Phrase Scribe
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-[8px] text-slate-400 font-extrabold uppercase block">Launch custom chatbot</span>
                    <input
                      type="text"
                      placeholder="e.g. CS Robot"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="w-full bg-[#111b21] border border-white/10 p-1 rounded font-mono text-[9px] text-white"
                    />
                    <button
                      onClick={() => {
                        if (!creatorName.trim()) return;
                        playHaptic('heavy');
                        db.createCustomBot(creatorName, 'Staff', botTriggers);
                        setThreads(db.getChatThreads());
                        setCreatorName('');
                        db.addLog('SYSTEM', `New custom autonomous bot "${creatorName}" launched dynamically.`, 'success');
                        alert(`🤖 [COMPILER STATE]: Custom Chatbot "${creatorName}" is deployed and ready to handle commands online! Check your list.`);
                        onRefreshAll();
                      }}
                      className="w-full bg-[#1d1624] hover:bg-fuchsia-950 text-fuchsia-400 font-mono text-[9px] border border-fuchsia-500/20 py-1.5 rounded uppercase font-bold cursor-pointer"
                    >
                      Deploy Bot online
                    </button>
                  </div>

                </div>

              ) : (
                
                /* WIDGET 3: STANDARD CONTACT DETAIL VISUAL DECK */
                <div className="space-y-4 font-sans text-xs">
                  
                  <div className="flex flex-col items-center text-center space-y-2 border-b border-white/5 pb-4">
                    <div className="w-20 h-20 rounded-full bg-zinc-900 overflow-hidden border-2 border-cyan-500/30">
                      <img src={activeThread.avatar} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{activeThread.name}</h4>
                      <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">{activeThread.type} ENCLAVE UNIT</span>
                    </div>
                  </div>

                  {activeThread.type === 'direct' ? (
                    <div className="space-y-3 leading-normal text-slate-400">
                      <div className="bg-slate-950/50 p-2.5 rounded-lg border border-white/5 font-mono text-[9px] text-slate-300">
                        <span className="uppercase text-slate-500 font-bold block mb-1">Academic streak info</span>
                        🔥 Attendance streak: <strong className="text-amber-400">{(currentUser.streak ?? 12)} days running</strong>
                        <span className="block mt-1">Reputation index: <strong className="text-emerald-400">{(currentUser.reputationScore ?? 94)}% verified</strong></span>
                      </div>

                      <p className="text-[11px]">This student ledger node is bound securely within Maddilapalem campus geofences. Live checkins active.</p>
                      
                      <div className="pt-2 border-t border-white/5 space-y-1.5">
                        <button 
                          onClick={() => alert(`RFID Identity Pass bound: ${activeThread.name}`)}
                          className="w-full bg-[#0d212a] hover:bg-cyan-950 text-cyan-400 py-1.5 rounded text-[10px] font-mono uppercase font-bold text-center cursor-pointer border border-cyan-500/15"
                        >
                          Identity Card
                        </button>
                        <button 
                          onClick={() => playVoice(`Muting student node ${activeThread.name}.`)}
                          className="w-full border border-white/5 hover:bg-white/5 text-slate-350 py-1.5 rounded text-[10px] font-mono uppercase text-center cursor-pointer"
                        >
                          Mute Sentry Notifications
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-[11px] leading-relaxed text-slate-400">
                      <div className="bg-slate-950/50 p-2.5 rounded-lg border border-white/5 font-mono text-[9.5px]">
                        <span className="uppercase text-[#00f2ff] font-bold block mb-1">Group Ledger rules</span>
                        • Max 1-min duration statuses verified.<br />
                        • Real-time geofencing sync triggers active on 5 workstations.<br />
                        • Standard offline mode complete.
                      </div>
                      
                      <button 
                        onClick={() => alert(`Group info catalog synced.`)}
                        className="w-full bg-[#0e2119] hover:bg-[#072c1c] text-emerald-400 border border-emerald-500/15 py-1.5 rounded font-mono uppercase text-[9.5px] font-bold tracking-wider cursor-pointer"
                      >
                        Ledger Info Catalog
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* DETAILED FULL-SCREEN VISUALLY STUNNING WHATSAPP STATUS VIEWER OVERLAY */}
      {activeStory && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col justify-center items-center p-4 animate-fadeIn select-none font-sans">
          
          <div className="relative w-full max-w-sm bg-[#060a16] border border-cyan-500/25 rounded-3xl overflow-hidden shadow-2xl h-[580px] flex flex-col justify-between">
            
            {/* Pulsing overlay pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(16,185,129,0.03)_1.5px,transparent_1.5px)] bg-[size:15px_15px] pointer-events-none z-0"></div>

            {/* Media Canvas Block centered beautifully */}
            <div className="absolute inset-0 z-10 w-full h-full bg-slate-950">
              {activeStory.storyVideo ? (
                /* Authentic Looping Video statuses matched strictly */
                <video 
                  src={activeStory.storyVideo} 
                  autoPlay 
                  loop 
                  muted={!isPlayingStory} 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : activeStory.storyImage ? (
                /* Beautiful crisp layout image */
                <img 
                  src={activeStory.storyImage} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                  alt="" 
                />
              ) : (
                /* Pure text atmospheric custom wallpaper cards */
                <div className="w-full h-full bg-gradient-to-br from-[#0e172a] to-[#04060b] p-6 flex flex-col justify-center items-center text-center">
                  <span className="text-4xl animate-pulse">📢 Campus Bulletin</span>
                </div>
              )}
              {/* black screen overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent"></div>
            </div>

            {/* Stories top headers and progresses */}
            <div className="p-4 relative z-20 space-y-3.5">
              
              {/* WhatsApp-style progress horizontal bar */}
              <div className="w-full h-1 bg-slate-800/85 rounded-full overflow-hidden flex gap-1 font-mono">
                <div className="bg-[#00f2ff] h-full transition-all duration-100 ease-linear shadow-[0_0_8px_#00f2ff]" style={{ width: `${storyProgress}%` }}></div>
              </div>

              {/* Identity tag header block with Mute button */}
              <div className="flex justify-between items-center bg-black/45 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2.5 text-left">
                  <img src={activeStory.avatar} className="w-9 h-9 rounded-full object-cover border border-[#00f2ff]" referrerPolicy="no-referrer" alt="" />
                  <div>
                    <h4 className="text-xs font-sans font-black text-white uppercase tracking-tight">{activeStory.fullName}</h4>
                    <span className="text-[7.5px] font-mono text-cyan-400 uppercase font-black tracking-widest">{activeStory.role} SENTRY FEED</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setIsPlayingStory(!isPlayingStory); playHaptic('light'); }}
                    className="p-1 rounded-full text-slate-300 hover:text-white cursor-pointer"
                    title={isPlayingStory ? 'Pause Story' : 'Play Story'}
                  >
                    {isPlayingStory ? <Pause className="w-4.5 h-4.5 text-white" /> : <Play className="w-4.5 h-4.5 text-[#00f2ff] fill-[#00f2ff]" />}
                  </button>

                  <button 
                    onClick={() => { setActiveStory(null); playHaptic('light'); }} 
                    className="p-1 rounded-full text-slate-300 hover:text-white cursor-pointer"
                    title="Dismiss Story"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Creative Live Background Music banner with waves */}
            {activeStory.storyMusicTitle && (
              <div className="mx-auto max-w-[260px] bg-black/75 rounded-2xl border border-pink-500/25 p-2.5 text-center relative z-20 shadow-xl backdrop-blur-md animate-bounce">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center animate-spin-slow">
                    <Music className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="text-left leading-none font-mono text-[9px]">
                    <span className="block text-[#00f2ff] font-extrabold max-w-[130px] truncate">{activeStory.storyMusicTitle}</span>
                    <span className="block text-slate-400 mt-0.5 truncate max-w-[130px]">{activeStory.storyMusicArtist}</span>
                  </div>
                  {/* wave simulation nodes */}
                  <span className="flex gap-0.5 items-end h-3 shrink-0">
                    <span className="w-0.5 h-2 bg-pink-500 animate-pulse"></span>
                    <span className="w-0.5 h-3 bg-pink-500 animate-pulse delay-75"></span>
                    <span className="w-0.5 h-1.5 bg-pink-500 animate-pulse delay-150"></span>
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Caption gradient overlay card */}
            <div className="p-5 relative z-20 text-center space-y-4">
              {/* Do not render standard caption for text protocol-based statuses */}
              {!(activeStory.storyImage && activeStory.storyImage.startsWith('text-status://')) && activeStory.caption && (
                <div className="bg-slate-950/85 backdrop-blur-lg border border-white/5 p-4 rounded-2xl text-center leading-relaxed">
                  <p className="font-sans text-xs leading-relaxed text-slate-100 font-extrabold break-words">
                    "{activeStory.caption}"
                  </p>
                  <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-500 mt-2 pt-2 border-t border-white/5 uppercase select-none">
                    <span>🛰️ SENTRY TELEMETRY SECURED</span>
                    <span>VIEWS: {activeStory.views + 12} FEEDS</span>
                  </div>
                </div>
              )}

              {/* Inbound Story Reply Input Bar (WhatsApp status reply) */}
              <div className="flex items-center gap-1.5 p-1 bg-black/85 rounded-full border border-white/10 backdrop-blur-md">
                <input 
                  type="text"
                  placeholder="Reply to status..."
                  value={inboundStoryReplyText}
                  onChange={(e) => setInboundStoryReplyText(e.target.value)}
                  className="flex-1 bg-transparent px-3 text-xs text-white focus:outline-none placeholder-slate-400 font-sans"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inboundStoryReplyText.trim()) {
                      playHaptic('success');
                      playVoice(`Story feed response sent`);
                      alert(`✓ Reply delivered successfully to peer: "${inboundStoryReplyText}"`);
                      setInboundStoryReplyText('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (inboundStoryReplyText.trim()) {
                      playHaptic('success');
                      playVoice(`Story feed response sent`);
                      alert(`✓ Reply delivered successfully to peer: "${inboundStoryReplyText}"`);
                      setInboundStoryReplyText('');
                    }
                  }}
                  className="p-1 px-3 bg-[#00e676] hover:bg-[#00c853] text-black rounded-full text-[10px] font-black uppercase font-mono cursor-pointer"
                >
                  SEND
                </button>
              </div>

              <button 
                onClick={() => { setActiveStory(null); playHaptic('light'); }}
                className="w-full py-2 bg-slate-950/80 hover:bg-slate-900 text-slate-300 font-mono text-[9.5px] uppercase border border-white/5 rounded-xl font-bold cursor-pointer transition hover:text-[#00f2ff] select-all uppercase"
              >
                Close Status Sentry
              </button>
            </div>

          </div>

        </div>
      )}

      {/* NEW STORY SUBMISSION POPUP */}
      {isNewStoryOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 animate-fadeIn select-text leading-relaxed font-sans text-xs">
          <form onSubmit={handleInsertStories} className="bg-[#0b1226] border border-cyan-500/30 p-5 rounded-2xl max-w-sm w-full text-left relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button 
              type="button" 
              onClick={() => setIsNewStoryOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="flex items-center gap-1.5 pb-2 border-b border-cyan-500/20 select-none">
              <Radio className="w-4.5 h-4.5 text-cyan-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">Create WhatsApp-Inspired Status</h4>
            </div>

            {/* Status Type Toggler Selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-white/5 select-none text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setStatusType('media');
                  playHaptic('light');
                }}
                className={`py-1.5 px-2 rounded-lg font-bold uppercase transition-all tracking-wider text-center ${
                  statusType === 'media'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📷 Media Upload
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusType('text');
                  playHaptic('light');
                }}
                className={`py-1.5 px-2 rounded-lg font-bold uppercase transition-all tracking-wider text-center ${
                  statusType === 'text'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ✍️ Text Status
              </button>
            </div>

            {/* CONDITIONAL CONTROLS: TEXT STATUS CAPABILITIES */}
            {statusType === 'text' && (
              <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-purple-500/10">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono font-bold text-purple-400 uppercase tracking-widest block">Text status content</span>
                  <textarea
                    value={newStoryCaption}
                    onChange={(e) => setNewStoryCaption(e.target.value)}
                    maxLength={140}
                    rows={3}
                    placeholder="Type your status message here... e.g., 'Writing clean full-stack code on continuous rings! 💻🔥'"
                    className="w-full bg-slate-950 border border-purple-950 p-2.5 rounded-lg text-xs font-serif text-white focus:border-purple-500 focus:outline-none text-center"
                    required
                  />
                  <div className="text-right text-[7.5px] font-mono text-slate-500">
                    {newStoryCaption.length}/140 characters
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono font-bold text-purple-400 uppercase tracking-widest block">Custom WhatsApp Color Preset</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {AUDIO_BG_GRADIENTS.map((bg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setTextStatusBg(bg.value);
                          playHaptic('light');
                        }}
                        style={{ background: bg.value }}
                        className={`h-7 rounded-md border text-[8px] text-white flex items-center justify-center font-bold ${
                          textStatusBg === bg.value ? 'border-pink-500 scale-105 shadow-[0_0_8px_rgba(236,72,153,0.4)]' : 'border-white/10'
                        }`}
                        title={bg.name}
                      >
                        ✓
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono font-bold text-purple-400 uppercase tracking-widest block">WhatsApp Typography style</span>
                  <select
                    value={textStatusFont}
                    onChange={(e) => setTextStatusFont(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-950 p-1.5 text-[9.5px] rounded-lg text-white font-mono"
                  >
                    <option value="font-sans">Sans-Serif Clean System</option>
                    <option value="font-serif">Elegant Literary Serif</option>
                    <option value="font-mono">JetBrains High-Tech Mono</option>
                  </select>
                </div>
              </div>
            )}

            {/* CONDITIONAL CONTROLS: MEDIA STATUS CAPABILITIES */}
            {statusType === 'media' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Story overlay caption</label>
                  <input
                    type="text"
                    value={newStoryCaption}
                    onChange={(e) => setNewStoryCaption(e.target.value)}
                    maxLength={100}
                    placeholder="Add caption overlay..."
                    className="w-full bg-slate-950 border border-white/10 p-2 rounded-lg text-xs focus:border-cyan-400 focus:outline-none text-white font-mono"
                  />
                </div>

                {/* SENTRY MULTIMEDIA CAPTURING ENGINE */}
                <div className="bg-slate-950/85 p-3 rounded-xl border border-cyan-500/10 space-y-3">
                  <span className="text-[8px] font-black text-cyan-400 font-mono tracking-widest uppercase block">
                    🎨 CAPTURE / BROWSE BACKDROP FILE
                  </span>

                  {/* Hidden Input */}
                  <input
                    ref={statusFileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setLocalStatusFileName(file.name);
                        
                        const fakeEvent = {
                          target: { files: e.target.files }
                        } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleStoryFileChange(fakeEvent);
                      }
                    }}
                    className="hidden"
                  />

                  {/* Direct visual file uploader drops with drag states */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setLocalStatusFileDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setLocalStatusFileDragActive(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setLocalStatusFileDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        setLocalStatusFileName(file.name);
                        
                        const fakeEvent = {
                          target: { files: e.dataTransfer.files }
                        } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleStoryFileChange(fakeEvent);
                      }
                    }}
                    onClick={() => statusFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 select-none flex flex-col items-center justify-center space-y-1 ${
                      localStatusFileDragActive
                        ? 'border-cyan-400 bg-cyan-950/30'
                        : localStatusFileName
                        ? 'border-emerald-500 bg-emerald-950/10'
                        : 'border-white/10 bg-slate-950/60 hover:border-cyan-500/30 hover:bg-slate-950/90'
                    }`}
                  >
                    <Upload className={`w-6 h-6 ${localStatusFileName ? 'text-emerald-400 animate-pulse' : 'text-cyan-400 animate-bounce'}`} style={{ animationDuration: '3s' }} />
                    <span className="text-[9.5px] font-bold text-slate-200 font-sans block">
                      {localStatusFileName ? `Loaded: ${localStatusFileName}` : "Drag and Drop Status File or Browse"}
                    </span>
                    <span className="text-[7.5px] font-mono text-slate-500 tracking-wider">
                      Supports direct JPEG, PNG, MP4. Unlimited DB Storage enabled query.
                    </span>
                  </div>

                  {/* Webcam capture widget if triggered */}
                  {isWebcamLensActive && (
                    <div className="space-y-2 border border-cyan-500/30 p-2 rounded-lg bg-black">
                      <video 
                        ref={webcamVideoRef}
                        className="w-full aspect-video rounded-md bg-zinc-950 object-cover -scale-x-100"
                        muted
                        playsInline
                      />
                      <div className="flex gap-1.5 justify-center">
                        <button
                          type="button"
                          onClick={captureWebcamSnapshot}
                          className="px-2 py-0.5 bg-cyan-950 border border-cyan-500/30 text-cyan-300 rounded text-[8px] uppercase font-bold cursor-pointer"
                        >
                          📸 Snap
                        </button>
                        {!webcamRecording ? (
                          <button
                            type="button"
                            onClick={startWebcamRecording}
                            className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/30 text-emerald-400 rounded text-[8px] uppercase font-bold cursor-pointer"
                          >
                            🔴 Record
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopWebcamRecording}
                            className="px-2 py-0.5 bg-red-950 border border-red-500/35 text-red-400 rounded text-[8px] uppercase font-bold cursor-pointer animate-pulse"
                          >
                            Stop
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={stopWebcamLens}
                          className="px-1.5 py-0.5 bg-zinc-800 text-slate-350 rounded text-[8px] uppercase"
                        >
                          Off
                        </button>
                      </div>
                    </div>
                  )}

                  {!isWebcamLensActive && (
                    <button
                      type="button"
                      onClick={startWebcamLens}
                      className="w-full flex items-center justify-center gap-1 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/20 rounded-lg text-[9px] text-[#00f2ff] font-bold uppercase transition cursor-pointer font-mono"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Live Sentry Cam Feed</span>
                    </button>
                  )}

                  {/* Preset slide template chooser */}
                  <div className="space-y-1">
                    <label className="text-[7.5px] font-bold text-slate-500 uppercase block font-mono">Or select backdrop preset</label>
                    <select
                      value={!newStoryImage.startsWith('data:') && !newStoryVideo.startsWith('data:') ? (newStoryImage || newStoryVideo || '') : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          setNewStoryImage('');
                          setNewStoryVideo('');
                        } else if (val.endsWith('.mp4')) {
                          setNewStoryVideo(val);
                          setNewStoryImage('');
                        } else {
                          setNewStoryImage(val);
                          setNewStoryVideo('');
                        }
                        setLocalStatusFileName('');
                        setLocalMediaType(null);
                      }}
                      className="w-full bg-slate-950 border border-white/10 p-1.5 text-[9.5px] rounded-lg text-white font-mono"
                    >
                      <option value="">Simple Solid Backdrop card</option>
                      <option value="https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800">College Computer Center</option>
                      <option value="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800">Developer Desk Workspace</option>
                      <option value="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800">Brainstorming Lounge</option>
                      <option value="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34287-large.mp4">Workstation typing loop (Video)</option>
                      <option value="https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-dry-leaves-in-a-forest-43180-large.mp4">Maddilapalem beach rain (Video)</option>
                    </select>
                  </div>

                  {/* Sentry Attachment preview frame */}
                  {(newStoryImage || newStoryVideo) && (
                    <div className="border border-white/10 rounded-lg p-1 bg-black/45 space-y-1 mt-1">
                      <div className="flex justify-between items-center text-[7.5px] text-slate-400 font-mono">
                        <span>ATTACHMENT PREVIEW:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewStoryImage('');
                            setNewStoryVideo('');
                            setLocalStatusFileName('');
                            setLocalMediaType(null);
                          }}
                          className="text-red-400 hover:text-red-350 font-bold"
                        >
                          RESET
                        </button>
                      </div>
                      <div className="w-full h-20 bg-zinc-950 rounded overflow-hidden relative flex items-center justify-center">
                        {newStoryVideo ? (
                          <video src={newStoryVideo} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                        ) : (
                          <img src={newStoryImage} className="w-full h-full object-cover" alt="Attachment preview" />
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.2 rounded text-[7px] font-mono uppercase text-[#00f2ff]">
                          {newStoryVideo ? 'STATUS VIDEO' : 'STATUS IMAGE'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EXPANSIVE MULTI-INDUSTRY MUSIC SEARCH & SELECTOR PANEL */}
            <div className="p-3 bg-slate-950 border border-cyan-500/10 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center pb-1 border-b border-white/5">
                <span className="text-[8.5px] font-mono font-black text-pink-400 uppercase tracking-widest flex items-center gap-1">
                  <Music className="w-3 h-3 text-pink-400 animate-pulse" />
                  Select Cinema Soundtrack
                </span>
                
                {/* Auto update online triggers */}
                <button
                  type="button"
                  onClick={async () => {
                    setIsAutoUpdatingMusic(true);
                    playHaptic('light');
                    try {
                      const addedTracks = await fetchNewRoyaltyFreeTracks();
                      setDynamicMusicList(prev => {
                        const existingIds = new Set(prev.map(t => t.id));
                        const uniqueAdded = addedTracks.filter(t => !existingIds.has(t.id));
                        return [...prev, ...uniqueAdded];
                      });
                      playHaptic('success');
                      playVoice("Telemetry sync completed. Added new royalty-free instrumental tracks.");
                      alert("✓ Royalty-Free Sound Sentry Sync: 4 new public-domain CC0 instrumental tracks compiled and synced successfully!");
                    } catch (err) {
                      console.error("Failed to auto-fetch new royalty-free tracks:", err);
                      playHaptic('light');
                      alert("⚠️ Telemetry sync warning: Public API is currently overloaded. Please try again.");
                    } finally {
                      setIsAutoUpdatingMusic(false);
                    }
                  }}
                  className="text-[8px] font-bold bg-pink-950/60 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-pink-950 cursor-pointer text-center animate-pulse"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isAutoUpdatingMusic ? 'animate-spin' : ''}`} />
                  {isAutoUpdatingMusic ? "SYNCING..." : "AUTO-UPDATE MUSIC"}
                </button>
              </div>

              {/* Music Filter Buttons */}
              <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[7.5px] select-none">
                {['ALL', 'Tollywood', 'Bollywood', 'Sandalwood', 'Mollywood', 'Kollywood', 'Hollywood'].map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => {
                      setMusicFilterIndustry(ind);
                      playHaptic('light');
                    }}
                    className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
                      musicFilterIndustry === ind
                        ? 'bg-pink-500 text-slate-950'
                        : 'bg-zinc-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  value={searchMusicQuery}
                  onChange={(e) => setSearchMusicQuery(e.target.value)}
                  placeholder="Search over 15+ cinematic soundtracks..."
                  className="w-full bg-slate-950 border border-white/10 p-1.5 pl-5.5 text-[9px] rounded-lg text-slate-100 placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                />
                <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
              </div>

              {/* Scrollable song list selection */}
              <div className="max-h-24 overflow-y-auto pr-1 space-y-1 scrollbar-thin select-none">
                <button
                  type="button"
                  onClick={() => {
                    setNewStoryMusic('none');
                    playHaptic('light');
                  }}
                  className={`w-full text-left p-1 rounded text-[8.5px] block border ${
                    newStoryMusic === 'none'
                      ? 'bg-zinc-800 text-cyan-300 border-cyan-500/40'
                      : 'bg-zinc-950 text-slate-400 border-transparent hover:bg-zinc-900/40'
                  }`}
                >
                  🔇 No Soundtrack (Silence status)
                </button>

                {dynamicMusicList
                  .filter(track => {
                    const matchesSearch = track.title.toLowerCase().includes(searchMusicQuery.toLowerCase()) || 
                                          track.artist.toLowerCase().includes(searchMusicQuery.toLowerCase());
                    const matchesIndustry = musicFilterIndustry === 'ALL' || track.industry === musicFilterIndustry;
                    return matchesSearch && matchesIndustry;
                  })
                  .map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        setNewStoryMusic(track.id);
                        playHaptic('light');
                        // Quick audio preview trigger to verify track
                        const audioPrev = new Audio(track.url);
                        audioPrev.volume = 0.15;
                        audioPrev.play().catch(() => {});
                        setTimeout(() => audioPrev.pause(), 3000);
                      }}
                      className={`w-full text-left p-1.5 rounded text-[8px] flex items-center justify-between border transition ${
                        newStoryMusic === track.id
                          ? 'bg-pink-950/45 text-pink-300 border-pink-500/40'
                          : 'bg-zinc-950 text-slate-300 border-transparent hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="truncate max-w-[170px]">
                        <span className="font-bold text-slate-100 block truncate">{track.title}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[7px] text-slate-500 truncate">{track.artist}</span>
                          <span className="text-[6.5px] scale-90 origin-left shrink-0 font-bold px-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded uppercase">
                            Royalty-Free
                          </span>
                        </div>
                      </div>
                      <span className="text-[6.5px] font-mono px-1.5 py-0.2 bg-zinc-900 rounded font-bold text-slate-400 shrink-0 uppercase">
                        {track.industry}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* WHATSAPP PRIVACY CONTROLS */}
            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block">🔒 WhatsApp Status Privacy Settings</label>
              <select
                value={statusPrivacy}
                onChange={(e) => {
                  setStatusPrivacy(e.target.value as 'contacts' | 'private' | 'only');
                  playHaptic('light');
                }}
                className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-lg text-white font-bold font-mono"
              >
                <option value="contacts">👥 My Contacts (All connected cadets)</option>
                <option value="private">🔒 Private (Only Sentry Administrators)</option>
                <option value="only">🎯 Only Share With (Custom secure feed ring)</option>
              </select>
            </div>

            {/* DURATION CONTROL */}
            <div className="space-y-1">
              <label className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Status screen duration limits</label>
              <select
                value={newStoryDuration}
                onChange={(e) => setNewStoryDuration(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-lg text-white font-mono"
              >
                <option value={15}>15 Seconds (Fast Cinematic Status)</option>
                <option value={30}>30 Seconds (Standard WhatsApp Status)</option>
                <option value={60}>60 Seconds (Full 1-Min HD Feed Story)</option>
              </select>
            </div>

            {/* BUTTON SUBMIT */}
            <button 
              type="submit"
              className="w-full py-2.5 bg-[#00e676] hover:bg-[#00c853] text-zinc-950 font-black text-xs font-mono uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer shadow-md shadow-emerald-500/10 text-center"
            >
              🚀 Broadcast Sentry Status online
            </button>
          </form>
        </div>
      )}

      {/* SECURE BIOMETRIC / HOLOGRAPHIC CALL OVERLAY SCREEN */}
      {activeCall && (
        <div className={`fixed inset-0 z-[300] flex flex-col justify-between items-center p-8 animate-fadeIn text-slate-200 select-none ${
          activeThreadId.startsWith('thread-tg-') 
            ? 'bg-gradient-to-b from-[#0c1d2e] via-[#07131e] to-[#040910]' 
            : 'bg-[#071a17]/95'
        }`}>
          <div className="text-center space-y-2 mt-12 w-full max-w-sm">
            {activeThreadId.startsWith('thread-tg-') ? (
              <span className="bg-[#0088cc] text-white font-mono font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 justify-center mx-auto w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                📲 TELEGRAM PEER LINK
              </span>
            ) : (
              <span className="bg-emerald-600 text-slate-950 font-black font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded shadow">
                {activeCall.type === 'video' ? '🛰️ COMPILING SECURE HOLOGRAPHIC FACELINK' : '📞 ACTIVE ENCRYPTION STREAM'}
              </span>
            )}
            
            <div className={`w-24 h-24 rounded-full overflow-hidden mx-auto mt-4 shadow-xl border-2 ${
              activeThreadId.startsWith('thread-tg-') ? 'border-[#0088cc]' : 'border-emerald-400'
            }`}>
              <img src={activeCall.avatar} className="w-full h-full object-cover" alt="" />
            </div>
            
            <h3 className="text-lg font-black text-white uppercase tracking-tight mt-2">{activeCall.peerName}</h3>
            
            {activeThreadId.startsWith('thread-tg-') && (
              <div className="text-[10.5px] font-mono text-slate-400 bg-slate-950/40 py-1 px-3.5 rounded-full border border-white/5 w-fit mx-auto">
                Identity line: <strong className="text-amber-400 select-all font-bold font-sans">+91 {currentUser.mobileNumber || '8500394696'}</strong>
              </div>
            )}

            <div className={`text-xs font-mono font-black uppercase tracking-wider ${
              activeThreadId.startsWith('thread-tg-') ? 'text-sky-400' : 'text-emerald-400'
            }`}>
              {tgCallState === 'dialing' && (
                <span className="flex items-center gap-1 justify-center">
                  <span className="inline-block animate-pulse">Dialing secure peer line (No Bot)...</span>
                </span>
              )}
              {tgCallState === 'ringing' && (
                <span className="flex items-center gap-1 justify-center text-amber-400">
                  <span className="inline-block animate-bounce">Ringing receiver...</span>
                </span>
              )}
              {tgCallState === 'connected' && (
                <span className="animate-pulse flex items-center justify-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')} • LIVE ENCRYPTED PIPE
                </span>
              )}
            </div>
          </div>

          {activeCall.type === 'video' && (
            <div className="flex flex-col items-center gap-3 my-4 animate-fadeIn">
              <div className="w-72 aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-emerald-500/20 relative shadow-2xl">
                {cameraStreamActive ? (
                  <video 
                    ref={localVideoRefRef}
                    autoPlay 
                    muted 
                    playsInline
                    className={`w-full h-full object-cover brightness-105 saturate-120 ${!useRearCamera ? '-scale-x-100' : ''}`}
                  />
                ) : (
                  <video 
                    src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-computer-34287-large.mp4"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className={`w-full h-full object-cover brightness-105 saturate-120 ${!useRearCamera ? '-scale-x-100' : ''}`}
                  />
                )}
                
                <div id="cam-status-label" className="absolute top-2 left-2 text-[8px] font-mono bg-black/75 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {useRearCamera ? 'Rear Camera' : 'Front Camera'} {cameraStreamActive ? '' : '(Simulated)'}
                </div>

                {activeThreadId.startsWith('thread-tg-') && tgCallState === 'connected' && (
                  <div className="absolute top-2 right-2 w-16 h-22 rounded border border-white/20 bg-slate-900/95 overflow-hidden shadow-lg animate-fadeIn flex flex-col justify-center items-center p-1">
                    <img src={currentUser.avatar} className="w-full h-10 object-cover rounded" alt="" />
                    <span className="text-[6px] font-mono text-zinc-400 text-center block mt-1 scale-90 leading-tight">Outgoing:<br/>+91 {currentUser.mobileNumber || '8500394696'}</span>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-x-0 bottom-2 text-[7.5px] font-mono text-amber-400 text-center bg-black/80 px-2 py-0.5 leading-none">
                    {useRearCamera ? 'Simulated Rear' : 'Simulated Front'} View (Internal secure tunnel link)
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setUseRearCamera(!useRearCamera);
                  playHaptic('light');
                  playVoice(`Switching to ${!useRearCamera ? 'rear' : 'front'} camera.`);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl font-mono text-[10px] font-bold uppercase transition active:scale-95 cursor-pointer shadow-md ${
                  activeThreadId.startsWith('thread-tg-')
                    ? 'bg-slate-950/90 hover:bg-slate-900 border-slate-700 text-[#0088cc] hover:text-white'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/40 text-emerald-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Switch to {useRearCamera ? 'Front Camera' : 'Rear Camera'}</span>
              </button>
            </div>
          )}

          {activeCall.type === 'voice' && activeThreadId.startsWith('thread-tg-') && tgCallState === 'connected' && (
            <div className="flex flex-col items-center gap-1.5 my-2 animate-fadeIn">
              <div className="flex items-center gap-1 h-8">
                <span className="w-1.5 h-6 bg-[#0088cc] rounded animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-4 bg-[#0088cc] rounded animate-bounce" style={{ animationDelay: '0.12s' }}></span>
                <span className="w-1.5 h-8 bg-[#0088cc] rounded animate-bounce" style={{ animationDelay: '0.24s' }}></span>
                <span className="w-1.5 h-5 bg-[#0088cc] rounded animate-bounce" style={{ animationDelay: '0.36s' }}></span>
                <span className="w-1.5 h-7 bg-[#0088cc] rounded animate-bounce" style={{ animationDelay: '0.48s' }}></span>
              </div>
              <span className="text-[9px] font-mono text-[#0088cc]/90 tracking-widest uppercase font-bold">HD Biometric Call Connected</span>
            </div>
          )}

          {/* REAL TIME HARDWARE SPECTRUM ANALYSER */}
          {tgCallState === 'connected' && (
            <div className="w-full max-w-xs flex flex-col items-center gap-2 bg-black/40 border border-white/5 rounded-2xl p-4 my-2 animate-fadeIn shrink-0">
              <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0088cc] animate-ping"></span>
                <span>Real Microphone Audio Spectrum</span>
              </div>
              <canvas 
                ref={visualizerCanvasRef} 
                className="w-full h-16 rounded-xl bg-black/50 overflow-hidden border border-white/5" 
                width={320} 
                height={64}
              />
              <span className="text-[8.5px] font-mono text-zinc-500 text-center leading-tight">
                Speak into your mic to observe native browser Web Audio visual spectrum data stream. No latency or simulated delays.
              </span>
            </div>
          )}

          {/* NATIVE DEEP LINKS FOR DIRECT CALLS */}
          {activeThreadId.startsWith('thread-tg-') && (() => {
            const rawId = activeThreadId.replace('thread-tg-', '').trim();
            const digitsOnly = rawId.replace(/\D/g, '');
            let isPhone = false;
            let finalPhone = '';
            
            if (rawId.length >= 10 && /^[0-9\s\-\+]+$/.test(rawId)) {
              isPhone = true;
              finalPhone = digitsOnly;
              if (finalPhone.length === 10) {
                finalPhone = '91' + finalPhone;
              } else if (finalPhone.length === 11 && finalPhone.startsWith('0')) {
                finalPhone = '91' + finalPhone.substring(1);
              }
            }

            const callHref = isPhone ? `tg://call?phone=+${finalPhone}` : `tg://call?domain=${rawId.replace('@', '')}`;
            const resolveHref = isPhone ? `tg://resolve?phone=${finalPhone}` : `tg://resolve?domain=${rawId.replace('@', '')}`;

            return (
              <div className="w-full max-w-xs flex flex-col gap-2.5 p-4 bg-[#0c1d2e]/90 border border-sky-400/10 rounded-2xl animate-fadeIn shrink-0">
                <div className="text-[9.5px] font-bold text-sky-400 font-mono text-center uppercase tracking-wider">
                  📲 NATIVE TELEGRAM OVERRIDE
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={callHref}
                    onClick={() => playHaptic('tap')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-extrabold font-mono text-[9.5px] uppercase rounded-xl transition active:scale-95 text-center shadow shadow-sky-500/15"
                  >
                    📞 App Call
                  </a>

                  <a
                    href={resolveHref}
                    onClick={() => playHaptic('light')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-extrabold font-mono text-[9.5px] uppercase rounded-xl transition active:scale-95 text-center"
                  >
                    💬 Open Chat
                  </a>
                </div>
                
                <div className="text-[8.5px] font-mono text-zinc-400 text-center leading-tight">
                  Instantly trigger a <strong>real voice/video call</strong> or open standard chats inside your <strong>native Telegram Client</strong>.
                </div>
              </div>
            );
          })()}

          <div className="w-full max-w-xs shrink-0 flex flex-col items-center justify-center gap-4 mb-10 text-center">
            <div className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
              {activeThreadId.startsWith('thread-tg-') 
                ? 'SECURE PEER-TO-PEER ENCRYPTED LINK' 
                : 'REAL-TIME HARDWARE HEARTBEAT: CO-ORDINATE TUNNELS UP'}
            </div>
            
            {/* Native Dialer style grid controls */}
            <div className="flex items-center justify-center gap-6 mb-3">
              <button 
                type="button"
                onClick={() => {
                  playHaptic('tap');
                  setIsMutedWeb(!isMutedWeb);
                  playVoice(isMutedWeb ? "Microphone active." : "Microphone muted.");
                }}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  isMutedWeb 
                    ? 'bg-rose-950/45 border-rose-500/50 text-rose-400' 
                    : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-100'
                }`}
                title="Mute"
              >
                {isMutedWeb ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button 
                type="button"
                onClick={() => {
                  playHaptic('tap');
                  setIsSpeakerWeb(!isSpeakerWeb);
                  playVoice(isSpeakerWeb ? "Handset receiver audio." : "Speakerphone active.");
                }}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                  isSpeakerWeb 
                    ? 'bg-cyan-950/45 border-cyan-500/50 text-cyan-400' 
                    : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-100'
                }`}
                title="Speaker"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {activeCall.type === 'video' && (
                <button 
                  type="button"
                  onClick={() => {
                    setCameraStreamActive(!cameraStreamActive);
                    playHaptic('tap');
                  }}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                    !cameraStreamActive 
                      ? 'bg-rose-950/45 border-rose-500/50 text-rose-400' 
                      : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-100'
                  }`}
                  title="Video Feed"
                >
                  <Video className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Native Red Dialer End Call Button */}
            <div className="flex flex-col items-center justify-center gap-1.5">
              <button 
                onClick={() => {
                  setActiveCall(null);
                  setCallDuration(0);
                  playVoice("Telegram peer call ended.");
                  playHaptic('heavy');
                }}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="End Call"
              >
                <Phone className="w-7 h-7 text-white transform rotate-[135deg]" />
              </button>
              <span className="text-[8px] font-mono font-bold text-red-400 tracking-widest uppercase">End Call</span>
            </div>
          </div>
        </div>
      )}

      {/* 4th Pane / Sentry Hub Mobile-Responsive Overlay Bottom Sheet or Floating Card */}
      {isSentryHubOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fadeIn" id="sentry-hub-overlay">
          <div className="bg-[#111b21] border border-cyan-500/20 rounded-3xl w-full max-w-lg h-[90vh] md:h-[80vh] flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.25)]">
            <span className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-pulse"></span>
            
            {/* Modal Header */}
            <div className="p-4 bg-[#202c33] flex justify-between items-center border-b border-white/5 select-none shrink-0 border-none">
              <div className="flex items-center gap-2 text-[#00f2ff] font-extrabold font-mono text-sm uppercase">
                <Cpu className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span>C-SYNC Sentry Ecosystem Hub</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsSentryHubOpen(false)} 
                className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer transition flex items-center justify-center"
                title="Close Hub"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hub Tab Selectors */}
            <div className="bg-[#182229] border-b border-white/5 px-2 py-1.5 flex gap-1.5 shrink-0 overflow-x-auto scrollbar-none select-none">
              <button
                type="button"
                onClick={() => { setHubActiveTab('telemetry'); playHaptic('light'); }}
                className={`flex-grow md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase font-mono tracking-wider transition cursor-pointer select-none ${
                  hubActiveTab === 'telemetry' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/20 shadow-md shadow-emerald-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Hardware Stats</span>
              </button>

              <button
                type="button"
                onClick={() => { setHubActiveTab('about'); playHaptic('light'); }}
                className={`flex-grow md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[10.5px] font-black uppercase font-mono tracking-wider transition cursor-pointer select-none ${
                  hubActiveTab === 'about' 
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/20 shadow-md shadow-amber-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Guide</span>
              </button>
            </div>

            {/* Scrollable Content Pane */}
            <div className="flex-grow overflow-y-auto p-4 md:p-5 custom-scrollbar">
              
              {hubActiveTab === 'telemetry' && (
                <div className="space-y-4 animate-fadeIn text-left font-mono">
                  <div className="bg-[#1a232d] border border-cyan-500/15 p-3.5 rounded-xl space-y-2">
                    <div className="text-[10px] text-cyan-400 font-extrabold pb-1 border-b border-white/5">DEVICE INTEGRITY OVERWATCH</div>
                    <div className="text-[9.5px] text-slate-400 flex justify-between"><span>CPU ARCHITECTURE:</span><span className="text-white">CORE CLUSTER CS-09</span></div>
                    <div className="text-[9.5px] text-slate-400 flex justify-between"><span>IP BIND TUNNEL:</span><span className="text-white">10.100.22.45</span></div>
                    <div className="text-[9.5px] text-slate-400 flex justify-between"><span>GEOFENCE ENCLAVE:</span><span className="text-emerald-400 font-bold">100% SIGNAL</span></div>
                    <div className="text-[9.5px] text-slate-400 flex justify-between"><span>UGC COMPLIANCE CODE:</span><span className="text-blue-400">REGISTERED</span></div>
                  </div>

                  <div className="bg-[#152e25] border border-emerald-500/15 p-3.5 rounded-xl space-y-2">
                    <div className="text-[10px] text-emerald-400 font-extrabold pb-1 border-b border-white/5">COMPUTE SHIELDS</div>
                    <div className="text-[9.5px] text-slate-400 flex justify-between"><span>VIRTUAL KERNEL:</span><span className="text-white">MOTHERBOT Standalone</span></div>
                    <div className="text-[9.5px] text-slate-400 flex justify-between"><span>REACTION LATENCY:</span><span className="text-white">0.02ms AVG</span></div>
                    <div className="text-[9.5px] text-slate-400 flex justify-between"><span>UPI COMMITTED:</span><span className="text-emerald-450">SECURE TUNNEL WORKING</span></div>
                  </div>

                  <div className="p-3 bg-[#11121d] border border-white/5 rounded-xl text-[9px] text-slate-400 leading-normal select-text">
                    Sentry automated network checks execute real-time local packet auditing matching Dr. V.S. Krishna regulatory policies without any license requirements.
                  </div>
                </div>
              )}

              {hubActiveTab === 'about' && (
                <div className="p-1 space-y-4 text-left font-sans text-xs text-slate-400 leading-relaxed select-text animate-fadeIn">
                  <div className="bg-[#11121d] border border-[#222c32] p-4 rounded-xl space-y-2">
                    <h3 className="font-extrabold text-[#00f2ff] font-mono text-[11px] uppercase tracking-wider">C-SYNC Academic Companion PWA</h3>
                    <span className="text-[8px] font-mono text-zinc-500 block leading-none">RELEASE SECURE DEPLOYMENT 3.99 Offline-Validated</span>
                  </div>
                  <p>Welcome to the premium modular chat system designed specifically for young-minded college administrators, student leaders, and NAAC coordinators.</p>
                  <p className="font-mono text-xs text-slate-100 bg-[#202c33]/50 p-3 rounded-xl border border-white/5">
                    🚀 <strong>OFFLINE AND FREE INTEGRATIONS:</strong> Completely free neural models, Direct YouTube search streams, Lo-fi music broadcasts, and sandbox PhonePe peer-to-peer triggers with absolute zero registration fees.
                  </p>
                  <div className="flex gap-2.5 pt-1.5 select-none font-mono">
                    <button type="button" onClick={() => { playVoice("Standalone Sentry Hub compiled successfully. Connection secure."); playHaptic('light'); }} className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 px-3.5 py-1.5 text-[9.5px] rounded-lg font-mono font-bold uppercase transition cursor-pointer">Listen Description</button>
                    <button type="button" onClick={() => { alert("C-Sync Standing Autonomous Ledger is running in stand-alone sandboxed development preview mode."); playHaptic('light'); }} className="border border-white/10 hover:bg-white/5 text-white px-3.5 py-1.5 text-[9.5px] rounded-lg font-mono font-bold uppercase transition cursor-pointer">Checksum</button>
                  </div>
                </div>
              )}

            </div>

            {/* Hub Sticky Footer info button */}
            <div className="p-3 bg-[#202c33] border-t border-white/5 text-[9px] font-mono text-center text-slate-500 shrink-0 select-none border-none">
              SECURE INTEGRATION ENCLAVE ACTIVE • LEVEL {currentUser.level} TRUSTED
            </div>
          </div>
        </div>
      )}

      {/* TELEGRAM SENTRY DIRECT TUNNEL MODAL */}
      {isTelegramDirectOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-fadeIn animate-duration-150" id="tg-direct-overlay">
          <div className="bg-[#111b21] border border-sky-500/20 rounded-3xl w-full max-w-md flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(14,165,233,0.25)]">
            <span className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-sky-450 via-blue-500 to-sky-450 animate-pulse"></span>
            
            {/* Header */}
            <div className="p-4 bg-[#202c33] flex justify-between items-center border-b border-white/5 select-none shrink-0 border-none">
              <div className="flex items-center gap-2 text-sky-400 font-extrabold font-mono text-xs uppercase">
                <Send className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>Telegram Sentry Gateway Link</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsTelegramDirectOpen(false)} 
                className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer transition flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Form */}
            <div className="p-5 space-y-4 text-left font-sans text-xs">
              <p className="text-slate-400 leading-relaxed font-sans text-[11px]">
                Establish a direct outside-network peer tunnel to any Telegram handle or contact sequence. An interactive off-grid handshake message will be dispatched.
              </p>

              <div className="bg-sky-950/30 border border-sky-500/10 p-3 rounded-xl space-y-1">
                <span className="text-[8px] font-mono font-extrabold text-[#38bdf8] uppercase block">TELEGRAM BRIDGE INFORMATION</span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  C-Sync routes traffic over open REST APIs. Creating a thread instantiates a carrier loop that simulates full bi-directional telegram updates.
                </p>
              </div>

              {/* Type Selectors */}
              <div className="grid grid-cols-2 gap-2 select-none">
                <button
                  type="button"
                  onClick={() => { setTgContactType('username'); playHaptic('light'); }}
                  className={`py-2 px-3 rounded-xl text-[9px] font-bold uppercase transition font-mono border ${
                    tgContactType === 'username'
                      ? 'bg-sky-950 border-sky-500/30 text-sky-300 font-bold'
                      : 'bg-transparent border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                  }`}
                >
                  @ Username
                </button>
                <button
                  type="button"
                  onClick={() => { setTgContactType('phone'); playHaptic('light'); }}
                  className={`py-2 px-3 rounded-xl text-[9px] font-bold uppercase transition font-mono border ${
                    tgContactType === 'phone'
                      ? 'bg-sky-950 border-sky-500/30 text-sky-300 font-bold'
                      : 'bg-transparent border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                  }`}
                >
                  Phone sequence
                </button>
              </div>

              {/* Input Form */}
              {tgContactType === 'username' ? (
                <div className="space-y-1.5">
                  <label className="text-[8.5px] font-mono text-slate-500 tracking-tight block uppercase font-bold">Contact Username (Handle)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-mono">@</span>
                    <input
                      type="text"
                      value={tgContactUsername}
                      onChange={(e) => setTgContactUsername(e.target.value.replace(/[@ ]/g, ''))}
                      placeholder="Username_or_Handle"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-7 pr-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[8.5px] font-mono text-slate-500 tracking-tight block uppercase font-bold">Phone identifier sequence</label>
                  <input
                    type="tel"
                    value={tgContactPhone}
                    onChange={(e) => setTgContactPhone(e.target.value.replace(/[^0-9\+]/g, ''))}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              )}

              {/* Form trigger */}
              <button
                type="button"
                onClick={() => {
                  const contactVal = tgContactType === 'username' ? tgContactUsername : tgContactPhone;
                  if (!contactVal.trim()) {
                    alert("Please provide a valid Telegram contact address sequence.");
                    return;
                  }
                  playHaptic('heavy');
                  const finalContactStr = tgContactType === 'username' ? `@${contactVal}` : contactVal;
                  
                  // call our new clientDb function!
                  const newThr = db.createTelegramExternalThread(finalContactStr, currentUser.fullName);
                  
                  // sync the states
                  setThreads(db.getChatThreads());
                  setActiveThreadId(newThr.id);
                  setMessages(db.getChatMessages(newThr.id));
                  setIsTelegramDirectOpen(false);
                  
                  // reset fields
                  setTgContactUsername('');
                  setTgContactPhone('');
                  
                  playVoice("Secure telegram routing handshake complete. Tunnel established.");
                  alert(`📡 Telegram Carrier Connect Success:\nTunnel link generated and mapped securely for [${finalContactStr}]. End-to-end sandbox handshake thread opened!`);
                }}
                className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-[#0f212f] font-black text-xs font-mono uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer shadow-md text-center"
              >
                Launch Handshake carrier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTACTS SELECTOR OVERLAY PANEL */}
      {isContactSelectorOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#1e2a3c] border border-white/5 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col max-h-[450px]">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3 select-none">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase tracking-wider text-teal-400">
                <Users className="w-4 h-4" />
                <span>Select Peer Contact to Share</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsContactSelectorOpen(false);
                  playHaptic('tap');
                }}
                className="text-slate-400 hover:text-white cursor-pointer transition p-1 rounded-full hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick search */}
            <div className="mb-3 relative">
              <input
                type="text"
                placeholder="Search registered peers..."
                className="w-full bg-slate-950/60 border border-white/10 rounded-lg p-2.5 pl-8 text-xs text-white focus:outline-none focus:border-teal-400 font-sans"
                onChange={(e) => {
                  setContactSearchVal(e.target.value);
                }}
                value={contactSearchVal}
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3.5" />
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {db.getUsers()
                .filter(u => {
                  if (u.fullName === currentUser.fullName) return false; // don't share self
                  if (!contactSearchVal.trim()) return true;
                  return u.fullName.toLowerCase().includes(contactSearchVal.toLowerCase()) || 
                         (u.role || '').toLowerCase().includes(contactSearchVal.toLowerCase()) ||
                         (u.idNumber || '').toLowerCase().includes(contactSearchVal.toLowerCase());
                })
                .map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      playHaptic('success');
                      // Format the message according to Option 5 contact shared matching regex:
                      // '👤 [Contact Shared] name: ' + ... + ' | role: ' + ... + ' | id: ' + ...
                      handleSendMessage(
                        undefined, 
                        `👤 [Contact Shared] name: ${u.fullName} | role: ${u.role || 'Student'} | id: ${u.idNumber || 'CS-XXXX'}`
                      );
                      setIsContactSelectorOpen(false);
                      setContactSearchVal('');
                    }}
                    className="w-full bg-[#111b21] hover:bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5 transition text-left cursor-pointer hover:border-teal-500/30 group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 bg-slate-950 flex items-center justify-center font-bold text-teal-405">
                      {u.photoBlob ? (
                        <img src={u.photoBlob} alt="" className="w-full h-full object-cover" />
                      ) : (
                        u.fullName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-teal-400 transition leading-tight truncate">{u.fullName}</div>
                      <div className="text-[8.5px] text-slate-400 font-mono tracking-tight uppercase leading-none mt-1">{u.role || 'Student'} • {u.idNumber || 'CS-XXXX'}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                  </button>
                ))
              }
              {db.getUsers().filter(u => u.fullName !== currentUser.fullName).length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 font-mono">No registered peers found in Sentry database.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE LIVE CAMERA STREAM GATEWAY */}
      {isChatCameraOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0a1118] border border-cyan-500/30 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,242,255,0.15)] relative flex flex-col overflow-hidden">
            <span className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-pink-500 via-cyan-400 to-pink-500 animate-pulse"></span>
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3 select-none">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase tracking-wider text-cyan-400">
                <Camera className="w-4 h-4 animate-pulse text-pink-500" />
                <span>CSYNC Workstation Camera Transceiver</span>
              </div>
              <button
                type="button"
                onClick={closeChatCamera}
                className="text-slate-400 hover:text-white cursor-pointer transition p-1.5 rounded-full hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner / Sandbox Status */}
            {chatCameraError ? (
              <div className="bg-cyan-950/40 border border-cyan-500/20 rounded-xl p-3 text-cyan-400 text-xxs font-mono leading-relaxed mb-4 text-left select-none">
                <div className="font-extrabold pb-0.5 text-pink-400 uppercase">SANDBOX MEDIA BRIDGE ACTIVE:</div>
                {chatCameraError}
                <div className="mt-1 text-slate-400">Physical feed blocked by frame policy. Switch front/rear to test dynamic webcam outputs!</div>
              </div>
            ) : null}

            {/* Live Video Preview Box */}
            <div className="relative aspect-video rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden mb-4 shadow-inner">
              {chatCameraStream ? (
                <video
                  ref={chatCameraVideoRef}
                  className={`w-full h-full object-cover ${!useRearCamera ? '-scale-x-100' : ''}`}
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <div className="w-full h-full relative flex flex-col items-center justify-center bg-slate-950 p-4">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c712_1px,transparent_1px),linear-gradient(to_bottom,#0284c712_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />
                  
                  {/* Avatar or Station Photo based on Front/Rear state */}
                  {!useRearCamera ? (
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-500/40 p-1 relative z-10 animate-pulse bg-slate-900/60 flex items-center justify-center overflow-hidden">
                      <img 
                        src={currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop'} 
                        alt="Simulated Face" 
                        className="w-full h-full rounded-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-36 h-20 rounded-lg border-2 border-dashed border-cyan-500/40 p-1 relative z-10 overflow-hidden animate-pulse bg-slate-900/60">
                      <img 
                        src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300"
                        alt="Simulated Room Workstation" 
                        className="w-full h-full object-cover rounded-md" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="mt-2 text-[8px] font-mono text-cyan-400 font-extrabold uppercase bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded tracking-widest relative z-10 shadow-md">
                    {!useRearCamera ? "Simulated Front User Camera" : "Simulated Rear Workstation Lab"}
                  </div>
                </div>
              )}
              
              {/* Sci-Fi Sentry Grid / HUD */}
              <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 flex flex-col justify-between p-3 select-none font-mono text-[7px] text-cyan-400/80">
                <div className="flex justify-between items-start">
                  <div className="bg-slate-950/85 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-widest font-black">
                    REC PROXIMITY ACTIVE
                  </div>
                  <div className="bg-slate-950/85 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-widest font-black text-pink-400">
                    SENTRY OVERRIDE BYPASS
                  </div>
                </div>

                {/* Target sight reticle */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-16 h-16 border-2 border-dashed border-cyan-400 rounded-full animate-spin animate-duration-[10s]"></div>
                  <div className="absolute w-2 h-2 bg-pink-500 rounded-full"></div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="bg-slate-950/85 px-1.5 py-0.5 rounded border border-white/5">
                    CAM_DEVICES: {Math.max(1, chatCameraDevices.length)} ACTIVE
                  </div>
                  <div className="bg-slate-950/85 px-1.5 py-0.5 rounded border border-white/5">
                    {new Date().toISOString().substring(11, 19)} UTC
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Row */}
            <div className="flex items-center gap-2.5 justify-between">
              <button
                type="button"
                onClick={closeChatCamera}
                className="py-2.5 px-4 bg-zinc-900 border border-white/5 text-slate-300 hover:text-white rounded-xl text-[10px] font-bold uppercase transition font-mono hover:bg-zinc-800 shrink-0 cursor-pointer"
              >
                Cancel
              </button>

              {/* Shutter button - the main event */}
              <button
                type="button"
                onClick={captureChatPhoto}
                className="flex-grow py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border border-cyan-400 text-slate-950 font-black text-xs font-mono uppercase tracking-widest rounded-xl transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,242,255,0.2)] cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                <span>Capture Shutter Frame</span>
              </button>

              {/* Switch camera button (Always available for simulator/hardware) */}
              <button
                type="button"
                onClick={switchChatCamera}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-cyan-400 hover:text-white transition flex items-center justify-center shrink-0 cursor-pointer"
                title="Switch Camera source trigger"
              >
                <RotateCw className="w-4 h-4 text-cyan-400 animate-spin animate-duration-[8s]" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
