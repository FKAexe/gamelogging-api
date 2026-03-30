import pool from '../config/database.js';

export const findAll = async () => {
  const [rows] = await pool.query(
    'SELECT id_usuario, username, email, name, bio, profile_pic, created_at FROM user'
  );
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id_usuario, username, email, name, bio, profile_pic, created_at FROM user WHERE id_usuario = ?',
    [id]
  );
  return rows[0];
};

export const findByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM user WHERE email = ?',
    [email]
  );
  return rows[0];
};

export const findByUsername = async (username) => {
  const [rows] = await pool.query(
    'SELECT id_usuario, username, email, name, bio, profile_pic, created_at FROM user WHERE username = ?',
    [username]
  );
  return rows[0];
};

export const create = async (userData) => {
  const { username, email, password_hash, name, bio, profile_pic } = userData;
  const [result] = await pool.query(
    'INSERT INTO user (username, email, password_hash, name, bio, profile_pic) VALUES (?, ?, ?, ?, ?, ?)',
    [username, email, password_hash, name || null, bio || null, profile_pic || null]
  );
  return { id_usuario: result.insertId, ...userData };
};

export const update = async (id, userData) => {
  const fields = [];
  const values = [];

  if (userData.username) {
    fields.push('username = ?');
    values.push(userData.username);
  }
  if (userData.email) {
    fields.push('email = ?');
    values.push(userData.email);
  }
  if (userData.name !== undefined) {
    fields.push('name = ?');
    values.push(userData.name);
  }
  if (userData.bio !== undefined) {
    fields.push('bio = ?');
    values.push(userData.bio);
  }
  if (userData.password_hash) {
    fields.push('password_hash = ?');
    values.push(userData.password_hash);
  }

  if (fields.length === 0) return null;

  values.push(id);
  await pool.query(
    `UPDATE user SET ${fields.join(', ')} WHERE id_usuario = ?`,
    values
  );
  return findById(id);
};

export const remove = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM user WHERE id_usuario = ?',
    [id]
  );
  return result.affectedRows > 0;
};

export const updateProfilePic = async (id, picPath) => {
  await pool.query(
    'UPDATE user SET profile_pic = ? WHERE id_usuario = ?',
    [picPath, id]
  );
  return findById(id);
};

export default {
  findAll,
  findById,
  findByEmail,
  findByUsername,
  create,
  update,
  remove,
  updateProfilePic
};
