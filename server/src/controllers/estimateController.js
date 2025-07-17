const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all estimates
exports.getEstimates = async (req, res) => {
  try {
    const estimates = await prisma.estimate.findMany({
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(estimates);
  } catch (error) {
    console.error('Error fetching estimates:', error);
    res.status(500).json({ error: 'Failed to fetch estimates' });
  }
};

// Get estimates by matter ID
exports.getEstimatesByMatter = async (req, res) => {
  try {
    const { matterId } = req.params;
    const estimates = await prisma.estimate.findMany({
      where: { matterId: parseInt(matterId) },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(estimates);
  } catch (error) {
    console.error('Error fetching estimates by matter:', error);
    res.status(500).json({ error: 'Failed to fetch estimates for matter' });
  }
};

// Get estimate by ID
exports.getEstimateById = async (req, res) => {
  try {
    const { id } = req.params;
    const estimate = await prisma.estimate.findUnique({
      where: { id: parseInt(id) },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        vendorAgreements: {
          include: {
            matter: true,
            organization: true
          }
        }
      }
    });
    
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }
    
    res.json(estimate);
  } catch (error) {
    console.error('Error fetching estimate:', error);
    res.status(500).json({ error: 'Failed to fetch estimate' });
  }
};

// Create estimate
exports.createEstimate = async (req, res) => {
  try {
    const {
      description,
      totalCost,
      matterId,
      organizationId
    } = req.body;

    // Validate required fields
    if (!description || totalCost === undefined || !matterId || !organizationId) {
      return res.status(400).json({ 
        error: 'Description, total cost, matter ID, and organization ID are required' 
      });
    }

    // Validate total cost is a number
    if (isNaN(totalCost) || totalCost < 0) {
      return res.status(400).json({ 
        error: 'Total cost must be a valid positive number' 
      });
    }

    // Validate matter exists
    const matter = await prisma.matter.findUnique({
      where: { id: parseInt(matterId) }
    });
    
    if (!matter) {
      return res.status(400).json({ error: 'Invalid matter ID' });
    }

    // Validate organization exists and is a vendor
    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(organizationId) }
    });
    
    if (!organization) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    if (organization.type !== 'VENDOR') {
      return res.status(400).json({ 
        error: 'Organization must be of type VENDOR to create estimates' 
      });
    }

    const estimate = await prisma.estimate.create({
      data: {
        description,
        totalCost: parseFloat(totalCost),
        matterId: parseInt(matterId),
        organizationId: parseInt(organizationId)
      },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true
      }
    });
    
    res.status(201).json(estimate);
  } catch (error) {
    console.error('Error creating estimate:', error);
    res.status(500).json({ error: 'Failed to create estimate' });
  }
};

// Update estimate
exports.updateEstimate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      totalCost,
      matterId,
      organizationId
    } = req.body;

    // Validate total cost if provided
    if (totalCost !== undefined && (isNaN(totalCost) || totalCost < 0)) {
      return res.status(400).json({ 
        error: 'Total cost must be a valid positive number' 
      });
    }

    // Validate matter exists if provided
    if (matterId) {
      const matter = await prisma.matter.findUnique({
        where: { id: parseInt(matterId) }
      });
      
      if (!matter) {
        return res.status(400).json({ error: 'Invalid matter ID' });
      }
    }

    // Validate organization exists and is a vendor if provided
    if (organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: parseInt(organizationId) }
      });
      
      if (!organization) {
        return res.status(400).json({ error: 'Invalid organization ID' });
      }

      if (organization.type !== 'VENDOR') {
        return res.status(400).json({ 
          error: 'Organization must be of type VENDOR to create estimates' 
        });
      }
    }

    const estimate = await prisma.estimate.update({
      where: { id: parseInt(id) },
      data: {
        ...(description !== undefined && { description }),
        ...(totalCost !== undefined && { totalCost: parseFloat(totalCost) }),
        ...(matterId && { matterId: parseInt(matterId) }),
        ...(organizationId && { organizationId: parseInt(organizationId) })
      },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true
      }
    });
    
    res.json(estimate);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Estimate not found' });
    }
    console.error('Error updating estimate:', error);
    res.status(500).json({ error: 'Failed to update estimate' });
  }
};

// Delete estimate
exports.deleteEstimate = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.estimate.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Estimate not found' });
    }
    console.error('Error deleting estimate:', error);
    res.status(500).json({ error: 'Failed to delete estimate' });
  }
};
