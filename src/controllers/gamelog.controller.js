import * as GameLogModel from '../models/gamelog.model.js';
import * as LogParticipantsModel from '../models/logParticipants.model.js';
import * as LibraryModel from '../models/library.model.js';
import * as FriendsModel from '../models/friends.model.js';
import * as IGDBService from '../services/igdb.service.js';

export const getMyLogs = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const logs = await GameLogModel.findByUserId(userId);

    if (logs.length === 0) {
      return res.json([]);
    }

    const gameIds = [...new Set(logs.map(log => log.igdb_game_id))];
    const games = await IGDBService.getGamesByIds(gameIds);

    const logsWithGames = await Promise.all(logs.map(async (log) => {
      const game = games.find(g => g.id === log.igdb_game_id);
      const participants = await LogParticipantsModel.findByLogId(log.id_log);
      return {
        ...log,
        game: game || { id: log.igdb_game_id, name: 'Unknown Game' },
        participants
      };
    }));

    res.json(logsWithGames);
  } catch (error) {
    console.error('Get my logs error:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

export const getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await GameLogModel.findByUserId(userId);

    if (logs.length === 0) {
      return res.json([]);
    }

    const gameIds = [...new Set(logs.map(log => log.igdb_game_id))];
    const games = await IGDBService.getGamesByIds(gameIds);

    const logsWithGames = await Promise.all(logs.map(async (log) => {
      const game = games.find(g => g.id === log.igdb_game_id);
      const participants = await LogParticipantsModel.findByLogId(log.id_log);
      return {
        ...log,
        game: game || { id: log.igdb_game_id, name: 'Unknown Game' },
        participants: participants.filter(p => p.status === 'accepted')
      };
    }));

    res.json(logsWithGames);
  } catch (error) {
    console.error('Get user logs error:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

export const getGameLogs = async (req, res) => {
  try {
    const { gameId } = req.params;
    const logs = await GameLogModel.findByGameId(parseInt(gameId));
    res.json(logs);
  } catch (error) {
    console.error('Get game logs error:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

export const getPendingParticipations = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const pending = await LogParticipantsModel.findPendingByUserId(userId);

    if (pending.length === 0) {
      return res.json([]);
    }

    const gameIds = [...new Set(pending.map(p => p.igdb_game_id))];
    const games = await IGDBService.getGamesByIds(gameIds);

    const pendingWithGames = pending.map(p => ({
      ...p,
      game: games.find(g => g.id === p.igdb_game_id) || { id: p.igdb_game_id, name: 'Unknown Game' }
    }));

    res.json(pendingWithGames);
  } catch (error) {
    console.error('Get pending participations error:', error);
    res.status(500).json({ message: 'Error fetching pending participations' });
  }
};

export const create = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { igdb_game_id, play_date, hours, comment, participant_ids } = req.body;

    if (!igdb_game_id || !play_date || hours === undefined) {
      return res.status(400).json({ message: 'igdb_game_id, play_date, and hours are required' });
    }

    const game = await IGDBService.getGameById(igdb_game_id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found on IGDB' });
    }

    const existingInLibrary = await LibraryModel.findByUserAndGame(userId, igdb_game_id);
    if (!existingInLibrary) {
      await LibraryModel.create(userId, igdb_game_id);
    }

    const log = await GameLogModel.create({
      user_id: userId,
      igdb_game_id,
      play_date,
      hours,
      comment: comment || null
    });

    let participants = [];
    if (participant_ids && participant_ids.length > 0) {
      const validParticipants = [];
      for (const participantId of participant_ids) {
        if (participantId === userId) continue;

        const friendship = await FriendsModel.findRequest(userId, participantId);
        if (friendship && friendship.status === 'accepted') {
          validParticipants.push(participantId);
        }
      }

      if (validParticipants.length > 0) {
        participants = await LogParticipantsModel.createMany(log.id_log, validParticipants);
      }
    }

    res.status(201).json({
      message: 'Log created successfully',
      log: {
        ...log,
        game,
        participants
      }
    });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ message: 'Error creating log' });
  }
};

export const update = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { id } = req.params;
    const { play_date, hours, comment } = req.body;

    const log = await GameLogModel.findById(id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    if (log.user_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own logs' });
    }

    const updatedLog = await GameLogModel.update(id, { play_date, hours, comment });
    res.json({
      message: 'Log updated successfully',
      log: updatedLog
    });
  } catch (error) {
    console.error('Update log error:', error);
    res.status(500).json({ message: 'Error updating log' });
  }
};

export const remove = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { id } = req.params;

    const log = await GameLogModel.findById(id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    if (log.user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own logs' });
    }

    await LogParticipantsModel.removeByLogId(id);
    await GameLogModel.remove(id);

    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ message: 'Error deleting log' });
  }
};

export const acceptParticipation = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { id } = req.params;

    const participation = await LogParticipantsModel.findById(id);
    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    if (participation.user_id !== userId) {
      return res.status(403).json({ message: 'Cannot accept this participation' });
    }

    if (participation.status !== 'pending') {
      return res.status(400).json({ message: 'Participation already processed' });
    }

    await LogParticipantsModel.updateStatus(id, 'accepted');

    const log = await GameLogModel.findById(participation.log_id);
    const existingInLibrary = await LibraryModel.findByUserAndGame(userId, log.igdb_game_id);
    if (!existingInLibrary) {
      await LibraryModel.create(userId, log.igdb_game_id);
    }

    res.json({ message: 'Participation accepted' });
  } catch (error) {
    console.error('Accept participation error:', error);
    res.status(500).json({ message: 'Error accepting participation' });
  }
};

export const rejectParticipation = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { id } = req.params;

    const participation = await LogParticipantsModel.findById(id);
    if (!participation) {
      return res.status(404).json({ message: 'Participation not found' });
    }

    if (participation.user_id !== userId) {
      return res.status(403).json({ message: 'Cannot reject this participation' });
    }

    if (participation.status !== 'pending') {
      return res.status(400).json({ message: 'Participation already processed' });
    }

    await LogParticipantsModel.updateStatus(id, 'rejected');
    res.json({ message: 'Participation rejected' });
  } catch (error) {
    console.error('Reject participation error:', error);
    res.status(500).json({ message: 'Error rejecting participation' });
  }
};

export default {
  getMyLogs,
  getUserLogs,
  getGameLogs,
  getPendingParticipations,
  create,
  update,
  remove,
  acceptParticipation,
  rejectParticipation
};
