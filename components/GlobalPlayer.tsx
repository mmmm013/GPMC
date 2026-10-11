'use client';

import { useState, useEffect, useRef , type ChangeEvent } from 'react';
import { Pause, Play, AlertCircle, Radio, Volume2, VolumeX } from 'lucide-react';
import { gpmET } from '@/lib/gpm-et';
import { resolveAudioUrl } from '@/lib/audio/resolveAudioUrl';
import { safePlay } from '@/lib/audio/safePlay';
import { AUDIO_UI_MESSAGES } from '@/lib/audio/messages';

/**
 * GLOBAL PLAYER - BIC MC BOT Streaming Player
 * DEPENDABILITY: Proper audio lifecycle, no leaked resources
 * QUALITY: Error handling with user-friendly messages
 * SATISFACTION: Smooth play/pause, loading states, mood colors, VOLUME control
 * SINGLE-SONG: Dispatches 'stop-all-audio' so only ONE player plays at a time
 * GPM ET: Tracks play, pause, duration, and error events
 */

export default function GlobalPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [track, setTrack] = useState({
    title: "Pick an Activity",
    vocalist: "Tap Play to hear every song",
    url: "",
    moodColor: "#8B4513"
  });
  const [pendingPlay, setPendingPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playStartRef = useRef<number>(0);

  // Keep volume in sync with audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Listen for track selection events from other components
  useEffect(() => {
    const handleTrackSelect = (e: CustomEvent) => {
      setError('');
      setIsLoading(true);
      setIsPlaying(false);
      setPendingPlay(true);

      // GPM ET: track duration of previous track before switching
      if (audioRef.current && playStartRef.current > 0) {
        const elapsed = (Date.now() - playStartRef.current) / 1000;
        if (elapsed > 1) {
          gpmET.duration({
            title: track.title,
            vocalist: track.vocalist,
            source: 'GlobalPlayer',
            seconds: elapsed,
          });
        }
        playStartRef.current = 0;
      }

      // Pause current audio immediately for clean transition
      if (audioRef.current) {
        audioRef.current.pause();
      }

      let safeArtist = e.detail.vocalist || "G Putnam Music";
      if (safeArtist.toLowerCase().includes("mayker")) {
        safeArtist = "G Putnam Music";
      }

      setTrack({
        title: e.detail.title || "Unknown Track",
        vocalist: safeArtist,
        url: e.detail.url,
        moodColor: e.detail.moodTheme?.primary || "#8B4513"
      });
    };

    // Listen for stop-all-audio from FeaturedPlaylists
    const handleStopAll = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    };

    window.addEventListener('play-track', handleTrackSelect as EventListener);
    window.addEventListener('fp-play', handleStopAll);

    // MC-BOT: When FeaturedPlaylists (or any stream) signals ready, update idle label
    const handleStreamReady = (e: CustomEvent) => {
      setTrack((prev) => {
        if (prev.url) return prev; // already playing — don't overwrite
        return {
          ...prev,
          title: 'Stream Ready',
          vocalist: `${e.detail?.totalTracks ?? ''} tracks loaded · Tap any activity`.trim(),
        };
      });
    };
    window.addEventListener('fp-stream-ready', handleStreamReady as EventListener);

    return () => {
      window.removeEventListener('play-track', handleTrackSelect as EventListener);
      window.removeEventListener('fp-play', handleStopAll);
      window.removeEventListener('fp-stream-ready', handleStreamReady as EventListener);
      // DEPENDABILITY: Cleanup audio on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Handle audio loading and playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track.url) return;

    const resolvedUrl = resolveAudioUrl(track.url);

    const handleCanPlay = () => {
      setIsLoading(false);
      if (pendingPlay) {
        setPendingPlay(false);
        // SINGLE-SONG: Stop all other audio before we play
        window.dispatchEvent(new CustomEvent('stop-all-audio', { detail: { source: 'global' } }));
        audio.volume = isMuted ? 0 : volume;
        safePlay(audio, 'GlobalPlayer', { track: track.title, url: resolvedUrl })
          .then((result) => {
            if (!result.ok) {
              setError(AUDIO_UI_MESSAGES.playbackBlocked);
              setIsPlaying(false);
              return;
            }
            setIsPlaying(true);
            // GPM ET: track play start
            playStartRef.current = Date.now();
            gpmET.play({
              title: track.title,
              vocalist: track.vocalist,
              source: 'GlobalPlayer',
            });
          });
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setPendingPlay(false);
      const mediaErr = audio.error;
      let errMsg = 'Playback error';
      if (mediaErr) {
        switch (mediaErr.code) {
          case 1: errMsg = 'Playback cancelled'; break;
          case 2: errMsg = 'Network error - check connection'; break;
          case 3: errMsg = 'Audio decode error'; break;
          case 4: errMsg = AUDIO_UI_MESSAGES.trackUnavailable; break;
          default: errMsg = 'Playback error';
        }
        setError(errMsg);
      }
      gpmET.error({
        title: track.title,
        vocalist: track.vocalist,
        source: 'GlobalPlayer',
        errorMsg: errMsg,
      });
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleEnded = () => {
      setIsPlaying(false);
      // GPM ET: track duration on natural end
      if (playStartRef.current > 0) {
        const elapsed = (Date.now() - playStartRef.current) / 1000;
        gpmET.duration({
          title: track.title,
          vocalist: track.vocalist,
          source: 'GlobalPlayer',
          seconds: elapsed,
        });
        playStartRef.current = 0;
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('ended', handleEnded);

    // DEPENDABILITY: Set resolved URL and load
    audio.src = resolvedUrl;
    audio.load();

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track.url, pendingPlay]);

  // Handle manual play/pause toggle
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track.url) return;

    if (isPlaying) {
      audio.volume = isMuted ? 0 : volume;
      safePlay(audio, 'GlobalPlayer', { track: track.title, url: track.url }).then((result) => {
        if (!result.ok) {
          setError(AUDIO_UI_MESSAGES.playbackBlocked);
          setIsPlaying(false);
        }
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Listen for stop-all-audio from other players
  useEffect(() => {
    const handleStopAll = (e: CustomEvent) => {
      // Don't stop ourselves
      if (e.detail?.source === 'global') return;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    };
    window.addEventListener('stop-all-audio', handleStopAll as EventListener);
    return () => {
      window.removeEventListener('stop-all-audio', handleStopAll as EventListener);
    };
  }, []);

  const togglePlay = () => {
    /* Nothing chosen on this page: Play goes where every song plays
       (GD, 2026-10-11, "do A" -- no dead Play buttons). */
    if (!track.url) {
      window.location.href = '/listen';
      return;
    }
    setError('');

    if (!isPlaying) {
      // SINGLE-SONG: Stop all other audio before we play
      window.dispatchEvent(new CustomEvent('stop-all-audio', { detail: { source: 'global' } }));
      playStartRef.current = Date.now();
      gpmET.play({
        title: track.title,
        vocalist: track.vocalist,
        source: 'GlobalPlayer',
      });
    } else {
      // GPM ET: track pause
      gpmET.pause({
        title: track.title,
        vocalist: track.vocalist,
        source: 'GlobalPlayer',
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const hasTrack = track.url !== '';
  const activeColor = track.moodColor === "#8B4513" ? "#C8A882" : track.moodColor;

  return (
    <div className="w-full" role="region" aria-label="MC BOT Streaming Player">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-900/40 border border-red-500/30 rounded-t-xl">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {/* MC BOT Player Bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
        style={{
          background: `linear-gradient(135deg, ${activeColor}15 0%, #1a0f00 100%)`,
          borderColor: `${activeColor}30`
        }}
      >
        {/* MC BOT Identity Block */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          {(isPlaying || isLoading) && (
            <Radio className="w-4 h-4 animate-pulse" style={{ color: activeColor }} />
          )}
          <div>
            <span className="text-[10px] font-bold tracking-widest" style={{ color: activeColor }}>MC BOT</span>
            <span className="text-[9px] text-neutral-500 block">
              {isPlaying ? 'NOW STREAMING' : isLoading ? 'LOADING' : 'READY'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-neutral-700/50 flex-shrink-0" />

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
          <p className="text-xs text-neutral-400 truncate">{track.vocalist}</p>
          {isLoading && (
            <p className="text-[10px] text-neutral-500 animate-pulse">Loading audio...</p>
          )}
        </div>

        {/* Volume Control */}
        {hasTrack && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={toggleMute}
              className="p-1 rounded-full hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-neutral-400" />
              ) : (
                <Volume2 className="w-4 h-4" style={{ color: activeColor }} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${activeColor} ${(isMuted ? 0 : volume) * 100}%, #555 ${(isMuted ? 0 : volume) * 100}%)`
              }}
              aria-label="Volume"
            />
          </div>
        )}

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={!hasTrack || isLoading}
          className="p-2 rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{
            background: hasTrack ? activeColor : '#555',
            opacity: isLoading ? 0.5 : 1
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 text-white" fill="white" />
          ) : (
            <Play className="w-5 h-5 text-white" fill="white" />
          )}
        </button>
      </div>

      {/* Hidden audio element - DEPENDABILITY: preload none for mobile Safari */}
      <audio ref={audioRef} preload="none" />
    </div>
  );
}
