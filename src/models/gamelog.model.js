import pool from '../config/database.js';

export const findAll = async (filters = {}) => {
  let query = 'SELECT * FROM game_log WHERE 1=1';
  const values = [];

  if (filters.userId) {
    query += ' AND user_id = ?';
    values.push(filters.userId);
  }
  if (filters.igdbGameId) {
    query += ' AND igdb_game_id = ?';
    values.push(filters.igdbGameId);
  }

  query += ' ORDER BY play_date DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    values.push(filters.limit);
  }

  const [rows] = await pool.query(query, values);
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM game_log WHERE id_log = ?',
    [id]
  );
  return rows[0];
};

export const findByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM game_log WHERE user_id = ? ORDER BY play_date DESC',
    [userId]
  );
  return rows;
};

export const findByGameId = async (igdbGameId) => {
  const [rows] = await pool.query(
    'SELECT gl.*, u.username, u.profile_pic FROM game_log gl JOIN user u ON gl.user_id = u.id_usuario WHERE gl.igdb_game_id = ? ORDER BY gl.play_date DESC',
    [igdbGameId]
  );
  return rows;
};

export const create = async (logData) => {
  const { user_id, igdb_game_id, comment, play_date, hours } = logData;
  const [result] = await pool.query(
    'INSERT INTO game_log (user_id, igdb_game_id, comment, play_date, hours) VALUES (?, ?, ?, ?, ?)',
    [user_id, igdb_game_id, comment || null, play_date, hours]
  );
  return { id_log: result.insertId, ...logData };
};

export const update = async (id, logData) => {
  const fields = [];
  const values = [];

  if (logData.comment !== undefined) {
    fields.push('comment = ?');
    values.push(logData.comment);
  }
  if (logData.play_date) {
    fields.push('play_date = ?');
    values.push(logData.play_date);
  }
  if (logData.hours !== undefined) {
    fields.push('hours = ?');
    values.push(logData.hours);
  }

  if (fields.length === 0) return null;

  values.push(id);
  await pool.query(
    `UPDATE game_log SET ${fields.join(', ')} WHERE id_log = ?`,
    values
  );
  return findById(id);
};

export const remove = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM game_log WHERE id_log = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const removeByUserAndGame = async (userId, igdbGameId) => {
  const [result] = await pool.query(
    'DELETE FROM game_log WHERE user_id = ? AND igdb_game_id = ?',
    [userId, igdbGameId]
  );
  return result.affectedRows;
};

export const countByGame = async (igdbGameId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(DISTINCT user_id) as count FROM game_log WHERE igdb_game_id = ?',
    [igdbGameId]
  );
  return rows[0].count;
};

export default {
  findAll,
  findById,
  findByUserId,
  findByGameId,
  create,
  update,
  remove,
  removeByUserAndGame,
  countByGame
};
