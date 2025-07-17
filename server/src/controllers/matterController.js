const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all matters
const getMatters = async (req, res) => {
  try {
    const matters = await prisma.matter.findMany({
      include: {
        client: {
          include: {
            attorney: true,
            paralegal: true,
            projectManager: true
          }
        },
        people: {
          include: {
            person: true
          }
        }
      },
      orderBy: {
        matterName: 'asc'
      }
    });
    res.json(matters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matters' });
  }
};

// Get matters by client ID
const getMattersByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const matters = await prisma.matter.findMany({
      where: { clientId: parseInt(clientId) },
      include: {
        client: {
          include: {
            attorney: true,
            paralegal: true,
            projectManager: true
          }
        }
      },
      orderBy: {
        matterName: 'asc'
      }
    });
    res.json(matters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matters' });
  }
};

// Get a single matter by ID
const getMatter = async (req, res) => {
  try {
    const { id } = req.params;
    const matter = await prisma.matter.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: {
          include: {
            attorney: true,
            paralegal: true,
            projectManager: true
          }
        },
        people: {
          include: {
            person: true
          }
        }
      }
    });
    
    if (!matter) {
      return res.status(404).json({ error: 'Matter not found' });
    }
    
    res.json(matter);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matter' });
  }
};

// Create a new matter
const createMatter = async (req, res) => {
  try {
    const { matterName, matterNumber, clientId, status, peopleIds } = req.body;
    
    // Validate input
    if (!matterName || !matterNumber || !clientId) {
      return res.status(400).json({ error: 'Matter name, matter number, and client ID are required' });
    }
    
    // Validate matter number format (6 digits)
    if (!/^\d{6}$/.test(matterNumber)) {
      return res.status(400).json({ error: 'Matter number must be exactly 6 digits' });
    }

    // Validate status if provided
    const validStatuses = ['COLLECTION', 'CULLING', 'REVIEW', 'PRODUCTION', 'INACTIVE'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }
    
    // Check if client exists
    const clientExists = await prisma.client.findUnique({
      where: { id: parseInt(clientId) }
    });
    
    if (!clientExists) {
      return res.status(400).json({ error: 'Client not found' });
    }
    
    // Create matter first
    const matter = await prisma.matter.create({
      data: {
        matterName,
        matterNumber,
        clientId: parseInt(clientId),
        status: status || 'COLLECTION'
      }
    });
    
    // Add people relationships if provided
    if (peopleIds && Array.isArray(peopleIds) && peopleIds.length > 0) {
      await prisma.matterPerson.createMany({
        data: peopleIds.map(personId => ({
          matterId: matter.id,
          personId: parseInt(personId)
        }))
      });
      
      // Auto-link attorneys, paralegals, and project managers to client
      const assignedPeople = await prisma.person.findMany({
        where: {
          id: { in: peopleIds.map(id => parseInt(id)) },
          type: { in: ['ATTORNEY', 'PARALEGAL', 'PROJECT_MANAGER'] }
        }
      });
      
      // Get current client data
      const currentClient = await prisma.client.findUnique({
        where: { id: parseInt(clientId) },
        select: { 
          attorneyId: true, 
          paralegalId: true, 
          projectManagerId: true 
        }
      });
      
      const updateData = {};
      
      // Auto-link attorney if none assigned
      if (!currentClient.attorneyId) {
        const attorney = assignedPeople.find(p => p.type === 'ATTORNEY');
        if (attorney) {
          updateData.attorneyId = attorney.id;
        }
      }
      
      // Auto-link paralegal if none assigned
      if (!currentClient.paralegalId) {
        const paralegal = assignedPeople.find(p => p.type === 'PARALEGAL');
        if (paralegal) {
          updateData.paralegalId = paralegal.id;
        }
      }
      
      // Auto-link project manager if none assigned
      if (!currentClient.projectManagerId) {
        const projectManager = assignedPeople.find(p => p.type === 'PROJECT_MANAGER');
        if (projectManager) {
          updateData.projectManagerId = projectManager.id;
        }
      }
      
      // Update client if there are any auto-links to make
      if (Object.keys(updateData).length > 0) {
        await prisma.client.update({
          where: { id: parseInt(clientId) },
          data: updateData
        });
      }
    }
    
    // Fetch the complete matter with relationships
    const completeMatter = await prisma.matter.findUnique({
      where: { id: matter.id },
      include: {
        client: {
          include: {
            attorney: true,
            paralegal: true,
            projectManager: true
          }
        },
        people: {
          include: {
            person: true
          }
        }
      }
    });
    
    res.status(201).json(completeMatter);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Matter number already exists' });
    }
    res.status(500).json({ error: 'Failed to create matter' });
  }
};

// Update a matter
const updateMatter = async (req, res) => {
  try {
    const { id } = req.params;
    const { matterName, matterNumber, clientId, status, peopleIds } = req.body;
    
    // Validate input
    if (!matterName || !matterNumber || !clientId) {
      return res.status(400).json({ error: 'Matter name, matter number, and client ID are required' });
    }
    
    // Validate matter number format (6 digits)
    if (!/^\d{6}$/.test(matterNumber)) {
      return res.status(400).json({ error: 'Matter number must be exactly 6 digits' });
    }

    // Validate status if provided
    const validStatuses = ['COLLECTION', 'CULLING', 'REVIEW', 'PRODUCTION', 'INACTIVE'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }
    
    // Check if client exists
    const clientExists = await prisma.client.findUnique({
      where: { id: parseInt(clientId) }
    });
    
    if (!clientExists) {
      return res.status(400).json({ error: 'Client not found' });
    }
    
    // Update matter
    await prisma.matter.update({
      where: { id: parseInt(id) },
      data: {
        matterName,
        matterNumber,
        clientId: parseInt(clientId),
        ...(status && { status })
      }
    });
    
    // Update people relationships
    // First, delete existing relationships
    await prisma.matterPerson.deleteMany({
      where: { matterId: parseInt(id) }
    });
    
    // Add new relationships if provided
    if (peopleIds && Array.isArray(peopleIds) && peopleIds.length > 0) {
      await prisma.matterPerson.createMany({
        data: peopleIds.map(personId => ({
          matterId: parseInt(id),
          personId: parseInt(personId)
        }))
      });
      
      // Auto-link attorneys, paralegals, and project managers to client
      const assignedPeople = await prisma.person.findMany({
        where: {
          id: { in: peopleIds.map(pId => parseInt(pId)) },
          type: { in: ['ATTORNEY', 'PARALEGAL', 'PROJECT_MANAGER'] }
        }
      });
      
      // Get current client data
      const currentClient = await prisma.client.findUnique({
        where: { id: parseInt(clientId) },
        select: { 
          attorneyId: true, 
          paralegalId: true, 
          projectManagerId: true 
        }
      });
      
      const updateData = {};
      
      // Auto-link attorney if none assigned
      if (!currentClient.attorneyId) {
        const attorney = assignedPeople.find(p => p.type === 'ATTORNEY');
        if (attorney) {
          updateData.attorneyId = attorney.id;
        }
      }
      
      // Auto-link paralegal if none assigned
      if (!currentClient.paralegalId) {
        const paralegal = assignedPeople.find(p => p.type === 'PARALEGAL');
        if (paralegal) {
          updateData.paralegalId = paralegal.id;
        }
      }
      
      // Auto-link project manager if none assigned
      if (!currentClient.projectManagerId) {
        const projectManager = assignedPeople.find(p => p.type === 'PROJECT_MANAGER');
        if (projectManager) {
          updateData.projectManagerId = projectManager.id;
        }
      }
      
      // Update client if there are any auto-links to make
      if (Object.keys(updateData).length > 0) {
        await prisma.client.update({
          where: { id: parseInt(clientId) },
          data: updateData
        });
      }
    }
    
    // Fetch the complete matter with relationships
    const matter = await prisma.matter.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: {
          include: {
            attorney: true,
            paralegal: true,
            projectManager: true
          }
        },
        people: {
          include: {
            person: true
          }
        }
      }
    });
    
    res.json(matter);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Matter number already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Matter not found' });
    }
    res.status(500).json({ error: 'Failed to update matter' });
  }
};

// Delete a matter
const deleteMatter = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.matter.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Matter deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Matter not found' });
    }
    res.status(500).json({ error: 'Failed to delete matter' });
  }
};

// Update matter status only (for Kanban board)
const updateMatterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['COLLECTION', 'CULLING', 'REVIEW', 'PRODUCTION', 'INACTIVE'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }
    
    // Update matter status
    const updatedMatter = await prisma.matter.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        client: {
          include: {
            attorney: true,
            paralegal: true,
            projectManager: true
          }
        },
        people: {
          include: {
            person: true
          }
        }
      }
    });
    
    res.json(updatedMatter);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Matter not found' });
    }
    res.status(500).json({ error: 'Failed to update matter status' });
  }
};

module.exports = {
  getMatters,
  getMattersByClient,
  getMatter,
  createMatter,
  updateMatter,
  updateMatterStatus,
  deleteMatter
};
