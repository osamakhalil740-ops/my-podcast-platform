
import React from 'react';
import { Episode } from '../types';
import EpisodeItem from './EpisodeItem';
import { MicIcon } from './IconComponents';

interface EpisodeListProps {
  episodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
  currentEpisodeId?: string;
  isPlaying: boolean;
  emptyStateMessage?: React.ReactNode;
  onDeleteEpisode?: (episode: Episode) => void;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, onSelectEpisode, currentEpisodeId, isPlaying, emptyStateMessage, onDeleteEpisode }) => {
  if (episodes.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-slate-800/50 rounded-xl border border-dashed border-slate-700 flex flex-col items-center justify-center animate-fade-in-down">
        <MicIcon />
        {emptyStateMessage || (
           <>
            <h3 className="text-lg font-semibold text-slate-300 mt-4">No Episodes Yet</h3>
            <p className="text-slate-500 mt-1 max-w-xs">It looks like no episodes are available right now. Please check back later!</p>
          </>
        )}
      </div>
    );
  }

  return (
    <section className="animate-fade-in-down" style={{animationDelay: '150ms'}}>
      <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 w-fit">Episodes</h2>
      <div className="space-y-3">
        {episodes.map(episode => (
          <EpisodeItem 
            key={episode.id} 
            episode={episode} 
            onSelectEpisode={onSelectEpisode}
            isActive={episode.id === currentEpisodeId}
            isPlaying={isPlaying && episode.id === currentEpisodeId}
            onDeleteEpisode={onDeleteEpisode}
          />
        ))}
      </div>
    </section>
  );
};

export default EpisodeList;