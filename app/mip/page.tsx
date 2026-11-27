'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  Shield,
  Zap,
  Mic,
  Lock,
  Download,
  Play,
  Pause,
  FileText,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  Copy,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import BraveEaglePromo from '@/components/BraveEaglePromo';
import { resolveAudioUrl } from '@/lib/audio/resolveAudioUrl';
import { safePlayWithRetry } from '@/lib/audio/safePlay';

export default function MipPage() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [mode, setMode] = useState<'hub' | 'rckls' | 'clover'>('hub');
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [activeTrack, setActiveTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
   const [audioError, setAudioError] = useState('');
  
   // GPME policy: MIP console is read-only for customization in-platform.
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // AUTH
  const checkPass = (e: FormEvent) => {
    e.preventDefault();
    if (passcode.toLowerCase() === 'gpmpro26') setAccessGranted(true);
    else alert('Access Denied.');
  };

  // FETCH
  const enterVault = async (targetMode: 'rckls' | 'clover') => {
    setMode(targetMode);
    const tagFilter = targetMode === 'rckls' ? 'energy,rock,sync' : 'acoustic,vocal,folk';
    const { data } = await supabase.from('tracks').select('*').or(`tags.ilike.%${tagFilter.split(',').join('%,tags.ilike.%')}%`).limit(20);
    if (data) setPlaylist(data);
  };

  // PLAY LOGIC (With Time Preservation for Mix Switch)
  const handlePlay = (track: any) => {
      setAudioError('');
    if (activeTrack?.id === track.id) {
      if (audioRef.current) {
            if (isPlaying) {
               audioRef.current.pause();
               setIsPlaying(false);
            } else {
               audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                  setIsPlaying(false);
                  setAudioError('Playback blocked or unavailable.');
               });
            }
      }
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
    }
  };

   // CUE-BOT helper (read-only utility)
  const copyMetadata = (track: any) => {
    const metaString = `${track.title} | Artist: ${track.artist || 'GPM'} | Composer: Michael Clay (ASCAP) | Publisher: G Putnam Music (ASCAP) | Split: 100% One-Stop`;
    navigator.clipboard.writeText(metaString);
    alert('METADATA COPIED FOR CUE SHEET:\n' + metaString);
  };

   const openCustomRequest = () => {
      window.location.href = '/kupid';
   };

  // --- VIEW 1: GATE ---
  if (!accessGranted) return (
      <main className="min-h-screen w-full bg-[#212121] text-white flex flex-col items-center justify-center p-4">
        <Shield size={64} className="text-[#FFD54F] mb-6" />
        <h1 className="text-3xl font-black uppercase tracking-widest mb-2">MIP Portal</h1>
        <p className="text-xs font-mono text-gray-500 mb-8">Wholesale & Sync Licensing Division</p>
        <form onSubmit={checkPass} className="flex flex-col gap-4 w-full max-w-xs">
           <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Enter Pro Code" className="bg-black/50 border border-gray-700 p-4 rounded-lg text-center text-white font-mono tracking-[0.5em] focus:outline-none focus:border-[#FFD54F]" />
           <button type="submit" className="bg-[#FFD54F] text-black font-black py-3 rounded-lg hover:scale-105 transition uppercase">Unlock Vault</button>
        </form>
      </main>
  );

  // --- VIEW 2: DASHBOARD ---
  return (
    <main className={`min-h-screen w-full transition-colors duration-500 ${mode === 'rckls' ? 'bg-[#b71c1c]' : mode === 'clover' ? 'bg-[#2E7D32]' : 'bg-[#212121]'} text-white pb-24`}>
         <BraveEaglePromo
            links={[
               { href: '/heroes', label: 'Back to Heroes' },
               { href: '/uru', label: 'URU Playlists' },
               { href: '/tt', label: 'TT Tale Tell' },
               { href: '/gift', label: 'Gift Support' },
            ]}
         />
      
      {/* NAV */}
      <nav className="p-4 bg-black/40 backdrop-blur-md flex justify-between items-center sticky top-0 z-50 border-b border-white/5">
         <div className="flex items-center gap-4">
            <span className="font-black text-xl tracking-tighter">GPM <span className="text-[#FFD54F]">MIP</span></span>
            {mode !== 'hub' && <button onClick={() => setMode('hub')} className="text-[10px] font-bold uppercase bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition">← Return to Hub</button>}
         </div>
         <div className="text-[10px] font-mono opacity-50 flex items-center gap-2">
            <CheckCircle size={10} className="text-green-500" /> Catalog Status: 100% PRE-CLEARED
         </div>
      </nav>

      {/* AUDIO ELEMENT */}
      {activeTrack && (
        <audio 
            ref={audioRef} 
                  src={resolveAudioUrl(activeTrack.public_url || activeTrack.url || '') || undefined} // In future: mixType === 'inst' ? activeTrack.inst_url : activeTrack.url
            onEnded={() => setIsPlaying(false)}
                  onError={() => {
                     setIsPlaying(false);
                     setAudioError('Track unavailable right now.');
                  }}
            autoPlay={isPlaying}
        />
      )}

      {/* HUB */}
      {mode === 'hub' && (
        <div className="container mx-auto px-4 h-[80vh] flex flex-col md:flex-row items-center justify-center gap-8">
           <div onClick={() => enterVault('rckls')} className="group w-full md:w-1/2 h-64 md:h-96 bg-black border border-red-900 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#b71c1c] transition duration-500 relative overflow-hidden">
              <Zap size={64} className="text-red-500 group-hover:text-white mb-4 transition" />
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">RCKLS</h2>
              <p className="text-xs font-bold opacity-50 uppercase tracking-widest mt-2">Sync • Sports • Action</p>
           </div>
           <div onClick={() => enterVault('clover')} className="group w-full md:w-1/2 h-64 md:h-96 bg-black border border-green-900 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#2E7D32] transition duration-500 relative overflow-hidden">
              <Mic size={64} className="text-green-500 group-hover:text-white mb-4 transition" />
              <h2 className="text-4xl font-black font-serif uppercase tracking-widest">VoiceClover</h2>
              <p className="text-xs font-bold opacity-50 uppercase tracking-widest mt-2">Acoustic • Drama • Vocal</p>
           </div>
        </div>
      )}

      {/* VAULT LIST */}
      {mode !== 'hub' && (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
           <div className="text-center mb-12">
              <h1 className="text-6xl font-black opacity-20 uppercase">{mode === 'rckls' ? 'High Voltage' : 'Pure Organic'}</h1>
              <p className="font-bold tracking-widest uppercase -mt-4">Pro Licensing Console</p>
              <p className="text-xs mt-3 text-[#FFD54F] font-semibold tracking-wide uppercase">
                GPME POLICY: In-platform customization is locked. Use premades here; submit external custom requests for MIP2 workflows.
              </p>
           </div>

           <div className="bg-black/60 rounded-3xl p-6 border border-white/10 backdrop-blur-lg shadow-2xl">
                     {audioError && (
                        <div className="mb-4 rounded-lg border border-red-400/40 bg-red-900/20 px-3 py-2 text-xs text-red-200 font-semibold">
                           {audioError}
                        </div>
                     )}
              {playlist.length === 0 ? <div className="text-center opacity-50 py-10">Initializing...</div> : (
                 <div className="space-y-1">
                    {/* HEADER */}
                    <div className="flex px-4 py-2 text-[10px] font-bold uppercase opacity-30 tracking-widest">
                        <div className="w-12">Play</div>
                        <div className="flex-1">Title / ID</div>
                        <div className="w-32 text-center">Policy</div>
                        <div className="w-32 text-center">Runner Tools</div>
                        <div className="w-24 text-right">Actions</div>
                    </div>

                    {/* TRACKS */}
                    {playlist.map((track) => (
                       <div key={track.id} className={`flex items-center justify-between p-3 rounded-xl transition border border-transparent ${activeTrack?.id === track.id ? 'bg-white/10 border-white/20' : 'hover:bg-white/5'}`}>
                          
                          {/* PLAY */}
                          <div className="w-12">
                             <button onClick={() => handlePlay(track)} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition">
                                {activeTrack?.id === track.id && isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="ml-1" />}
                             </button>
                          </div>

                          {/* INFO */}
                          <div className="flex-1 px-4">
                             <div className="font-bold text-lg leading-none flex items-center gap-2">
                                {track.title}
                                {activeTrack?.id === track.id && (
                                    <span className="text-[9px] bg-[#FFD54F] text-black px-1 rounded font-black uppercase">Now Playing</span>
                                )}
                             </div>
                             <div className="text-xs opacity-50 font-mono mt-1 flex items-center gap-2">
                                <span className="text-[#FFD54F]">●</span> 100% One-Stop
                                <span>|</span> ID: {track.id.split('-')[0]}
                             </div>
                          </div>

                          {/* POLICY: Customization locked in GPME */}
                          <div className="w-32 flex justify-center">
                             <span className="text-[10px] font-bold uppercase text-white/40">Premade</span>
                          </div>

                          {/* RUNNER TOOL: CUE BOT */}
                          <div className="w-32 flex justify-center">
                             <button onClick={() => copyMetadata(track)} className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/50 hover:text-white transition" title="Copy Metadata for Cue Sheet">
                                <FileText size={14} /> Copy Meta
                             </button>
                          </div>

                          {/* ACQUISITION */}
                          <div className="w-24 flex justify-end gap-2">
                             <button className="p-2 hover:bg-white/20 rounded-full transition" title="Download reference">
                                <Download size={16} />
                             </button>
                             <button onClick={openCustomRequest} className="p-2 bg-[#FFD54F] text-black rounded-full hover:scale-110 transition" title="Request external custom option">
                                <Lock size={16} />
                             </button>
                          </div>

                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      )}
    </main>
  );
}
