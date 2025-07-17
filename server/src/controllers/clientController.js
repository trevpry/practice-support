const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all clients
const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        matters: true,
        attorney: true,
        paralegal: true
      },
      orderBy: {
        clientName: 'asc'
      }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

// Get a single client by ID
const getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        matters: true,
        attorney: true,
        paralegal: true
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
};

// Create a new client
const createClient = async (req, res) => {
  try {
    const { clientName, clientNumber, attorneyId, paralegalId } = req.body;
    
    // Validate input
    if (!clientName || !clientNumber) {
      return res.status(400).json({ error: 'Client name and client number are required' });
    }
    
    // Validate client number format (7 digits)
    if (!/^\d{7}$/.test(clientNumber)) {
      return res.status(400).json({ error: 'Client number must be exactly 7 digits' });
    }
    
    // Validate attorney and paralegal if provided
    if (attorneyId) {
      const attorney = await prisma.person.findUnique({
        where: { id: parseInt(attorneyId) }
      });
      if (!attorney || attorney.type !== 'ATTORNEY') {
        return res.status(400).json({ error: 'Invalid attorney selected' });
      }
    }
    
    if (paralegalId) {
      const paralegal = await prisma.person.findUnique({
        where: { id: parseInt(paralegalId) }
      });
      if (!paralegal || paralegal.type !== 'PARALEGAL') {
        return res.status(400).json({ error: 'Invalid paralegal selected' });
      }
    }
    
    const client = await prisma.client.create({
      data: {
        clientName,
        clientNumber,
        attorneyId: attorneyId ? parseInt(attorneyId) : null,
        paralegalId: paralegalId ? parseInt(paralegalId) : null
      },
      include: {
        matters: true,
        attorney: true,
        paralegal: true
      }
    });
    
    res.status(201).json(client);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Client number already exists' });
    }
    res.status(500).json({ error: 'Failed to create client' });
  }
};

// Update a client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientName, clientNumber, attorneyId, paralegalId } = req.body;
    
    // Validate input
    if (!clientName || !clientNumber) {
      return res.status(400).json({ error: 'Client name and client number are required' });
    }
    
    // Validate client number format (7 digits)
    if (!/^\d{7}$/.test(clientNumber)) {
      return res.status(400).json({ error: 'Client number must be exactly 7 digits' });
    }
    
    // Validate attorney and paralegal if provided
    if (attorneyId) {
      const attorney = await prisma.person.findUnique({
        where: { id: parseInt(attorneyId) }
      });
      if (!attorney || attorney.type !== 'ATTORNEY') {
        return res.status(400).json({ error: 'Invalid attorney selected' });
      }
    }
    
    if (paralegalId) {
      const paralegal = await prisma.person.findUnique({
        where: { id: parseInt(paralegalId) }
      });
      if (!paralegal || paralegal.type !== 'PARALEGAL') {
        return res.status(400).json({ error: 'Invalid paralegal selected' });
      }
    }
    
    const client = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        clientName,
        clientNumber,
        attorneyId: attorneyId ? parseInt(attorneyId) : null,
        paralegalId: paralegalId ? parseInt(paralegalId) : null
      },
      include: {
        matters: true,
        attorney: true,
        paralegal: true
      }
    });
    
    res.json(client);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Client number already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(500).json({ error: 'Failed to update client' });
  }
};

// Delete a client
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.client.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(500).json({ error: 'Failed to delete client' });
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
};
