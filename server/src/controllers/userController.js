const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        person: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get a specific user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        person: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const { username, email, firstName, lastName, personId } = req.body;

    // Generate username if not provided
    const generatedUsername = username || 
      (email ? email.split('@')[0].toLowerCase() : 
       `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, ''));

    const user = await prisma.user.create({
      data: {
        username: generatedUsername,
        email,
        firstName,
        lastName,
        personId: personId ? parseInt(personId) : null
      },
      include: {
        person: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update a user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, personId } = req.body;

    // Generate username if not provided
    const generatedUsername = username || 
      (email ? email.split('@')[0].toLowerCase() : 
       `${firstName}${lastName}`.toLowerCase().replace(/\s+/g, ''));

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username: generatedUsername,
        email,
        firstName,
        lastName,
        personId: personId ? parseInt(personId) : null
      },
      include: {
        person: true
      }
    });

    res.json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get current user (based on session or auth - for now just a placeholder)
const getCurrentUser = async (req, res) => {
  try {
    // For now, just return the first user as a placeholder
    // In a real app, this would be based on authentication
    const user = await prisma.user.findFirst({
      include: {
        person: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser
};
