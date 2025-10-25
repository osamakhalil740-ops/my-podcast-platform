
import React, { useState, useCallback, useEffect } from 'react';
import { Episode, NewEpisodeData } from './types';
import Header from './components/Header';
import AudioPlayer from './components/AudioPlayer';
import AdminPage from './pages/AdminPage';
import ListenerPage from './pages/ListenerPage';
import LoginModal from './components/LoginModal';
import { getAllEpisodes, addEpisode, deleteEpisode } from './services/vercelStorage';

type View = 'listener' | 'admin';

const App: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<View>('listener');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load episodes from Firebase on mount
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const loadedEpisodes = await getAllEpisodes();
        setEpisodes(loadedEpisodes);
      } catch (error: any) {
        console.error("Failed to load episodes from Vercel storage.", error.message || String(error));
      } finally {
        setIsLoading(false);
      }
    };
    fetchEpisodes();
  }, []);

  const handleEpisodeAdded = useCallback(async (newEpisodeData: NewEpisodeData) => {
    try {
      console.log("Starting episode upload process...");
      await addEpisode(newEpisodeData);
      console.log("Episode uploaded successfully, refreshing list...");
      
      // Refresh the list from the server to get the latest data
      const loadedEpisodes = await getAllEpisodes();
      setEpisodes(loadedEpisodes);
      console.log("Episode list refreshed successfully");
    } catch (error: any) {
      console.error("Failed to add episode", error.message || String(error));
      
      // Provide more specific error handling
      if (error.message.includes('timeout')) {
        throw new Error("Upload timed out. Please try again with a smaller file.");
      } else if (error.message.includes('network')) {
        throw new Error("Network error. Please check your internet connection.");
      } else if (error.message.includes('Failed to read audio file')) {
        throw new Error("Failed to process audio file. Please try a different file.");
      } else {
        throw error; // Re-throw to be caught in the uploader component
      }
    }
  }, []);

  const handleDeleteEpisode = useCallback(async (episode: Episode) => {
    if (!window.confirm("Are you sure you want to delete this episode? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteEpisode(episode);
      setEpisodes(prev => prev.filter(ep => ep.id !== episode.id));
      
      if (currentEpisode?.id === episode.id) {
        setCurrentEpisode(null);
        setIsPlaying(false);
      }
    } catch (error: any) {
      console.error("Failed to delete episode", error.message || String(error));
    }
  }, [currentEpisode]);


  const handleSelectEpisode = useCallback((episode: Episode) => {
    if (currentEpisode?.id === episode.id) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
    }
  }, [currentEpisode]);

  const handlePlayPause = useCallback(() => {
    if (currentEpisode) {
      setIsPlaying(prev => !prev);
    }
  }, [currentEpisode]);

  const handleEnded = useCallback(() => {
    const currentIndex = episodes.findIndex(ep => ep.id === currentEpisode?.id);
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      handleSelectEpisode(episodes[currentIndex + 1]);
    } else {
      setIsPlaying(false);
    }
  }, [episodes, currentEpisode, handleSelectEpisode]);
  
  const handleNavigate = (selectedView: View) => {
    if (selectedView === 'listener') {
      setView('listener');
    } else {
      if (isAdminAuthenticated) {
        setView('admin');
      } else {
        setIsLoginModalOpen(true);
      }
    }
  };
  
  const handleLoginAttempt = (password: string): boolean => {
    if (password === 'admin2024') {
        setIsAdminAuthenticated(true);
        setView('admin');
        setIsLoginModalOpen(false);
        return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setView('listener');
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-10">Loading episodes...</div>;
    }
    if (view === 'listener') {
      return (
        <ListenerPage
          episodes={episodes}
          onSelectEpisode={handleSelectEpisode}
          currentEpisodeId={currentEpisode?.id}
          isPlaying={isPlaying}
        />
      );
    }
    if (view === 'admin' && isAdminAuthenticated) {
      return (
        <AdminPage
          episodes={episodes}
          onEpisodeAdded={handleEpisodeAdded}
          onSelectEpisode={handleSelectEpisode}
          onDeleteEpisode={handleDeleteEpisode}
          currentEpisodeId={currentEpisode?.id}
          isPlaying={isPlaying}
        />
      );
    }
    // Fallback or if view is admin but not authenticated (should not happen with current logic)
    return null;
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <Header 
        currentView={view} 
        onNavigate={handleNavigate} 
        isAdminAuthenticated={isAdminAuthenticated}
        onLogout={handleLogout}
      />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 max-w-5xl w-full">
        <div className="pb-32">
          {renderContent()}
        </div>
      </main>
      {currentEpisode && (
        <AudioPlayer 
          episode={currentEpisode}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onEnded={handleEnded}
        />
      )}
      {isLoginModalOpen && (
        <LoginModal 
            onClose={() => setIsLoginModalOpen(false)}
            onLoginAttempt={handleLoginAttempt}
        />
      )}
    </div>
  );
};

export default App;