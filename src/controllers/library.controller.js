import * as LibraryModel from '../models/library.model.js';
import * as GameLogModel from '../models/gamelog.model.js';
import * as LogParticipantsModel from '../models/logParticipants.model.js';
import * as IGDBService from '../services/igdb.service.js';

export const getMyLibrary = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const libraryEntries = await LibraryModel.findByUserId(userId);

    if (libraryEntries.length === 0) {
      return res.json([]);
    }

    const gameIds = libraryEntries.map(entry => entry.igdb_game_id);
    const games = await IGDBService.getGamesByIds(gameIds);

    const library = libraryEntries.map(entry => {
      const game = games.find(g => g.id === entry.igdb_game_id);
      return {
        id: entry.id,
        added_at: entry.added_at,
        game: game || { id: entry.igdb_game_id, name: 'Unknown Game' }
      };
    });

    res.json(library);
  } catch (error) {
    console.error('Get my library error:', error);
    res.status(500).json({ message: 'Error fetching library' });
  }
};

export const getUserLibrary = async (req, res) => {
  try {
    const { userId } = req.params;
    const libraryEntries = await LibraryModel.findByUserId(userId);

    if (libraryEntries.length === 0) {
      return res.json([]);
    }

    const gameIds = libraryEntries.map(entry => entry.igdb_game_id);
    const games = await IGDBService.getGamesByIds(gameIds);

    const library = libraryEntries.map(entry => {
      const game = games.find(g => g.id === entry.igdb_game_id);
      return {
        id: entry.id,
        added_at: entry.added_at,
        game: game || { id: entry.igdb_game_id, name: 'Unknown Game' }
      };
    });

    res.json(library);
  } catch (error) {
    console.error('Get user library error:', error);
    res.status(500).json({ message: 'Error fetching library' });
  }
};

export const addGame = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { igdb_game_id } = req.body;

    if (!igdb_game_id) {
      return res.status(400).json({ message: 'igdb_game_id is required' });
    }

    const existing = await LibraryModel.findByUserAndGame(userId, igdb_game_id);
    if (existing) {
      return res.status(409).json({ message: 'Game already in library' });
    }

    const game = await IGDBService.getGameById(igdb_game_id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found on IGDB' });
    }

    const entry = await LibraryModel.create(userId, igdb_game_id);

    res.status(201).json({
      message: 'Game added to library',
      entry: {
        ...entry,
        game
      }
    });
  } catch (error) {
    console.error('Add game to library error:', error);
    res.status(500).json({ message: 'Error adding game to library' });
  }
};

export const removeGame = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { gameId } = req.params;

    const deleted = await LibraryModel.removeByUserAndGame(userId, parseInt(gameId));

    if (!deleted) {
      return res.status(404).json({ message: 'Game not found in library' });
    }

    await LogParticipantsModel.removeByUserAndGame(userId, parseInt(gameId));
    await GameLogModel.removeByUserAndGame(userId, parseInt(gameId));

    res.json({ message: 'Game removed from library' });
  } catch (error) {
    console.error('Remove game from library error:', error);
    res.status(500).json({ message: 'Error removing game from library' });
  }
};

export const countGameInLibraries = async (igdbGameId) => {
  try {
    const count = await LibraryModel.countByGame(igdbGameId);
    return count;
  } catch (error) {
    console.error('Count game in libraries error:', error);
    throw new Error('Error counting game in libraries');
  }
};

export const isGameInUserLibrary = async (userId, igdbGameId) => {
  try {
    const entry = await LibraryModel.findByUserAndGame(userId, igdbGameId);
    return !!entry;
  } catch (error) {
    console.error('Check game in library error:', error);
    throw new Error('Error checking game in library');
  }
};

export default { getMyLibrary, getUserLibrary, addGame, removeGame, countGameInLibraries, isGameInUserLibrary };