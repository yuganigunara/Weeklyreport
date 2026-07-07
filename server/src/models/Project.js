import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true, default: '' },
    color: { type: String, trim: true, default: '#2563eb' },
    assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', projectSchema);
