import * as IGDBService from '../services/igdb.service.js';
import * as LibraryModel from '../models/library.model.js';
import * as GameLogModel from '../models/gamelog.model.js';

export const search = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query (q) is required' });
    }

    const games = await IGDBService.searchGames(q, parseInt(limit) || 20);
    res.json(games);
  } catch (error) {
    console.error('Search games error:', error);
    res.status(500).json({ message: 'Error searching games' });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await IGDBService.getGameById(parseInt(id));

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const libraryCount = await LibraryModel.countByGame(parseInt(id));
    const logCount = await GameLogModel.countByGame(parseInt(id));

    res.json({
      ...game,
      library_count: libraryCount,
      log_count: logCount
    });
  } catch (error) {
    console.error('Get game by id error:', error);
    res.status(500).json({ message: 'Error fetching game' });
  }
};

export const getGenres = async (req, res) => {
  try {
    const genres = await IGDBService.getGenres();
    res.json(genres);
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({ message: 'Error fetching genres' });
  }
};

export const getByGenre = async (req, res) => {
  try {
    const { genreId } = req.params;
    const { limit, offset } = req.query;

    const games = await IGDBService.getGamesByGenre(
      parseInt(genreId),
      parseInt(limit) || 20,
      parseInt(offset) || 0
    );
    res.json(games);
  } catch (error) {
    console.error('Get games by genre error:', error);
    res.status(500).json({ message: 'Error fetching games by genre' });
  }
};

export const getPopular = async (req, res) => {
  try {
    const { limit } = req.query;
    const games = await IGDBService.getPopularGames(parseInt(limit) || 20);
    res.json(games);
  } catch (error) {
    console.error('Get popular games error:', error);
    res.status(500).json({ message: 'Error fetching popular games' });
  }
};

export const getTrending = async (req, res) => {
  try {
    const { limit } = req.query;
    const games = await IGDBService.getTrendingGames(parseInt(limit) || 20);
    res.json(games);
  } catch (error) {
    console.error('Get trending games error:', error);
    res.status(500).json({ message: 'Error fetching trending games' });
  }
};

export const getUpcoming = async (req, res) => {
  try {
    const { limit } = req.query;
    const games = await IGDBService.getUpcomingGames(parseInt(limit) || 20);
    res.json(games);
  } catch (error) {
    console.error('Get upcoming games error:', error);
    res.status(500).json({ message: 'Error fetching upcoming games' });
  }
};

export default {
  search,
  getById,
  getGenres,
  getByGenre,
  getPopular,
  getTrending,
  getUpcoming
};
