const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Post } = require('../models/Post');
const { Comment } = require('../models/Post');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Delete a user
router.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user)
      return res.json({
        success: false,
        message: 'User could not be deleted!',
      });

    await Message.deleteMany({
      $or: [{ to: id }, { from: id }],
    });
    await Conversation.deleteMany({
      recipients: { $in: id },
    });
    await Post.deleteMany({
      creator: id,
    });
    await Comment.deleteMany({
      creator: id,
    });

    res.json({
      success: true,
      message: 'User deleted!',
      user,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: 'User could not be deleted!',
    });
  }
});

// Suspend a user
router.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { suspendedTill } = req.body;
    const user = await User.findByIdAndUpdate(id, {
      suspendedTill,
    });

    if (!user) {
      return res.json({
        success: false,
        message: 'User could not be suspended!',
      });
    }

    res.json({
      success: true,
      message: 'User suspended!',
      user,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: 'User could not be suspended!',
    });
  }
});

module.exports = router;
