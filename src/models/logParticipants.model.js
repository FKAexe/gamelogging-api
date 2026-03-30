import pool from '../config/database.js';

export const findByLogId = async (logId) => {
  const [rows] = await pool.query(
    `SELECT lp.id, lp.log_id, lp.user_id, lp.status, lp.created_at,
            u.username, u.name, u.profile_pic
     FROM log_participants lp
     JOIN user u ON lp.user_id = u.id_usuario
     WHERE lp.log_id = ?`,
    [logId]
  );
  return rows;
};

export const findPendingByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT lp.id, lp.log_id, lp.status, lp.created_at,
            gl.igdb_game_id, gl.play_date, gl.hours, gl.comment,
            u.id_usuario as owner_id, u.username as owner_username, u.profile_pic as owner_pic
     FROM log_participants lp
     JOIN game_log gl ON lp.log_id = gl.id_log
     JOIN user u ON gl.user_id = u.id_usuario
     WHERE lp.user_id = ? AND lp.status = 'pending'
     ORDER BY lp.created_at DESC`,
    [userId]
  );
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM log_participants WHERE id = ?',
    [id]
  );
  return rows[0];
};

export const findByLogAndUser = async (logId, userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM log_participants WHERE log_id = ? AND user_id = ?',
    [logId, userId]
  );
  return rows[0];
};

export const create = async (logId, userId) => {
  const [result] = await pool.query(
    'INSERT INTO log_participants (log_id, user_id, status) VALUES (?, ?, ?)',
    [logId, userId, 'pending']
  );
  return { id: result.insertId, log_id: logId, user_id: userId, status: 'pending' };
};

export const createMany = async (logId, userIds) => {
  if (!userIds || userIds.length === 0) return [];

  const values = userIds.map(userId => [logId, userId, 'pending']);
  await pool.query(
    'INSERT INTO log_participants (log_id, user_id, status) VALUES ?',
    [values]
  );
  return findByLogId(logId);
};

export const updateStatus = async (id, status) => {
  await pool.query(
    'UPDATE log_participants SET status = ? WHERE id = ?',
    [status, id]
  );
  return findById(id);
};

export const remove = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM log_participants WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const removeByLogId = async (logId) => {
  const [result] = await pool.query(
    'DELETE FROM log_participants WHERE log_id = ?',
    [logId]
  );
  return result.affectedRows;
};

export const removeByUserAndGame = async (userId, igdbGameId) => {
  const [result] = await pool.query(
    `DELETE lp FROM log_participants lp
     JOIN game_log gl ON lp.log_id = gl.id_log
     WHERE gl.user_id = ? AND gl.igdb_game_id = ?`,
    [userId, igdbGameId]
  );
  return result.affectedRows;
};

export default {
  findByLogId,
  findPendingByUserId,
  findById,
  findByLogAndUser,
  create,
  createMany,
  updateStatus,
  remove,
  removeByLogId,
  removeByUserAndGame
};
