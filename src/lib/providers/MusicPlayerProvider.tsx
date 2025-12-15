'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { usePathname } from 'next/navigation';
import { useMusicSettingsStore } from '@/lib/stores/useMusicSettingsStore';

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: number;
}

interface MusicPlayerContextType {
  // State
  playlist: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  isLoop: boolean;

  // Actions
  setPlaylist: (playlist: Track[]) => void;
  setCurrentTrackIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  setIsLoop: (loop: boolean) => void;
  handlePlayPause: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleSeek: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(
  undefined
);

// Default playlist
const defaultPlaylist: Track[] = [
  {
    id: '1',
    title: 'All I Want for Christmas Is You',
    artist: 'Christmas Classics',
    url: '/mp3/all_i_want.mp3',
    duration: 240,
  },
  {
    id: '2',
    title: 'Feliz Navidad',
    artist: 'Holiday Collection',
    url: '/mp3/feliz_navidad.mp3',
    duration: 180,
  },
  {
    id: '3',
    title: 'Jingle Bell Rock',
    artist: 'Christmas Classics',
    url: '/mp3/jingle_bell.mp3',
    duration: 120,
  },
];

export function MusicPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMusicEnabledRoute = useMemo(() => {
    if (!pathname) return false;
    return pathname.includes('/student') || pathname.includes('/staff');
  }, [pathname]);

  const { autoPlay } = useMusicSettingsStore();
  const [playlist, setPlaylist] = useState<Track[]>(defaultPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('music-volume');
      if (saved) {
        const parsed = Number(saved);
        if (Number.isFinite(parsed)) {
          return Math.min(100, Math.max(0, parsed));
        }
      }
      return 8; // Mặc định 8% cho nhạc nền
    }
    return 8; // Mặc định 8% cho nhạc nền
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('music-loop');
      return saved === 'true';
    }
    return false;
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = playlist[currentTrackIndex];

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
    setCurrentTime(0);
    setIsPlaying(true);
  }, [playlist.length]);

  const handlePrevious = useCallback(() => {
    setCurrentTrackIndex(
      prev => (prev - 1 + playlist.length) % playlist.length
    );
    setCurrentTime(0);
    setIsPlaying(true);
  }, [playlist.length]);

  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Xử lý khi bài hát kết thúc
  const handleEnded = useCallback(() => {
    if (isLoop) {
      // Nếu loop, restart bài hiện tại
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      }
    } else {
      // Nếu không loop, chuyển bài tiếp
      handleNext();
    }
  }, [isLoop, handleNext]);

  // Cập nhật thời gian phát
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, handleEnded]);

  // Xử lý play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Không phát nhạc ở các route ngoài student/staff
    if (!isMusicEnabledRoute) {
      audio.pause();
      if (isPlaying) {
        setIsPlaying(false);
      }
      return;
    }

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrackIndex, isMusicEnabledRoute]);

  // Cập nhật volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume / 100;

    // Lưu volume vào localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('music-volume', volume.toString());
    }
  }, [volume, isMuted, isMusicEnabledRoute]);

  // Đồng bộ mute với giá trị volume (khi reload với volume = 0)
  useEffect(() => {
    if (volume === 0 && !isMuted) {
      setIsMuted(true);
    }
    if (volume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [volume, isMuted]);

  // Cập nhật loop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = isLoop;

    // Lưu loop vào localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('music-loop', isLoop.toString());
    }
  }, [isLoop]);

  // Lưu trạng thái phát vào localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('music-playing', isPlaying.toString());
      localStorage.setItem('music-track-index', currentTrackIndex.toString());
    }
  }, [isPlaying, currentTrackIndex]);

  // Khôi phục trạng thái khi load và tự động phát nếu autoPlay được bật
  const autoPlayAttemptedRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = audioRef.current;
    if (!audio) return;

    // Chỉ auto play ở các trang student/staff
    if (!isMusicEnabledRoute) {
      autoPlayAttemptedRef.current = false;
      return;
    }

    const savedPlaying = localStorage.getItem('music-playing');
    const savedIndex = localStorage.getItem('music-track-index');

    if (savedIndex) {
      const index = parseInt(savedIndex, 10);
      if (index >= 0 && index < playlist.length) {
        setCurrentTrackIndex(index);
      }
    }

    const tryAutoPlay = async () => {
      if (!autoPlay && savedPlaying !== 'true') {
        autoPlayAttemptedRef.current = false;
        return;
      }

      // Tránh lặp lại nhiều lần
      if (autoPlayAttemptedRef.current) return;
      autoPlayAttemptedRef.current = true;

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        // Nếu bị chặn autoplay, thử bật mute rồi play
        if (!audio.muted) {
          audio.muted = true;
          setIsMuted(true);
          try {
            await audio.play();
            setIsPlaying(true);
          } catch {
            // Nếu vẫn thất bại, giữ trạng thái không playing
            setIsPlaying(false);
          }
        }
      }
    };

    void tryAutoPlay();
  }, [playlist.length, autoPlay, isMusicEnabledRoute]);

  const value: MusicPlayerContextType = {
    playlist,
    currentTrackIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    isMuted,
    isLoop,
    setPlaylist,
    setCurrentTrackIndex,
    setIsPlaying,
    setVolume,
    setIsMuted,
    setIsLoop,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    audioRef,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        preload="metadata"
        loop={isLoop}
      />
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}
