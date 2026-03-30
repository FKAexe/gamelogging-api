import pool from '../config/database.js';

export const findFriendsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT f.id, f.status, f.created_at,
            u.id_usuario, u.username, u.name, u.profile_pic
     FROM friends f
     JOIN user u ON (f.friend_id = u.id_usuario AND f.user_id = ?)
                 OR (f.user_id = u.id_usuario AND f.friend_id = ?)
     WHERE (f.user_id = ? OR f.friend_id = ?)
       AND f.status = 'accepted'
       AND u.id_usuario != ?`,
    [userId, userId, userId, userId, userId]
  );
  return rows;
};

export const findPendingRequests = async (userId) => {
  const [rows] = await pool.query(
    `SELECT f.id, f.user_id, f.created_at,
            u.id_usuario, u.username, u.name, u.profile_pic
     FROM friends f
     JOIN user u ON f.user_id = u.id_usuario
     WHERE f.friend_id = ? AND f.status = 'pending'`,
    [userId]
  );
  return rows;
};

export const findSentRequests = async (userId) => {
  const [rows] = await pool.query(
    `SELECT f.id, f.friend_id, f.created_at,
            u.id_usuario, u.username, u.name, u.profile_pic
     FROM friends f
     JOIN user u ON f.friend_id = u.id_usuario
     WHERE f.user_id = ? AND f.status = 'pending'`,
    [userId]
  );
  return rows;
};

export const findRequest = async (userId, friendId) => {
  const [rows] = await pool.query(
    `SELECT * FROM friends
     WHERE (user_id = ? AND friend_id = ?)
        OR (user_id = ? AND friend_id = ?)`,
    [userId, friendId, friendId, userId]
  );
  return rows[0];
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM friends WHERE id = ?',
    [id]
  );
  return rows[0];
};

export const create = async (userId, friendId) => {
  const [result] = await pool.query(
    'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)',
    [userId, friendId, 'pending']
  );
  return { id: result.insertId, user_id: userId, friend_id: friendId, status: 'pending' };
};

export const updateStatus = async (id, status) => {
  await pool.query(
    'UPDATE friends SET status = ? WHERE id = ?',
    [status, id]
  );
  return findById(id);
};

export const remove = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM friends WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export default {
  findFriendsByUserId,
  findPendingRequests,
  findSentRequests,
  findRequest,
  findById,
  create,
  updateStatus,
  remove
};
