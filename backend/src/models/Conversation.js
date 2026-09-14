const mongoose = require('mongoose');

const { Schema } = mongoose;

const SourceSchema = new Schema(
  {
    id: String,
    label: String,
  },
  { _id: false }
);

const MessageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'model'], required: true },
    text: { type: String, required: true },
    sources: [SourceSchema],
  },
  { timestamps: true }
);

const ConversationSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);
