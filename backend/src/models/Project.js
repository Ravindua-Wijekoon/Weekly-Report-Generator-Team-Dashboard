const mongoose = require('mongoose');

const { Schema } = mongoose;

const ProjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    // Empty means open to every active member. A non-empty list restricts who can file
    // reports against this project (managers are always exempt from this restriction).
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
