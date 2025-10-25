
import React from 'react';
import { Episode, NewEpisodeData } from '../types';
import EpisodeList from '../components/EpisodeList';
import EpisodeUploader from '../components/EpisodeUploader';

interface AdminPageProps {
  onEpisodeAdded: (episode: NewEpisodeData) => Promise<void>;
  episodes: Episode[];
  onSelectEpisode: (episode: Episode) => void;
  onDeleteEpisode: (episode: Episode) => void;
  currentEpisodeId?: string;
  isPlaying: boolean;
}

const AdminPage: React.FC<AdminPageProps> = ({ onEpisodeAdded, episodes, onSelectEpisode, onDeleteEpisode, currentEpisodeId, isPlaying }) => {
  return (
    <div className="space-y-8">
      <div className="animate-fade-in-down">
        <h2 className="text-3xl font-bold">Podcast Management</h2>
        <p className="text-slate-400 mt-1">Add, view, and delete your episodes from this dashboard.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-1">
          {/* Sticky container for the uploader */}
          <div className="sticky top-24">
            <EpisodeUploader onEpisodeAdded={onEpisodeAdded} />
          </div>
        </div>
        <div className="lg:col-span-2 mt-8 lg:mt-0">
          <EpisodeList
            episodes={episodes}
            onSelectEpisode={onSelectEpisode}
            onDeleteEpisode={onDeleteEpisode}
            currentEpisodeId={currentEpisodeId}
            isPlaying={isPlaying}
            emptyStateMessage={(
              <>
                <h3 className="text-lg font-semibold text-slate-300 mt-4">Upload Your First Episode</h3>
                <p className="text-slate-500 mt-1 max-w-xs">Use the form on the left to add a new episode to your podcast.</p>
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;