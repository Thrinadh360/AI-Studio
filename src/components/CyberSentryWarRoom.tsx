import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Trash2, 
  Play, 
  Send, 
  Key, 
  RefreshCw, 
  Radio, 
  Cpu, 
  Wifi, 
  AlertOctagon, 
  ShieldCheck, 
  Terminal, 
  Lock, 
  Unlock,
  Sliders
} from 'lucide-react';
import { ClientDatabase } from '../clientDb';

interface CyberSentryWarRoomProps {
  db: ClientDatabase;
  onRefreshAll: () => void;
}

interface Packet {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  port: number;
  protocol: 'TCP' | 'UDP' | 'WSS' | 'MQTT';
  eventType: 'HANDSHAKE' | 'DB_SYNC' | 'KEEPALIVE' | 'PANIC_SOS' | 'ADMIN_OVERRIDE';
  sizeBytes: number;
  payload: string;
  status: 'ALLOWED' | 'QUARANTINED' | 'FLAGGED';
}

interface ThreatAlert {
  id: string;
  timestamp: string;
  workstationId: string;
  threatLevel: 'CRITICAL' | 'WARNING' | 'NOTICE';
  signatureName: string;
  sourceIp: string;
  description: string;
  status: 'PENDING' | 'QUARANTINED' | 'DISMISSED';
}

export const CyberSentryWarRoom: React.FC<CyberSentryWarRoomProps> = ({ db, onRefreshAll }) => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>([]);
  const [activeDpiFilter, setActiveDpiFilter] = useState<'ALL' | 'SECURE_ONLY' | 'THREATS'>('ALL');
  const [radarDegree, setRadarDegree] = useState(0);
  const [decryptionSeed, setDecryptionSeed] = useState('0x6F92B3A7E24F');
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [decryptedText, setDecryptedText] = useState('');
  const [decrypting, setDecrypting] = useState(false);
  const [customIp, setCustomIp] = useState('172.16.14.88');
  const [customPort, setCustomPort] = useState(3000);
  const [customPayload, setCustomPayload] = useState('EXECUTE_REMOTE_SHELL_TEST');
  const [customStation, setCustomStation] = useState('CS-05');
  const [customType, setCustomType] = useState<'HANDSHAKE' | 'DB_SYNC' | 'KEEPALIVE' | 'PANIC_SOS' | 'ADMIN_OVERRIDE'>('DB_SYNC');

  const packetsEndRef = useRef<HTMLDivElement>(null);

  // Initialize simulated threat database & network packets
  useEffect(() => {
    const initialPackets: Packet[] = [
      { id: 'PKT-1001', timestamp: new Date(Date.now() - 15000).toISOString(), source: '172.16.14.12', destination: 'CS-GATEWAY-1', port: 3000, protocol: 'TCP', eventType: 'HANDSHAKE', sizeBytes: 128, payload: `CLIENT_IDENT: CS-01:${db.getStation('CS-01')?.pcMacAddress || 'Pending First Run'}`, status: 'ALLOWED' },
      { id: 'PKT-1002', timestamp: new Date(Date.now() - 12000).toISOString(), source: '172.16.14.35', destination: 'CS-GATEWAY-1', port: 3000, protocol: 'WSS', eventType: 'DB_SYNC', sizeBytes: 1044, payload: 'REPLICA_FILE_HASH: db62fcc74df83da98c8', status: 'ALLOWED' },
      { id: 'PKT-1003', timestamp: new Date(Date.now() - 10000).toISOString(), source: '172.16.14.35', destination: 'CS-GATEWAY-1', port: 3000, protocol: 'WSS', eventType: 'KEEPALIVE', sizeBytes: 32, payload: 'PING', status: 'ALLOWED' },
      { id: 'PKT-1004', timestamp: new Date(Date.now() - 8000).toISOString(), source: '172.16.14.99', destination: 'CS-GATEWAY-1', port: 4443, protocol: 'UDP', eventType: 'PANIC_SOS', sizeBytes: 512, payload: 'EMERGENCY_TRIGGER: COORDS: 17.72,83.31', status: 'FLAGGED' },
      { id: 'PKT-1005', timestamp: new Date(Date.now() - 5000).toISOString(), source: '172.16.14.101', destination: 'CS-GATEWAY-1', port: 3000, protocol: 'TCP', eventType: 'ADMIN_OVERRIDE', sizeBytes: 256, payload: 'SYS_AUTH: OPERATOR_KEY: thrinadh_sys', status: 'ALLOWED' },
    ];
    setPackets(initialPackets);

    const initialThreats: ThreatAlert[] = [
      { id: 'THRT-401', timestamp: new Date(Date.now() - 45000).toISOString(), workstationId: 'CS-09', threatLevel: 'CRITICAL', signatureName: 'WINDOWS_SHELL_TAMPER', sourceIp: '172.16.14.15', description: 'Attempt to terminate host explorer.exe wrapper using unapproved WPF bypass hook combinations.', status: 'PENDING' },
      { id: 'THRT-402', timestamp: new Date(Date.now() - 25000).toISOString(), workstationId: 'CS-32', threatLevel: 'WARNING', signatureName: 'GEOFENCE_GPS_SPOOF', sourceIp: '172.16.14.64', description: 'Student simulation node reported GPS coordinate deviation of 1,240 meters. Cross-checked with cellular beacon triangulation.', status: 'PENDING' },
      { id: 'THRT-403', timestamp: new Date(Date.now() - 10000).toISOString(), workstationId: 'CS-11', threatLevel: 'NOTICE', signatureName: 'ACTIVE_PORT_SCANNER', sourceIp: '172.16.14.22', description: 'Repetitive TCP SYN requests directed to listening port range 3001-3015. Potential system discovery scan.', status: 'PENDING' },
    ];
    setThreatAlerts(initialThreats);
  }, []);

  // Radar Rotating Sweep Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarDegree(prev => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Simulated live packet traffic generation
  useEffect(() => {
    const generatePacketInterval = setInterval(() => {
      const activeStations = db.getStations();
      if (activeStations.length === 0) return;

      const randomStation = activeStations[Math.floor(Math.random() * activeStations.length)];
      const lastOctet = 10 + Math.floor(Math.random() * 90);
      const isSecure = Math.random() > 0.15;

      const eventTypes: Array<'HANDSHAKE' | 'DB_SYNC' | 'KEEPALIVE' | 'PANIC_SOS' | 'ADMIN_OVERRIDE'> = [
        'KEEPALIVE', 'KEEPALIVE', 'DB_SYNC', 'HANDSHAKE', 'KEEPALIVE'
      ];
      const selectedType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const sizeBytes = selectedType === 'DB_SYNC' ? 512 + Math.floor(Math.random() * 1024) : 32 + Math.floor(Math.random() * 128);

      const packetPayLoad = selectedType === 'DB_SYNC' 
        ? `SYNC_REVISION_${Math.floor(Math.random() * 10000)}__STATION_${randomStation.stationId}` 
        : `PING_LAT_MS_${10 + Math.floor(Math.random() * 8)}`;

      const newPacket: Packet = {
        id: `PKT-${2000 + Math.floor(Math.random() * 8000)}`,
        timestamp: new Date().toISOString(),
        source: `172.16.14.${lastOctet}`,
        destination: 'CS-GATEWAY-1',
        port: isSecure ? 3000 : 8080,
        protocol: isSecure ? 'WSS' : 'TCP',
        eventType: selectedType,
        sizeBytes: sizeBytes,
        payload: packetPayLoad,
        status: isSecure ? 'ALLOWED' : 'FLAGGED'
      };

      setPackets(prev => [...prev.slice(-30), newPacket]);
    }, 3500);

    return () => clearInterval(generatePacketInterval);
  }, [db]);

  // Handle custom packet injection
  const handleInjectPacket = (e: React.FormEvent) => {
    e.preventDefault();

    const newInjected: Packet = {
      id: `PKT-INJ-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      source: customIp,
      destination: 'CS-GATEWAY-1',
      port: customPort,
      protocol: customPort === 3000 ? 'WSS' : 'TCP',
      eventType: customType,
      sizeBytes: customPayload.length * 2,
      payload: customPayload,
      status: 'ALLOWED'
    };

    setPackets(prev => [...prev, newInjected]);
    db.addLog('SECURITY', `MANUAL NETWORK TEST INJECTED: Source ${customIp}:${customPort} transmitting packet ${newInjected.id}. Payload: "${customPayload}"`, 'info');
    onRefreshAll();

    // Voice synthesize confirmation
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Manual dynamic packet ${newInjected.id} injected from simulated I P ${customIp}. Socket response OK.`);
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    }
  };

  // Perform Simulated Cipher crack
  const handleDecryptSentry = () => {
    if (decrypting) return;
    setDecrypting(true);
    setDecryptionProgress(0);
    setDecryptedText('');

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Initializing brute force decryption scan. Resolving sha-256 binary entropy block.");
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    }

    const interval = setInterval(() => {
      setDecryptionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDecrypting(false);
          setDecryptedText("SUCCESS: KEY DECRYPTED // SECRET: 'THRINADH_CS_PREVIEW_SECURE_2026'");
          db.addLog('SECURITY', `VAULT DISCOVERY: Local operator decrypted CSYNC internal key: 'THRINADH_CS_PREVIEW_SECURE_2026' successfully.`, 'success');
          onRefreshAll();
          
          if (window.speechSynthesis) {
            try {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance("Key decrypted. Thrinadh C S Preview Secure twenty twenty-six key recovered.");
              window.speechSynthesis.speak(utterance);
            } catch (_) {}
          }
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  // Quarantine a Workstation triggered by threats panel
  const handleQuarantine = (id: string, workstationId: string) => {
    setThreatAlerts(prev => prev.map(t => t.id === id ? { ...t, status: 'QUARANTINED' } : t));
    db.addLog('SECURITY', `HOST ISOLATION: Administrator thrinadh_sys quarantined Workstation ${workstationId}. Internet physical gateway and WPF shell locked.`, 'warning');
    onRefreshAll();

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Security Alert! Workstation ${workstationId} has been successfully quarantined and isolated from the primary subnet routing tables due to high security threats.`);
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    }
  };

  const handleDismissThreat = (id: string, workstationId: string) => {
    setThreatAlerts(prev => prev.map(t => t.id === id ? { ...t, status: 'DISMISSED' } : t));
    db.addLog('SECURITY', `SECURITY CLASSIFICATION: Threat signature on Host ${workstationId} has been dismissed under operator waiver policies.`, 'info');
    onRefreshAll();

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Security notice on Host ${workstationId} has been dismissed.`);
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    }
  };

  // Filter package logs based on active DPI filter
  const filteredPackets = packets.filter(p => {
    if (activeDpiFilter === 'SECURE_ONLY') {
      return p.port === 3000 || p.protocol === 'WSS';
    }
    if (activeDpiFilter === 'THREATS') {
      return p.status === 'FLAGGED' || p.eventType === 'PANIC_SOS';
    }
    return true;
  });

  return (
    <div className="bg-[#050b1c] rounded-2xl border border-cyan-500/25 p-5 backdrop-blur-md shadow-2xl text-left select-none relative overflow-hidden">
      {/* Decorative cyber ambient elements */}
      <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-red-500/[0.015] rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#00f2ff]/[0.012] rounded-full blur-3xl pointer-events-none"></div>

      {/* Primary Headers */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-500/15 pb-4 mb-5 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#00f2ff] uppercase">
            <Radio className="w-4 h-4 animate-pulse text-red-500" />
            LIVE CYBER-SENTRY INTRUSION DETECTOR (IDS)
          </div>
          <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
            Real-time Threat War Room, Deep Packet Sockets Sniffer & Core Cryptographic Decoder Sentry Node
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-[8px] bg-red-950 border border-red-500/30 text-rose-400 px-2.5 py-1 rounded-sm uppercase tracking-wider font-bold animate-pulse">
            SHIELD: LIVE SECURE
          </span>
          <span className="text-[8px] bg-cyan-950 border border-cyan-500/20 text-[#00f2ff] px-2.5 py-1 rounded-sm uppercase tracking-wide">
            AUDIT SPEED: T+20ms
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Map & Threat Sentry alerts (Left Side - 7/12) */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-6">
          
          {/* Sublayout of Sentry Radar Sweep side by side with Live Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
            
            {/* Sentry Sweeper Panel */}
            <div className="md:col-span-5 flex flex-col items-center justify-center border-r border-white/5 pr-0 md:pr-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center mb-3">CONCENTRIC SENTRY RADAR</span>
              
              <div className="relative w-44 h-44 rounded-full border-2 border-[#00f2ff]/20 bg-slate-950 flex items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(0,242,255,0.1)]">
                {/* Rotating Sweeper Line */}
                <div 
                  className="absolute top-1/2 left-1/2 w-24 h-24 origin-top-left border-l border-[#00f2ff]/40 bg-gradient-to-tr from-[#00f2ff]/10 to-transparent pointer-events-none"
                  style={{ transform: `rotate(${radarDegree}deg) translate(-100%, -100%)` }}
                ></div>

                {/* Subnet grid division rings */}
                <div className="absolute w-32 h-32 rounded-full border border-[#00f2ff]/15"></div>
                <div className="absolute w-20 h-20 rounded-full border border-[#00f2ff]/10"></div>
                <div className="absolute w-8 h-8 rounded-full border border-[#00f2ff]/5"></div>

                {/* Simulated Workstation IP Nodes on Radar map */}
                <div className="absolute top-12 left-12 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#34d399] animate-ping duration-1000"></div>
                <div className="absolute top-12 left-12 w-1.5 h-1.5 rounded-full bg-green-500" title="Host CS-01: OK"></div>

                <div className="absolute bottom-16 right-10 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#34d399] animate-ping duration-[1.5s]"></div>
                <div className="absolute bottom-16 right-10 w-1.5 h-1.5 rounded-full bg-green-500" title="Host CS-35: OK"></div>

                <div className="absolute top-8 right-16 w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_10px_#f87171] animate-ping duration-700"></div>
                <div className="absolute top-8 right-16 w-2 h-2 rounded-full bg-red-500" title="Host CS-09: TAMPER DETECTED"></div>

                <div className="absolute bottom-8 left-14 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-ping duration-[2s]"></div>
                <div className="absolute bottom-8 left-14 w-1.5 h-1.5 rounded-full bg-amber-500" title="Host CS-32: GEOFENCE SPOOF WARNING"></div>

                {/* Center Station node indicator */}
                <div className="w-3 h-3 bg-cyan-400 rounded-sm shadow-[0_0_8px_#00f2ff] flex items-center justify-center animate-pulse">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="mt-4 font-mono text-[8px] text-slate-500 space-y-0.5 text-center leading-normal">
                <div>SWEEPING FREQ: <span className="text-[#00f2ff]">31.2 KHz</span></div>
                <div>RADAR IP DISCOVERY RANGE: <span className="text-[#00f2ff]">172.16.14.*</span></div>
              </div>
            </div>

            {/* Sentry active alerts */}
            <div className="md:col-span-7 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                    IDS ACTIVE SIGNATURE THREATS
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">COUNT: {threatAlerts.filter(t => t.status === 'PENDING').length}</span>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {threatAlerts.map(t => (
                    <div 
                      key={t.id} 
                      className={`p-2.5 rounded-lg border text-left leading-normal relative ${
                        t.status === 'QUARANTINED' 
                          ? 'bg-rose-950/20 border-rose-500/20 opacity-60' 
                          : t.status === 'DISMISSED'
                            ? 'bg-slate-900/40 border-white/5 opacity-55'
                            : t.threatLevel === 'CRITICAL' 
                              ? 'bg-[#1a0c10]/80 border-red-500/30' 
                              : 'bg-[#1a1309]/80 border-amber-500/20'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className={`text-[7.5px] font-mono font-extrabold px-1.5 py-0.2 rounded-sm mr-1.5 ${
                            t.status === 'QUARANTINED'
                              ? 'bg-red-950 text-red-400 border border-red-500/20'
                              : t.status === 'DISMISSED'
                                ? 'bg-slate-950 text-slate-400 border border-white/10'
                                : t.threatLevel === 'CRITICAL'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 font-black'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black'
                          }`}>
                            {t.status === 'QUARANTINED' ? 'QUARANTINED' : t.status === 'DISMISSED' ? 'DISMISSED' : t.threatLevel}
                          </span>
                          <span className="font-mono text-[9px] font-black text-white">{t.signatureName}</span>
                        </div>
                        <span className="font-mono text-[8px] text-slate-500">{(t.timestamp || '').replace('T', ' ').slice(11, 19)}</span>
                      </div>

                      <p className="text-[9px] text-slate-300 font-sans mt-1.5 leading-snug">{t.description}</p>
                      
                      <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2">
                        <span className="font-mono text-[8px] text-slate-500">
                          HOST: <strong className="text-cyan-400">{t.workstationId}</strong> ({t.sourceIp})
                        </span>
                        {t.status === 'PENDING' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleDismissThreat(t.id, t.workstationId)}
                              className="bg-slate-905 border border-white/10 hover:border-white/20 px-2 py-0.5 rounded text-[8px] font-mono font-bold text-slate-300 transition-colors uppercase"
                            >
                              Ignore
                            </button>
                            <button
                              onClick={() => handleQuarantine(t.id, t.workstationId)}
                              className="bg-red-500/20 hover:bg-red-500/35 border border-red-500/40 px-2 py-0.5 rounded text-[8px] font-mono font-bold text-red-200 transition-colors uppercase flex items-center gap-0.5"
                            >
                              <Lock className="w-2.5 h-2.5" />
                              Quarantine
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Core Decryption cipher breaker widget (Dynamic and highly engaging) */}
          <div className="bg-[#0b1226]/60 border border-cyan-500/10 p-4 rounded-xl text-left">
            <div className="border-b border-white/5 pb-2 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                  DECRYPTION SENTRY / CIPHER DECODER
                </span>
              </div>
              <span className="text-[7.5px] bg-[#221c09] border border-amber-500/30 text-amber-400 px-1.5 py-0.2 rounded font-mono uppercase font-black">
                RECOVERY PROTOCOL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8 space-y-2">
                <p className="text-[9px] text-slate-400 font-sans leading-relaxed">
                  Students and hardware check-ins communicate signatures periodically hashed as SHA-256 binary entropy. Decrypt the seed below using our central key vault to recover the original system authentication indices.
                </p>
                <div className="flex items-center gap-2 bg-slate-950/85 border border-white/5 px-2.5 py-1.5 rounded-lg">
                  <span className="font-mono text-[8px] text-slate-500">SEED:</span>
                  <span className="font-mono text-[9.5px] text-amber-400 font-extrabold tracking-widest">{decryptionSeed}</span>
                  <span className="font-mono text-[8px] text-slate-500 ml-auto select-all cursor-pointer" onClick={() => setDecryptionSeed('0x' + Math.floor(Math.random() * 0xFFFFFFFFFFFF).toString(16).toUpperCase())}>[Roll Secret]</span>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col justify-center">
                <button
                  onClick={handleDecryptSentry}
                  disabled={decrypting}
                  className={`w-full py-2.5 px-3 rounded-lg font-black text-[9.5px] font-mono uppercase tracking-widest border transition-all flex items-center justify-center gap-1.5 ${
                    decrypting 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500/70' 
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400/50 hover:scale-[1.02]'
                  }`}
                >
                  <Activity className={`w-3.5 h-3.5 ${decrypting ? 'animate-spin' : ''}`} />
                  {decrypting ? `CRUNCHING ${decryptionProgress}%` : 'DECRYPT SYSTEM SIGNATURE'}
                </button>
              </div>
            </div>

            {/* Progress Bar & Decrypted Payload */}
            {decrypting && (
              <div className="mt-3.5 space-y-1">
                <div className="flex justify-between font-mono text-[8px] text-slate-500">
                  <span>BRUTEFORCING HIGH-DENSITY VAULT MATRIX...</span>
                  <span>{decryptionProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden border border-white/5">
                  <div className="bg-amber-500 h-1 rounded-full transition-all duration-150" style={{ width: `${decryptionProgress}%` }}></div>
                </div>
              </div>
            )}

            {decryptedText && (
              <div className="mt-3.5 p-2 bg-amber-950/15 border border-amber-500/25 rounded-lg font-mono text-[9.5px] text-[#00f2ff] flex items-center gap-2 animate-fadeIn uppercase font-bold leading-none">
                <ShieldCheck className="w-4 h-4 text-[#00f2ff] shrink-0" />
                {decryptedText}
              </div>
            )}
          </div>

        </div>

        {/* Live Packet Sniffer & Socket Interceptor Panel (Right Side - 5/12) */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col h-full space-y-4">
          
          <div className="bg-[#030816]/70 border border-cyan-500/15 rounded-xl p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-3">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#00f2ff]" />
                  SYSNET RAW SOCKET PACKETS SNIFFER
                </span>
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
              </div>

              {/* Packet Sniffer Filter Buttons */}
              <div className="flex gap-1.5 mb-3">
                {(['ALL', 'SECURE_ONLY', 'THREATS'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveDpiFilter(f)}
                    className={`px-2 py-1 rounded text-[8px] font-mono font-black border uppercase tracking-wider transition-colors ${
                      activeDpiFilter === f 
                        ? 'bg-cyan-500/20 border-[#00f2ff]/40 text-[#00f2ff]' 
                        : 'bg-slate-950 border-white/5 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {(f || '').replace('_', ' ')}
                  </button>
                ))}
                
                <button
                  onClick={() => setPackets([])}
                  className="bg-slate-950 border border-white/5 hover:border-white/10 px-2 py-1 rounded text-[8px] font-mono font-black text-slate-500 hover:text-red-400 ml-auto flex items-center gap-0.5 uppercase tracking-wider"
                  title="Wipe Local Packet History"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  Clear
                </button>
              </div>

              {/* Packet List Viewport */}
              <div className="bg-slate-950 border border-white/5 rounded-lg p-3.5 h-[270px] overflow-y-auto font-mono text-[9px] space-y-2 mt-1">
                {filteredPackets.length === 0 ? (
                  <p className="text-center font-mono py-24 text-slate-600 italic">No packet transmissions caught in subnet filter.</p>
                ) : (
                  filteredPackets.map(p => (
                    <div 
                      key={p.id} 
                      className="border-b border-white/5 pb-2 text-left space-y-1 block hover:bg-white/[0.01] rounded pr-1"
                    >
                      <div className="flex items-center justify-between text-slate-500 text-[8px]">
                        <span className="text-cyan-400 font-bold">{p.id}</span>
                        <span className="text-[7.5px]">{(p.timestamp || '').replace('T', ' ').slice(11, 19)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-black">
                          {p.source}:{p.port} &rarr; <span className="text-slate-500">{p.destination}</span>
                        </span>
                        <span className={`px-1 py-0.1 border rounded text-[7.5px] font-extrabold ${
                          p.eventType === 'PANIC_SOS' 
                            ? 'bg-red-950 text-red-400 border-red-500/30 font-black animate-pulse' 
                            : p.eventType === 'ADMIN_OVERRIDE'
                              ? 'bg-purple-950 text-purple-400 border-purple-500/30'
                              : 'bg-[#002f4d]/80 text-[#00f2ff] border-cyan-500/20'
                        }`}>
                          {p.protocol} // {p.eventType}
                        </span>
                      </div>

                      <div className="bg-white/[0.02] px-1.5 py-0.5 rounded text-white text-[8.5px] leading-loose break-all font-mono opacity-85">
                        &gt; {p.payload}
                      </div>
                    </div>
                  ))
                )}
                <div ref={packetsEndRef} />
              </div>
            </div>

            {/* Custom test packet simulation injecting center */}
            <form onSubmit={handleInjectPacket} className="space-y-3 bg-white/[0.01] border border-white/5 rounded-xl p-3 mt-4 text-left">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block border-b border-white/5 pb-1">
                INJECT MANUAL TESTING SOCKET SOCKET
              </span>

              <div className="grid grid-cols-2 gap-3 text-[9px] font-mono">
                <div className="space-y-1">
                  <label className="text-slate-500 block">SOURCE IP ADDR</label>
                  <input
                    type="text"
                    value={customIp}
                    onChange={(e) => setCustomIp(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 border border-white/10 rounded px-2 py-1 focus:outline-none"
                    placeholder="e.g. 172.16.14.88"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">LISTENING PORT</label>
                  <input
                    type="number"
                    value={customPort}
                    onChange={(e) => setCustomPort(Number(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 border border-white/10 rounded px-2 py-1 focus:outline-none"
                    placeholder="e.g. 3000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[9px] font-mono">
                <div className="space-y-1">
                  <label className="text-slate-500 block">EVENT TYPE</label>
                  <select 
                    value={customType} 
                    onChange={(e) => setCustomType(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-200 border border-white/10 rounded px-2 py-1.5 focus:outline-none"
                  >
                    <option value="HANDSHAKE">HANDSHAKE</option>
                    <option value="DB_SYNC">DB_SYNC</option>
                    <option value="KEEPALIVE">KEEPALIVE</option>
                    <option value="PANIC_SOS">PANIC_SOS</option>
                    <option value="ADMIN_OVERRIDE">ADMIN_OVERRIDE</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 block">SIM PAYLOAD</label>
                  <input
                    type="text"
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 border border-white/10 rounded px-2 py-1 focus:outline-none"
                    placeholder="Payload info text"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#002f4d]/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 hover:text-white transition-all text-[9px] font-mono uppercase font-black py-2 rounded-md tracking-widest flex items-center justify-center gap-1 mt-1"
              >
                <Send className="w-3 h-3" />
                TRANSMIT TEST SOCKET TO LOCAL GATEWAY
              </button>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
