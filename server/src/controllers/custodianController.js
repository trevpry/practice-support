const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all custodians
const getCustodians = async (req, res) => {
  try {
    const custodians = await prisma.custodian.findMany({
      include: {
        organization: true,
        collections: {
          include: {
            matter: {
              include: {
                client: true
              }
            },
            organization: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(custodians);
  } catch (error) {
    console.error('Error fetching custodians:', error);
    res.status(500).json({ error: 'Failed to fetch custodians' });
  }
};

// Get custodian by ID
const getCustodianById = async (req, res) => {
  try {
    const { id } = req.params;
    const custodian = await prisma.custodian.findUnique({
      where: { id: parseInt(id) },
      include: {
        organization: true,
        collections: {
          include: {
            matter: {
              include: {
                client: true
              }
            },
            organization: true
          }
        }
      }
    });
    
    if (!custodian) {
      return res.status(404).json({ error: 'Custodian not found' });
    }
    
    res.json(custodian);
  } catch (error) {
    console.error('Error fetching custodian:', error);
    res.status(500).json({ error: 'Failed to fetch custodian' });
  }
};

// Create custodian
const createCustodian = async (req, res) => {
  try {
    const { name, email, department, title, streetAddress, city, state, zipCode, organizationId } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization is required' });
    }
    
    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(organizationId) }
    });
    
    if (!organization) {
      return res.status(400).json({ error: 'Organization not found' });
    }
    
    const custodian = await prisma.custodian.create({
      data: {
        name,
        email: email || null,
        department: department || null,
        title: title || null,
        streetAddress: streetAddress || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        organizationId: parseInt(organizationId)
      },
      include: {
        organization: true,
        collections: true
      }
    });
    
    res.status(201).json(custodian);
  } catch (error) {
    console.error('Error creating custodian:', error);
    res.status(500).json({ error: 'Failed to create custodian' });
  }
};

// Update custodian
const updateCustodian = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, title, organizationId, email, streetAddress, city, state, zipCode } = req.body;
    
    // Check if custodian exists
    const existingCustodian = await prisma.custodian.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingCustodian) {
      return res.status(404).json({ error: 'Custodian not found' });
    }
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization is required' });
    }
    
    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(organizationId) }
    });
    
    if (!organization) {
      return res.status(400).json({ error: 'Organization not found' });
    }
    
    const custodian = await prisma.custodian.update({
      where: { id: parseInt(id) },
      data: {
        name,
        department: department || null,
        title: title || null,
        organizationId: parseInt(organizationId),
        email: email || null,
        streetAddress: streetAddress || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null
      },
      include: {
        organization: true,
        collections: {
          include: {
            matter: {
              include: {
                client: true
              }
            },
            organization: true
          }
        }
      }
    });
    
    res.json(custodian);
  } catch (error) {
    console.error('Error updating custodian:', error);
    res.status(500).json({ error: 'Failed to update custodian' });
  }
};

// Delete custodian
const deleteCustodian = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if custodian exists
    const existingCustodian = await prisma.custodian.findUnique({
      where: { id: parseInt(id) },
      include: {
        collections: true
      }
    });
    
    if (!existingCustodian) {
      return res.status(404).json({ error: 'Custodian not found' });
    }
    
    // Check if custodian has collections
    if (existingCustodian.collections.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete custodian with existing collections. Please delete collections first.' 
      });
    }
    
    await prisma.custodian.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Custodian deleted successfully' });
  } catch (error) {
    console.error('Error deleting custodian:', error);
    res.status(500).json({ error: 'Failed to delete custodian' });
  }
};

module.exports = {
  getCustodians,
  getCustodianById,
  createCustodian,
  updateCustodian,
  deleteCustodian
};
