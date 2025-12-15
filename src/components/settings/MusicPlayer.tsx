'use client';

import React from 'react';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ForwardIcon,
  BackwardIcon,
  MusicalNoteIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils/cn';
import { useMusicPlayer } from '@/lib/providers/MusicPlayerProvider';
import { useMusicSettingsStore } from '@/lib/stores/useMusicSettingsStore';

type MusicPlayerCopy = {
  title: string;
  description: string;
  nowPlaying: string;
  volume: string;
  play: string;
  pause: string;
  next: string;
  previous: string;
  autoPlay?: string;
  autoPlayDescription?: string;
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function MusicPlayer({ copy }: { copy: MusicPlayerCopy }) {
  const {
    playlist,
    currentTrackIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    isMuted,
    isLoop,
    setCurrentTrackIndex,
    setIsPlaying,
    setVolume,
    setIsMuted,
    setIsLoop,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
  } = useMusicPlayer();

  const [previousVolume, setPreviousVolume] = React.useState(volume || 8);
  const [isRotating, setIsRotating] = React.useState(false);

  const { autoPlay, toggleAutoPlay } = useMusicSettingsStore();

  // Fallback nếu copy không có
  if (!copy) {
    return (
      <div className="text-sm text-slate-600 dark:text-white/70">
        Loading music player...
      </div>
    );
  }

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
      setVolume(previousVolume || volume || 8);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      setVolume(0);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSeek(parseFloat(e.target.value));
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleLoopToggle = () => {
    setIsRotating(true);
    setIsLoop(!isLoop);
    // Reset animation sau khi xoay xong
    setTimeout(() => setIsRotating(false), 500);
  };

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300/90">
          {copy.title}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {copy.description}
        </p>
      </div>

      {/* Auto Play Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white/50 p-3 dark:border-white/10 dark:bg-white/5">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {copy.autoPlay || 'Tự động phát nhạc'}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {copy.autoPlayDescription || 'Tự động phát nhạc khi vào trang'}
          </p>
        </div>
        <button
          onClick={toggleAutoPlay}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
            autoPlay
              ? 'bg-gradient-to-r from-red-500 to-green-600'
              : 'bg-slate-200 dark:bg-slate-700'
          )}
          role="switch"
          aria-checked={autoPlay}
          aria-label={copy.autoPlay || 'Tự động phát nhạc'}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              autoPlay ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Current Track Display */}
      <div className="relative overflow-hidden rounded-xl border border-red-200/50 bg-gradient-to-br from-red-50/80 via-green-50/60 to-yellow-50/80 p-4 shadow-lg backdrop-blur dark:border-red-500/30 dark:from-red-950/30 dark:via-green-950/20 dark:to-yellow-950/30">
        {/* Decorative Christmas elements */}
        <div className="pointer-events-none absolute -right-4 -top-4 text-6xl opacity-10">
          ❄️
        </div>
        <div className="pointer-events-none absolute -bottom-2 -left-2 text-4xl opacity-10">
          🎄
        </div>

        <div className="relative space-y-4">
          {/* Track Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-green-600 shadow-md">
              <MusicalNoteIcon className="h-8 w-8 text-white" />
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
                aria-label={copy.previous}
              >
                <BackwardIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="rounded-full bg-gradient-to-br from-red-500 to-green-600 p-3 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                aria-label={isPlaying ? copy.pause : copy.play}
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
                aria-label={copy.next}
              >
                <ForwardIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleLoopToggle}
                className={cn(
                  'rounded-full p-2 transition-colors',
                  isLoop
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
                aria-label="Lặp lại"
                title={isLoop ? 'Tắt lặp lại' : 'Bật lặp lại'}
              >
                <ArrowPathIcon
                  className={cn(
                    'h-5 w-5 transition-transform duration-500',
                    isRotating && 'rotate-180'
                  )}
                />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                className="rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label={copy.volume}
              >
                {isMuted || volume === 0 ? (
                  <SpeakerXMarkIcon className="h-5 w-5" />
                ) : (
                  <SpeakerWaveIcon className="h-5 w-5" />
                )}
              </button>
              <div className="flex w-24 items-center gap-2">
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
        </div>
      </div>

      {/* Playlist */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {copy.nowPlaying}
        </p>
        <div className="space-y-1.5">
          {playlist.map((track, index) => (
            <button
              key={track.id}
              onClick={() => handleTrackSelect(index)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all',
                index === currentTrackIndex
                  ? 'border-red-300 bg-gradient-to-r from-red-50 to-green-50 shadow-md dark:border-red-500/50 dark:from-red-950/20 dark:to-green-950/20'
                  : 'border-slate-200/70 bg-white/50 hover:border-red-200/70 hover:bg-red-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-red-500/30 dark:hover:bg-red-950/10'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  index === currentTrackIndex
                    ? 'bg-gradient-to-br from-red-500 to-green-600 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-red-100 group-hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-red-900/30 dark:group-hover:text-red-400'
                )}
              >
                {index === currentTrackIndex && isPlaying ? (
                  <PauseIcon className="h-5 w-5" />
                ) : (
                  <PlayIcon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'truncate text-sm font-medium',
                    index === currentTrackIndex
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-slate-900 dark:text-white'
                  )}
                >
                  {track.title}
                </p>
                <p className="truncate text-xs text-slate-600 dark:text-slate-400">
                  {track.artist}
                </p>
              </div>
              {track.duration && (
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  {formatTime(track.duration)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
