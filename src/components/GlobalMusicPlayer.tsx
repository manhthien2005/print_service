'use client';

import React, { useState } from 'react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ForwardIcon,
  BackwardIcon,
  MusicalNoteIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useMusicPlayer } from '@/lib/providers/MusicPlayerProvider';
import { cn } from '@/lib/utils/cn';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function GlobalMusicPlayer() {
  const {
    playlist,
    currentTrackIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    isMuted,
    setVolume,
    setIsMuted,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
  } = useMusicPlayer();

  const [isExpanded, setIsExpanded] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(50);

  const currentTrack = playlist[currentTrackIndex];

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    setPreviousVolume(newVolume);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(previousVolume || 50);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSeek(parseFloat(e.target.value));
  };

  if (!currentTrack) return null;

  return (
    <>
      {/* Mini Player - Floating Button */}
      <div
        className={cn(
          'fixed bottom-20 right-6 z-50 transition-all duration-300',
          isExpanded ? 'w-80' : 'w-16'
        )}
      >
        <div
          className={cn(
            'rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300',
            'border-red-200/50 bg-gradient-to-br from-red-50/95 via-green-50/90 to-yellow-50/95',
            'dark:border-red-500/30 dark:from-red-950/80 dark:via-green-950/70 dark:to-yellow-950/80',
            isExpanded ? 'p-4' : 'p-3'
          )}
        >
          {!isExpanded ? (
            // Collapsed - Mini Button
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-green-600 p-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label="Mở nhạc nền"
            >
              <MusicalNoteIcon className="h-6 w-6" />
              {isPlaying && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                </span>
              )}
            </button>
          ) : (
            // Expanded - Full Player
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-green-600">
                    <MusicalNoteIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {currentTrack.title}
                    </p>
                    <p className="truncate text-xs text-slate-600 dark:text-slate-400">
                      {currentTrack.artist}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Thu gọn"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeekChange}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-slate-700"
                  style={{
                    background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${
                      (currentTime / duration) * 100
                    }%, rgb(226 232 240) ${
                      (currentTime / duration) * 100
                    }%, rgb(226 232 240) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || 0)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    className="rounded-full p-2 text-slate-700 transition-colors hover:bg-red-100 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    aria-label="Bài trước"
                  >
                    <BackwardIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="rounded-full bg-gradient-to-br from-red-500 to-green-600 p-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                    aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-6 w-6" />
                    ) : (
                      <PlayIcon className="h-6 w-6" />
                    )}
                  </button>
                  <button
                    onClick={handleNext}
                    className="rounded-full p-2 text-slate-700 transition-colors hover:bg-green-100 hover:text-green-600 dark:text-slate-300 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                    aria-label="Bài tiếp"
                  >
                    <ForwardIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMuteToggle}
                    className="rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    aria-label="Âm lượng"
                  >
                    {isMuted || volume === 0 ? (
                      <SpeakerXMarkIcon className="h-5 w-5" />
                    ) : (
                      <SpeakerWaveIcon className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex w-20 items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-slate-700"
                      style={{
                        background: `linear-gradient(to right, #16a34a 0%, #16a34a ${volume}%, rgb(226 232 240) ${volume}%, rgb(226 232 240) 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Playlist Indicator */}
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentTrackIndex + 1} / {playlist.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
