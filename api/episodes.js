// Vercel API route for episodes
// This file should be in the api/ folder for Vercel

const episodes = [];

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Get all episodes
    res.status(200).json(episodes);
    return;
  }

  if (req.method === 'POST') {
    // Add new episode
    const episode = req.body;
    episodes.push(episode);
    res.status(201).json(episode);
    return;
  }

  if (req.method === 'DELETE') {
    // Delete episode
    const { id } = req.query;
    const index = episodes.findIndex(ep => ep.id === id);
    if (index !== -1) {
      episodes.splice(index, 1);
      res.status(200).json({ message: 'Episode deleted' });
    } else {
      res.status(404).json({ message: 'Episode not found' });
    }
    return;
  }

  res.status(405).json({ message: 'Method not allowed' });
}
