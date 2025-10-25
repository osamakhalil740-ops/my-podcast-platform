import React, { useRef, useEffect, useState } from 'react';
import { Episode } from '../types';
import { PlayIcon, PauseIcon, MusicNoteIcon } from './IconComponents';

interface AudioPlayerProps {
  episode: Episode;
  isPlaying: boolean;
  onPlayPause: () => void;
  onEnded: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ episode, isPlaying, onPlayPause, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Effect to handle source changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audio.src !== episode.audioUrl) {
      audio.src = episode.audioUrl;
      setProgress(0);
      setDuration(0);
      setIsLoaded(false); // We need to wait for metadata again
      audio.load();
    }
  }, [episode.audioUrl]);

  // Effect to handle play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && isLoaded) { // Only play if audio is ready
      audio.play().catch((error: any) => {
        if (error.name !== 'AbortError') {
          console.error("Error playing audio:", error.message || String(error));
        }
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, isLoaded]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true); // Signal that the audio is ready to be played
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setProgress(audioRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;
  
  const progressBarStyle = {
    background: `linear-gradient(to right, #818cf8 ${progressPercentage}%, #475569 ${progressPercentage}%)`
  };


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/70 backdrop-blur-lg z-20 animate-slide-in-up">
      <div className="h-1 w-full bg-slate-600">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" style={{width: `${progressPercentage}%`}}></div>
      </div>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onEnded}
        preload="metadata"
        src={episode.audioUrl} // Set src directly to ensure it's loaded
      />
      <div className="container mx-auto px-4 py-3 md:px-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-slate-700 rounded-md flex items-center justify-center text-slate-400">
              <MusicNoteIcon />
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="font-bold truncate text-slate-100">{episode.title}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>{formatTime(progress)}</span>
              <input
                type="range"
                value={progress}
                max={duration || 1}
                step="0.1"
                onChange={handleSeek}
                className="styled-slider w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                style={progressBarStyle}
                disabled={!isLoaded}
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <button
            onClick={onPlayPause}
            className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
            aria-label={isPlaying ? "Pause" : "Play"}
            disabled={!isLoaded}
          >
            {isPlaying ? <PauseIcon size="8"/> : <PlayIcon size="8"/>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;