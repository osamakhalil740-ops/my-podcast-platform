import React from 'react';
import { Episode } from '../types';
import EpisodeList from '../components/EpisodeList';

interface ListenerPageProps {
  episodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
  currentEpisodeId?: string;
  isPlaying: boolean;
}

const ListenerPage: React.FC<ListenerPageProps> = ({ episodes, onSelectEpisode, currentEpisodeId, isPlaying }) => {
  return (
    <>
      <div className="text-center mb-8 animate-fade-in-down">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            Welcome to the Podcast
          </h2>
          <p className="text-slate-400 mt-2">Browse and enjoy our latest episodes below.</p>
      </div>
      <EpisodeList 
        episodes={episodes} 
        onSelectEpisode={onSelectEpisode}
        currentEpisodeId={currentEpisodeId}
        isPlaying={isPlaying}
        emptyStateMessage={(
            <>
                <h3 className="text-lg font-semibold text-slate-300 mt-4">No Episodes Yet</h3>
                <p className="text-slate-500 mt-1 max-w-xs">It looks like there are no episodes available right now. Please check back later!</p>
            </>
        )}
      />
    </>
  );
};

export default ListenerPage;