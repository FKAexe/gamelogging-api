import pool from '../config/database.js';

export const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, igdb_game_id, added_at FROM user_library WHERE user_id = ? ORDER BY added_at DESC',
    [userId]
  );
  return rows;
};

export const findByUserAndGame = async (userId, igdbGameId) => {
  const [rows] = await pool.query(
    'SELECT * FROM user_library WHERE user_id = ? AND igdb_game_id = ?',
    [userId, igdbGameId]
  );
  return rows[0];
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM user_library WHERE id = ?',
    [id]
  );
  return rows[0];
};

export const create = async (userId, igdbGameId) => {
  const [result] = await pool.query(
    'INSERT INTO user_library (user_id, igdb_game_id) VALUES (?, ?)',
    [userId, igdbGameId]
  );
  return { id: result.insertId, user_id: userId, igdb_game_id: igdbGameId };
};

export const remove = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM user_library WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const removeByUserAndGame = async (userId, igdbGameId) => {
  const [result] = await pool.query(
    'DELETE FROM user_library WHERE user_id = ? AND igdb_game_id = ?',
    [userId, igdbGameId]
  );
  return result.affectedRows > 0;
};

export const countByGame = async (igdbGameId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM user_library WHERE igdb_game_id = ?',
    [igdbGameId]
  );
  return rows[0].count;
};

export default {
  findByUserId,
  findByUserAndGame,
  findById,
  create,
  remove,
  removeByUserAndGame,
  countByGame
};

