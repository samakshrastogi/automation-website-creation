import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  model: {
    type: String,
    default: 'gemini-1.5-flash',
  }
});

const chatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'New Conversation',
    },
    messages: [messageSchema],
    category: {
      type: String,
      default: 'General',
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
