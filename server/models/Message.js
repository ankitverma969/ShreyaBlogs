import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Anonymous'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
