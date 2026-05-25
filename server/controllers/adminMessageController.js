import Message from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, messages });
});

export const markMessageRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const message = await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }
  res.status(200).json({ success: true, message });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const message = await Message.findByIdAndDelete(id);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }
  res.status(200).json({ success: true, message: 'Message deleted' });
});
