const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all collections
const getCollections = async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        custodians: {
          include: {
            custodian: {
              include: {
                organization: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

// Get collection by ID
const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        custodians: {
          include: {
            custodian: {
              include: {
                organization: true
              }
            }
          }
        }
      }
    });
    
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
};

// Get collections by matter ID
const getCollectionsByMatter = async (req, res) => {
  try {
    const { matterId } = req.params;
    const collections = await prisma.collection.findMany({
      where: { matterId: parseInt(matterId) },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        custodians: {
          include: {
            custodian: {
              include: {
                organization: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections for matter:', error);
    res.status(500).json({ error: 'Failed to fetch collections for matter' });
  }
};

// Get collection status options
const getCollectionStatusOptions = async (req, res) => {
  try {
    const statusOptions = [
      { value: 'DISCUSSING', label: 'Discussing' },
      { value: 'SCHEDULED', label: 'Scheduled' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'COMPLETED', label: 'Completed' }
    ];
    res.json(statusOptions);
  } catch (error) {
    console.error('Error fetching collection status options:', error);
    res.status(500).json({ error: 'Failed to fetch collection status options' });
  }
};

// Get collection type options
const getCollectionTypeOptions = async (req, res) => {
  try {
    const typeOptions = [
      { value: 'EMAIL', label: 'Email' },
      { value: 'MOBILE', label: 'Mobile' },
      { value: 'COMPUTER', label: 'Computer' },
      { value: 'OTHER', label: 'Other' }
    ];
    res.json(typeOptions);
  } catch (error) {
    console.error('Error fetching collection type options:', error);
    res.status(500).json({ error: 'Failed to fetch collection type options' });
  }
};

// Get email platform options
const getEmailPlatformOptions = async (req, res) => {
  try {
    const platformOptions = [
      { value: 'OUTLOOK', label: 'Outlook' },
      { value: 'GMAIL', label: 'Gmail' },
      { value: 'OTHER', label: 'Other' }
    ];
    res.json(platformOptions);
  } catch (error) {
    console.error('Error fetching email platform options:', error);
    res.status(500).json({ error: 'Failed to fetch email platform options' });
  }
};

// Create collection
const createCollection = async (req, res) => {
  try {
    const { status, type, platform, scheduledDate, completedDate, notes, matterId, organizationId, custodianIds } = req.body;
    
    // Validate required fields
    if (!type || !matterId || !custodianIds || !Array.isArray(custodianIds) || custodianIds.length === 0) {
      return res.status(400).json({ error: 'Type, matter, and at least one custodian are required' });
    }
    
    // Verify the matter exists
    const matter = await prisma.matter.findUnique({
      where: { id: matterId }
    });
    
    if (!matter) {
      return res.status(400).json({ error: 'Matter not found' });
    }
    
    // Verify all custodians exist
    const custodians = await prisma.custodian.findMany({
      where: { id: { in: custodianIds.map(id => parseInt(id)) } }
    });
    
    if (custodians.length !== custodianIds.length) {
      return res.status(400).json({ error: 'One or more custodians not found' });
    }
    
    // If organization is provided, verify it exists and is a vendor
    if (organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
      });
      
      if (!organization || organization.type !== 'VENDOR') {
        return res.status(400).json({ error: 'Organization must be of type VENDOR' });
      }
    }
    
    const collection = await prisma.collection.create({
      data: {
        status: status || 'DISCUSSING',
        type,
        platform: platform || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        completedDate: completedDate ? new Date(completedDate) : null,
        notes: notes || null,
        matterId,
        organizationId: organizationId || null,
        custodians: {
          create: custodianIds.map(custodianId => ({
            custodianId: parseInt(custodianId)
          }))
        }
      },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        custodians: {
          include: {
            custodian: {
              include: {
                organization: true
              }
            }
          }
        }
      }
    });
    
    res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
};

// Update collection
const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, type, platform, scheduledDate, completedDate, notes, matterId, organizationId, custodianIds } = req.body;
    
    // Check if collection exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingCollection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    // Validate required fields
    if (!type || !matterId || !custodianIds || !Array.isArray(custodianIds) || custodianIds.length === 0) {
      return res.status(400).json({ error: 'Type, matter, and at least one custodian are required' });
    }
    
    // Verify the matter exists
    const matter = await prisma.matter.findUnique({
      where: { id: matterId }
    });
    
    if (!matter) {
      return res.status(400).json({ error: 'Matter not found' });
    }
    
    // Verify all custodians exist
    const custodians = await prisma.custodian.findMany({
      where: { id: { in: custodianIds.map(id => parseInt(id)) } }
    });
    
    if (custodians.length !== custodianIds.length) {
      return res.status(400).json({ error: 'One or more custodians not found' });
    }
    
    // If organization is provided, verify it exists and is a vendor
    if (organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
      });
      
      if (!organization || organization.type !== 'VENDOR') {
        return res.status(400).json({ error: 'Organization must be of type VENDOR' });
      }
    }
    
    const collection = await prisma.collection.update({
      where: { id: parseInt(id) },
      data: {
        status,
        type,
        platform: platform || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        completedDate: completedDate ? new Date(completedDate) : null,
        notes: notes || null,
        matterId,
        organizationId: organizationId || null,
        custodians: {
          deleteMany: {}, // Remove all existing custodian relationships
          create: custodianIds.map(custodianId => ({
            custodianId: parseInt(custodianId)
          }))
        }
      },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        custodians: {
          include: {
            custodian: {
              include: {
                organization: true
              }
            }
          }
        }
      }
    });
    
    res.json(collection);
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
};

// Delete collection
const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if collection exists
    const existingCollection = await prisma.collection.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingCollection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    
    await prisma.collection.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
};

module.exports = {
  getCollections,
  getCollectionById,
  getCollectionsByMatter,
  getCollectionStatusOptions,
  getCollectionTypeOptions,
  getEmailPlatformOptions,
  createCollection,
  updateCollection,
  deleteCollection
};
