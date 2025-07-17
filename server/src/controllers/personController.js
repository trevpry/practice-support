const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all people
const getPeople = async (req, res) => {
  try {
    const people = await prisma.person.findMany({
      include: {
        clientsAsAttorney: true,
        clientsAsParalegal: true,
        matters: {
          include: {
            matter: {
              include: {
                client: true
              }
            }
          }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });
    res.json(people);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch people' });
  }
};

// Get a single person by ID
const getPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const person = await prisma.person.findUnique({
      where: { id: parseInt(id) },
      include: {
        clientsAsAttorney: {
          include: {
            matters: true
          }
        },
        clientsAsParalegal: {
          include: {
            matters: true
          }
        },
        matters: {
          include: {
            matter: {
              include: {
                client: true
              }
            }
          }
        }
      }
    });
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch person' });
  }
};

// Create a new person
const createPerson = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, type, matterIds } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !type) {
      return res.status(400).json({ error: 'First name, last name, and type are required' });
    }
    
    // Validate type
    const validTypes = ['ATTORNEY', 'PARALEGAL', 'VENDOR', 'PROJECT_MANAGER'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid person type' });
    }
    
    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Create person first
    const person = await prisma.person.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        type
      }
    });
    
    // Add matter relationships if provided
    if (matterIds && Array.isArray(matterIds) && matterIds.length > 0) {
      await prisma.matterPerson.createMany({
        data: matterIds.map(matterId => ({
          matterId: parseInt(matterId),
          personId: person.id
        }))
      });
    }
    
    // Fetch the complete person with relationships
    const completePerson = await prisma.person.findUnique({
      where: { id: person.id },
      include: {
        clientsAsAttorney: true,
        clientsAsParalegal: true,
        matters: {
          include: {
            matter: {
              include: {
                client: true
              }
            }
          }
        }
      }
    });
    
    res.status(201).json(completePerson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create person' });
  }
};

// Update a person
const updatePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, type, matterIds } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !type) {
      return res.status(400).json({ error: 'First name, last name, and type are required' });
    }
    
    // Validate type
    const validTypes = ['ATTORNEY', 'PARALEGAL', 'VENDOR', 'PROJECT_MANAGER'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid person type' });
    }
    
    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Update person
    await prisma.person.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        type
      }
    });
    
    // Update matter relationships
    // First, delete existing relationships
    await prisma.matterPerson.deleteMany({
      where: { personId: parseInt(id) }
    });
    
    // Add new relationships if provided
    if (matterIds && Array.isArray(matterIds) && matterIds.length > 0) {
      await prisma.matterPerson.createMany({
        data: matterIds.map(matterId => ({
          matterId: parseInt(matterId),
          personId: parseInt(id)
        }))
      });

      // Auto-link person to clients of assigned matters
      // Get all matters to find their clients
      const matters = await prisma.matter.findMany({
        where: { id: { in: matterIds.map(id => parseInt(id)) } },
        include: { client: true }
      });

      // Group matters by client and person type
      const clientAssignments = {};
      for (const matter of matters) {
        const clientId = matter.clientId;
        if (!clientAssignments[clientId]) {
          clientAssignments[clientId] = { client: matter.client, types: new Set() };
        }
        clientAssignments[clientId].types.add(type);
      }

      // Update client assignments based on person type
      for (const [clientId, { client, types }] of Object.entries(clientAssignments)) {
        const updateData = {};
        
        if (type === 'ATTORNEY' && !client.attorneyId) {
          updateData.attorneyId = parseInt(id);
        }
        if (type === 'PARALEGAL' && !client.paralegalId) {
          updateData.paralegalId = parseInt(id);
        }

        // Only update if there's something to update
        if (Object.keys(updateData).length > 0) {
          await prisma.client.update({
            where: { id: parseInt(clientId) },
            data: updateData
          });
        }
      }
    }
    
    // Fetch the complete person with relationships
    const person = await prisma.person.findUnique({
      where: { id: parseInt(id) },
      include: {
        clientsAsAttorney: true,
        clientsAsParalegal: true,
        matters: {
          include: {
            matter: {
              include: {
                client: true
              }
            }
          }
        }
      }
    });
    
    res.json(person);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.status(500).json({ error: 'Failed to update person' });
  }
};

// Delete a person
const deletePerson = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.person.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.status(500).json({ error: 'Failed to delete person' });
  }
};

module.exports = {
  getPeople,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson
};
