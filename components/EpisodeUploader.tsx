
import React, { useState, useRef } from 'react';
import { NewEpisodeData } from '../types';
import { UploadIcon, LoadingSpinner } from './IconComponents';

interface EpisodeUploaderProps {
  onEpisodeAdded: (episode: NewEpisodeData) => Promise<void>;
}

const EpisodeUploader: React.FC<EpisodeUploaderProps> = ({ onEpisodeAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 50 * 1024 * 1024) { // 50MB size limit
         setError("File is too large. Please upload files under 50MB.");
         setAudioFile(null);
         if (fileInputRef.current) {
            fileInputRef.current.value = '';
         }
      } else {
        setAudioFile(file);
        setError(null);
        // Show success message for file selection
        setSuccessMessage(`Audio file selected: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !audioFile) {
      setError('Please fill out all fields and select an audio file.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setUploadProgress(0);

    try {
      const newEpisode: NewEpisodeData = {
        title,
        description,
        audioFile,
      };

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev; // Stop at 90% to avoid getting stuck
          return prev + Math.random() * 5;
        });
      }, 200);

      await onEpisodeAdded(newEpisode);
      
      // Complete the progress
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      // Reset form
      setTitle('');
      setDescription('');
      setAudioFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setSuccessMessage('Episode saved successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        setUploadProgress(0);
      }, 4000);

    } catch (err: any) {
      console.error("Error creating episode:", err.message || String(err));
      const errorMessage = err.message || "An unknown error occurred.";
      
      // Check if we should retry
      if (retryCount < 2 && (errorMessage.includes('network') || errorMessage.includes('timeout'))) {
        setRetryCount(prev => prev + 1);
        setError(`Saving failed. Retrying... (${retryCount + 1}/2)`);
        
        // Retry after 2 seconds
        setTimeout(() => {
          setError(null);
          handleSubmit(e);
        }, 2000);
        return;
      }
      
      setError(`Failed to save episode. ${errorMessage}`);
      setUploadProgress(0);
      setRetryCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormInvalid = !title.trim() || !description.trim() || !audioFile || isLoading;

  return (
    <section className="bg-slate-800/50 rounded-xl p-6 shadow-2xl border border-slate-700 animate-fade-in-down">
      <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 w-fit">Add New Episode</h2>
      <p className="text-slate-400 text-sm mb-4">Episodes are saved locally and will be available on this device.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., The History of Podcasting"
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-white placeholder-slate-400"
          />
        </div>
         <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short summary of what the episode is about."
            rows={3}
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-white placeholder-slate-400"
          />
        </div>
        <div>
          <label htmlFor="audioFile" className="block text-sm font-medium text-slate-300 mb-1">Audio File (Max 50MB)</label>
          <input
            id="audioFile"
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/30"
          />
          <p className="text-slate-500 text-xs mt-1">Supported formats: MP3, WAV, M4A, OGG</p>
        </div>
        
        {isLoading && (
          <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
        
        {isLoading && uploadProgress > 80 && (
          <div className="text-blue-400 text-sm text-center mb-2">
            💾 Saving episode...
          </div>
        )}
        
        {isLoading && uploadProgress > 50 && uploadProgress <= 80 && (
          <div className="text-green-400 text-sm text-center mb-2">
            🎵 Processing audio file...
          </div>
        )}
        
        <button
          type="submit"
          disabled={isFormInvalid}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
        >
          {isLoading ? <LoadingSpinner /> : <UploadIcon />}
          {isLoading 
            ? `Saving... ${Math.round(uploadProgress)}%` 
            : 'Add Episode'}
        </button>
        {successMessage && <p className="text-green-400 mt-2 text-center text-sm">{successMessage}</p>}
        {error && <p className="text-red-400 mt-2 text-center text-sm">{error}</p>}
      </form>
    </section>
  );
};

export default EpisodeUploader;