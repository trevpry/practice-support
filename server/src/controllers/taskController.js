const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        matter: {
          select: {
            id: true,
            matterName: true,
            matterNumber: true,
            client: {
              select: {
                id: true,
                clientName: true,
                clientNumber: true,
              },
            },
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
            email: true,
            phone: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
            email: true,
            phone: true,
          },
        },
        matter: {
          select: {
            id: true,
            matterName: true,
            matterNumber: true,
            client: {
              select: {
                id: true,
                clientName: true,
                clientNumber: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, matterId, ownerId, assigneeIds } = req.body;

    // Validate required fields
    if (!title || !ownerId) {
      return res.status(400).json({ error: 'Title and owner are required' });
    }

    // Verify owner exists
    const owner = await prisma.person.findUnique({
      where: { id: parseInt(ownerId) },
    });

    if (!owner) {
      return res.status(400).json({ error: 'Invalid owner ID' });
    }

    // Verify matter exists if provided
    if (matterId) {
      const matter = await prisma.matter.findUnique({
        where: { id: parseInt(matterId) },
      });

      if (!matter) {
        return res.status(400).json({ error: 'Invalid matter ID' });
      }
    }

    // Create task data
    const taskData = {
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate + 'T00:00:00') : null,
      matterId: matterId ? parseInt(matterId) : null,
      ownerId: parseInt(ownerId),
    };

    // Handle assignees if provided
    if (assigneeIds && assigneeIds.length > 0) {
      taskData.assignees = {
        connect: assigneeIds.map(id => ({ id: parseInt(id) })),
      };
    }

    const task = await prisma.task.create({
      data: taskData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        matter: {
          select: {
            id: true,
            matterName: true,
            matterNumber: true,
            client: {
              select: {
                id: true,
                clientName: true,
                clientNumber: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, matterId, ownerId, assigneeIds } = req.body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { assignees: true },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify owner exists if provided
    if (ownerId) {
      const owner = await prisma.person.findUnique({
        where: { id: parseInt(ownerId) },
      });

      if (!owner) {
        return res.status(400).json({ error: 'Invalid owner ID' });
      }
    }

    // Verify matter exists if provided
    if (matterId) {
      const matter = await prisma.matter.findUnique({
        where: { id: parseInt(matterId) },
      });

      if (!matter) {
        return res.status(400).json({ error: 'Invalid matter ID' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) {
      if (dueDate) {
        // Parse the date and set it to local time midnight to avoid timezone issues
        updateData.dueDate = new Date(dueDate + 'T00:00:00');
      } else {
        updateData.dueDate = null;
      }
    }
    if (matterId !== undefined) updateData.matterId = matterId ? parseInt(matterId) : null;
    if (ownerId !== undefined) updateData.ownerId = parseInt(ownerId);

    // Handle assignees update
    if (assigneeIds !== undefined) {
      // Disconnect all current assignees
      updateData.assignees = {
        set: assigneeIds.map(id => ({ id: parseInt(id) })),
      };
    }

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        matter: {
          select: {
            id: true,
            matterName: true,
            matterNumber: true,
            client: {
              select: {
                id: true,
                clientName: true,
                clientNumber: true,
              },
            },
          },
        },
      },
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Get tasks by matter
const getTasksByMatter = async (req, res) => {
  try {
    const { matterId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { matterId: parseInt(matterId) },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by matter:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get tasks by person (owned or assigned)
const getTasksByPerson = async (req, res) => {
  try {
    const { personId } = req.params;

    const ownedTasks = await prisma.task.findMany({
      where: { ownerId: parseInt(personId) },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        matter: {
          select: {
            id: true,
            matterName: true,
            matterNumber: true,
            client: {
              select: {
                id: true,
                clientName: true,
                clientNumber: true,
              },
            },
          },
        },
      },
    });

    const assignedTasks = await prisma.task.findMany({
      where: {
        assignees: {
          some: {
            id: parseInt(personId),
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            type: true,
          },
        },
        matter: {
          select: {
            id: true,
            matterName: true,
            matterNumber: true,
            client: {
              select: {
                id: true,
                clientName: true,
                clientNumber: true,
              },
            },
          },
        },
      },
    });

    // Combine and deduplicate tasks
    const allTasks = [...ownedTasks];
    assignedTasks.forEach(task => {
      if (!allTasks.find(t => t.id === task.id)) {
        allTasks.push(task);
      }
    });

    // Sort by priority and due date
    allTasks.sort((a, b) => {
      const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks by person:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get tasks for current user's linked person
const getTasksForCurrentUser = async (req, res) => {
  try {
    // Get current user (for now, just get the first user as a placeholder)
    // In a real app, this would be based on authentication
    const currentUser = await prisma.user.findFirst({
      include: {
        person: true
      }
    });

    if (!currentUser || !currentUser.person) {
      return res.json([]);
    }

    // Get tasks where the user's linked person is either owner or assignee
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { ownerId: currentUser.person.id },
          { assignees: { some: { id: currentUser.person.id } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        matter: {
          select: {
            id: true,
            matterName: true,
            matterNumber: true,
            client: {
              select: {
                id: true,
                clientName: true,
                clientNumber: true,
              },
            },
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks for current user:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByMatter,
  getTasksByPerson,
  getTasksForCurrentUser,
};
