import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    tasksCompleted: { type: String, required: true, trim: true },
    tasksPlanned: { type: String, required: true, trim: true },
    blockers: { type: String, trim: true, default: '' },
    hoursWorked: { type: Number, min: 0, max: 168 },
    notes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    submittedAt: Date
  },
  { timestamps: true }
);

reportSchema.index({ user: 1, weekStart: 1, project: 1 }, { unique: true });

export const Report = mongoose.model('Report', reportSchema);
