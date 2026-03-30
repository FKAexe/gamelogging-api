import * as FriendsModel from '../models/friends.model.js';
import * as UserModel from '../models/user.model.js';

export const getFriends = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const friends = await FriendsModel.findFriendsByUserId(userId);
    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Error fetching friends' });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const requests = await FriendsModel.findPendingRequests(userId);
    res.json(requests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Error fetching pending requests' });
  }
};

export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const requests = await FriendsModel.findSentRequests(userId);
    res.json(requests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Error fetching sent requests' });
  }
};

export const sendRequest = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { friendId } = req.params;

    if (userId === parseInt(friendId)) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const friend = await UserModel.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingRequest = await FriendsModel.findRequest(userId, friendId);
    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return res.status(409).json({ message: 'Already friends' });
      }
      return res.status(409).json({ message: 'Friend request already exists' });
    }

    const request = await FriendsModel.create(userId, friendId);
    res.status(201).json({
      message: 'Friend request sent',
      request
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Error sending friend request' });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { requestId } = req.params;

    const request = await FriendsModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.friend_id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Cannot accept this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    const updatedRequest = await FriendsModel.updateStatus(requestId, 'accepted');
    res.json({
      message: 'Friend request accepted',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Error accepting friend request' });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { requestId } = req.params;

    const request = await FriendsModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.friend_id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Cannot reject this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    await FriendsModel.remove(requestId);
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Error rejecting friend request' });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { friendId } = req.params;

    const friendship = await FriendsModel.findRequest(userId, friendId);
    if (!friendship || friendship.status !== 'accepted') {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    await FriendsModel.remove(friendship.id);
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Error removing friend' });
  }
};

export const cancelRequest = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { requestId } = req.params;

    const request = await FriendsModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.user_id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Cannot cancel this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    await FriendsModel.remove(requestId);
    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({ message: 'Error cancelling friend request' });
  }
};

export default {
  getFriends,
  getPendingRequests,
  getSentRequests,
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeFriend,
  cancelRequest
};
