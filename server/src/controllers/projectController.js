import { Project } from '../models/Project.js';
import { AppError } from '../utils/AppError.js';

export async function listProjects(_req, res, next) {
  try {
    const projects = await Project.find({ active: true }).populate('assignedMembers', 'name email role').sort({ name: 1 });
    res.json({ projects });
  } catch (error) {
    next(error);
  }
}

export async function createProject(req, res, next) {
  try {
    const project = await Project.create(req.validated.body);
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const project = await Project.findByIdAndUpdate(req.validated.params.id, req.validated.body, { new: true });
    if (!project) throw new AppError('Project not found', 404);
    res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await Project.findByIdAndUpdate(req.validated.params.id, { active: false }, { new: true });
    if (!project) throw new AppError('Project not found', 404);
    res.json({ project });
  } catch (error) {
    next(error);
  }
}
