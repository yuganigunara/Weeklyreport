import { z } from 'zod';

const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const role = z.enum(['member', 'manager', 'admin']);
const dateString = z.string().min(8);

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    role: role.optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

export const updateUserRoleSchema = z.object({
  params: z.object({ id }),
  body: z.object({ role })
});

export const reportSchema = z.object({
  body: z.object({
    weekStart: dateString,
    weekEnd: dateString,
    project: id,
    tasksCompleted: z.string().min(3).max(6000),
    tasksPlanned: z.string().min(3).max(6000),
    blockers: z.string().max(4000).optional().default(''),
    hoursWorked: z.coerce.number().min(0).max(168).optional().or(z.literal('').transform(() => undefined)),
    notes: z.string().max(4000).optional().default('')
  })
});

export const updateReportSchema = z.object({
  params: z.object({ id }),
  body: reportSchema.shape.body.partial()
});

export const reportQuerySchema = z.object({
  query: z.object({
    member: id.optional(),
    project: id.optional(),
    weekStart: dateString.optional(),
    from: dateString.optional(),
    to: dateString.optional()
  })
});

export const projectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    description: z.string().max(500).optional().default(''),
    assignedMembers: z.array(id).optional().default([])
  })
});

export const updateProjectSchema = z.object({
  params: z.object({ id }),
  body: projectSchema.shape.body.partial()
});

export const idParamSchema = z.object({
  params: z.object({ id })
});

export const chatSchema = z.object({
  body: z.object({
    message: z.string().min(2).max(500)
  })
});
