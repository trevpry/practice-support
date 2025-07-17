const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all people
const getPeople = async (req, res) => {
  try {
    const people = await prisma.person.findMany({
      include: {
        clientAttorney: true,
        clientParalegal: true,
        clientProjectManager: true,
        matterPersons: {
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
    
    // Transform the response to match frontend expectations
    const transformedPeople = people.map(person => ({
      ...person,
      matters: person.matterPersons, // Rename matterPersons to matters
      assignedAsAttorney: person.clientAttorney,
      assignedAsParalegal: person.clientParalegal,
      assignedAsProjectManager: person.clientProjectManager
    }));
    
    res.json(transformedPeople);
  } catch (error) {
    console.error('Error fetching people:', error);
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
        clientAttorney: {
          include: {
            matters: true
          }
        },
        clientParalegal: {
          include: {
            matters: true
          }
        },
        clientProjectManager: {
          include: {
            matters: true
          }
        },
        matterPersons: {
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
    
    // Transform the response to match frontend expectations
    const transformedPerson = {
      ...person,
      matters: person.matterPersons, // Rename matterPersons to matters
      assignedAsAttorney: person.clientAttorney,
      assignedAsParalegal: person.clientParalegal,
      assignedAsProjectManager: person.clientProjectManager
    };
    
    // Remove the original fields
    delete transformedPerson.matterPersons;
    delete transformedPerson.clientAttorney;
    delete transformedPerson.clientParalegal;
    delete transformedPerson.clientProjectManager;
    
    res.json(transformedPerson);
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
};

// Create a new person
const createPerson = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, type, company, role, notes, streetAddress, city, state, zipCode, country, matterIds } = req.body;
    
    // Validate input
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    // Validate type if provided
    const validTypes = ['ATTORNEY', 'PARALEGAL', 'VENDOR', 'PROJECT_MANAGER'];
    if (type && !validTypes.includes(type)) {
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
        type: type || null,
        company: company || null,
        role: role || null,
        notes: notes || null,
        streetAddress: streetAddress || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        country: country || null
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
        clientAttorney: true,
        clientParalegal: true,
        matterPersons: {
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
    console.error('Error creating person:', error);
    res.status(500).json({ error: 'Failed to create person' });
  }
};

// Update a person
const updatePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, type, company, role, notes, streetAddress, city, state, zipCode, country, matterIds } = req.body;
    
    // Validate input
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    // Validate type if provided
    const validTypes = ['ATTORNEY', 'PARALEGAL', 'VENDOR', 'PROJECT_MANAGER'];
    if (type && !validTypes.includes(type)) {
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
        type: type || null,
        company: company || null,
        role: role || null,
        notes: notes || null,
        streetAddress: streetAddress || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        country: country || null
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
        clientAttorney: true,
        clientParalegal: true,
        matterPersons: {
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
    console.error('Error updating person:', error);
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
    console.error('Error deleting person:', error);
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
