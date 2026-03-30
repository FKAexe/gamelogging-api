import * as UserModel from '../models/user.model.js';

export const getAll = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const getByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findByUsername(username);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id_usuario !== parseInt(id)) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const { username, email, name, bio } = req.body;

    if (username) {
      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername && existingUsername.id_usuario !== parseInt(id)) {
        return res.status(409).json({ message: 'Username already taken' });
      }
    }

    if (email) {
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail && existingEmail.id_usuario !== parseInt(id)) {
        return res.status(409).json({ message: 'Email already registered' });
      }
    }

    const updatedUser = await UserModel.update(id, { username, email, name, bio });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id_usuario !== parseInt(id)) {
      return res.status(403).json({ message: 'You can only delete your own account' });
    }

    const deleted = await UserModel.remove(id);

    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id_usuario !== parseInt(id)) {
      return res.status(403).json({ message: 'You can only update your own avatar' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const updatedUser = await UserModel.updateProfilePic(id, avatarPath);

    res.json({
      message: 'Avatar uploaded successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
};

export default { getAll, getById, getByUsername, update, remove, uploadAvatar };
