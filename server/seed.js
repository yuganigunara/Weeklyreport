import dotenv from 'dotenv';
import { connectDb } from './src/config/db.js';
import { Project } from './src/models/Project.js';
import { Report } from './src/models/Report.js';
import { User } from './src/models/User.js';

dotenv.config();

const passwordHash = await User.hashPassword('Password123!');

await connectDb();
await Promise.all([User.deleteMany({}), Project.deleteMany({}), Report.deleteMany({})]);

const [manager, maya, liam] = await User.create([
  { name: 'Ava Manager', email: 'manager@example.com', passwordHash, role: 'manager' },
  { name: 'Maya Chen', email: 'maya@example.com', passwordHash, role: 'member' },
  { name: 'Liam Patel', email: 'liam@example.com', passwordHash, role: 'member' }
]);

const [clientA, tooling, rd] = await Project.create([
  { name: 'Client A', description: 'Client delivery and maintenance', color: '#2563eb', assignedMembers: [maya._id] },
  { name: 'Internal Tooling', description: 'Automation and process improvements', color: '#16a34a', assignedMembers: [maya._id, liam._id] },
  { name: 'R&D', description: 'Research and prototypes', color: '#dc2626', assignedMembers: [liam._id] }
]);

const weekStart = new Date();
weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
weekStart.setHours(0, 0, 0, 0);
const weekEnd = new Date(weekStart);
weekEnd.setDate(weekStart.getDate() + 4);

await Report.create([
  {
    user: maya._id,
    weekStart,
    weekEnd,
    project: clientA._id,
    tasksCompleted: 'Completed onboarding screens\nFixed profile validation\nReviewed deployment checklist',
    tasksPlanned: 'Finalize dashboard polish\nSupport QA feedback',
    blockers: 'Waiting on final API contract for billing fields',
    hoursWorked: 38,
    notes: 'Design handoff is linked in the project tracker.',
    status: 'submitted',
    submittedAt: new Date()
  },
  {
    user: liam._id,
    weekStart,
    weekEnd,
    project: tooling._id,
    tasksCompleted: 'Built report export utility\nAdded seed data script',
    tasksPlanned: 'Add automated integration tests\nImprove dashboard aggregation',
    blockers: '',
    hoursWorked: 35,
    status: 'submitted',
    submittedAt: new Date()
  },
  {
    user: liam._id,
    weekStart: new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000),
    weekEnd: new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000),
    project: rd._id,
    tasksCompleted: 'Compared chart libraries\nPrototyped assistant summary prompt',
    tasksPlanned: 'Move prototype into app shell',
    blockers: 'Need decision on LLM provider',
    hoursWorked: 8,
    status: 'submitted',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
]);

console.log('Seed complete');
console.log(`Manager: ${manager.email} / Password123!`);
process.exit(0);
