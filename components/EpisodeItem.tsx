
import React from 'react';
import { Episode } from '../types';
import { PlayIcon, PauseIcon, TrashIcon } from './IconComponents';

interface EpisodeItemProps {
  episode: Episode;
  onSelectEpisode: (episode: Episode) => void;
  isActive: boolean;
  isPlaying: boolean;
  onDeleteEpisode?: (episode: Episode) => void;
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({ episode, onSelectEpisode, isActive, isPlaying, onDeleteEpisode }) => {
  const baseClasses = "flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ease-in-out transform";
  const stateClasses = isActive 
    ? 'bg-slate-700/50 border-transparent ring-2 ring-indigo-500' 
    : 'bg-slate-800 border-slate-700 hover:bg-slate-700/50 hover:border-slate-600 hover:scale-[1.02]';

  return (
    <div className={`${baseClasses} ${stateClasses}`}>
      <button 
        onClick={() => onSelectEpisode(episode)}
        className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-lg text-slate-100 truncate">{episode.title}</h3>
        <p className="text-sm text-slate-400 line-clamp-2">{episode.description}</p>
      </div>
      {onDeleteEpisode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteEpisode(episode);
          }}
          className="flex-shrink-0 w-10 h-10 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-300 transition-colors"
          aria-label="Delete episode"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

export default EpisodeItem;