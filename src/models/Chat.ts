import mongoose from 'mongoose';

const AttachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Allow both string and array
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  attachments: {
    type: [AttachmentSchema],
    default: [],
  },
});

const ChatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'New Chat',
    maxlength: 200,
  },
  messages: [MessageSchema],
}, {
  timestamps: true,
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);

export default Chat;
