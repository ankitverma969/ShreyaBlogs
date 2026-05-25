import Message from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!email || !message) {
    res.status(400);
    throw new Error('Email and message are required');
  }

  await Message.create({
    name: name || 'Anonymous',
    email,
    message
  });

  res.status(201).json({ success: true, message: 'Message sent successfully' });
});
