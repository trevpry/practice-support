const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SignedBy = {
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  PARTNER: 'PARTNER',
  CLIENT: 'CLIENT'
};

// Get all vendor agreements
exports.getVendorAgreements = async (req, res) => {
  try {
    const agreements = await prisma.vendorAgreement.findMany({
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        estimate: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(agreements);
  } catch (error) {
    console.error('Error fetching vendor agreements:', error);
    res.status(500).json({ error: 'Failed to fetch vendor agreements' });
  }
};

// Get vendor agreements by matter ID
exports.getVendorAgreementsByMatter = async (req, res) => {
  try {
    const { matterId } = req.params;
    const agreements = await prisma.vendorAgreement.findMany({
      where: { matterId: parseInt(matterId) },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        estimate: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(agreements);
  } catch (error) {
    console.error('Error fetching vendor agreements by matter:', error);
    res.status(500).json({ error: 'Failed to fetch vendor agreements for matter' });
  }
};

// Get vendor agreement by ID
exports.getVendorAgreementById = async (req, res) => {
  try {
    const { id } = req.params;
    const agreement = await prisma.vendorAgreement.findUnique({
      where: { id: parseInt(id) },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        estimate: true
      }
    });
    
    if (!agreement) {
      return res.status(404).json({ error: 'Vendor agreement not found' });
    }
    
    res.json(agreement);
  } catch (error) {
    console.error('Error fetching vendor agreement:', error);
    res.status(500).json({ error: 'Failed to fetch vendor agreement' });
  }
};

// Create vendor agreement
exports.createVendorAgreement = async (req, res) => {
  try {
    const {
      agreementText,
      signedBy,
      matterId,
      organizationId,
      estimateId
    } = req.body;

    // Validate required fields
    if (!agreementText || !signedBy || !matterId || !organizationId) {
      return res.status(400).json({ 
        error: 'Agreement text, signed by, matter ID, and organization ID are required' 
      });
    }

    // Validate signedBy value
    if (!Object.values(SignedBy).includes(signedBy)) {
      return res.status(400).json({ 
        error: 'Invalid signedBy value. Must be PROJECT_MANAGER, PARTNER, or CLIENT' 
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
        error: 'Organization must be of type VENDOR to create agreements' 
      });
    }

    // Validate estimate exists and belongs to the same matter and organization if provided
    if (estimateId) {
      const estimate = await prisma.estimate.findUnique({
        where: { id: parseInt(estimateId) }
      });
      
      if (!estimate) {
        return res.status(400).json({ error: 'Invalid estimate ID' });
      }

      if (estimate.matterId !== parseInt(matterId)) {
        return res.status(400).json({ 
          error: 'Estimate must belong to the same matter' 
        });
      }

      if (estimate.organizationId !== parseInt(organizationId)) {
        return res.status(400).json({ 
          error: 'Estimate must belong to the same vendor organization' 
        });
      }
    }

    const agreement = await prisma.vendorAgreement.create({
      data: {
        agreementText,
        signedBy,
        matterId: parseInt(matterId),
        organizationId: parseInt(organizationId),
        estimateId: estimateId ? parseInt(estimateId) : null
      },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        estimate: true
      }
    });
    
    res.status(201).json(agreement);
  } catch (error) {
    console.error('Error creating vendor agreement:', error);
    res.status(500).json({ error: 'Failed to create vendor agreement' });
  }
};

// Update vendor agreement
exports.updateVendorAgreement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      agreementText,
      signedBy,
      matterId,
      organizationId,
      estimateId
    } = req.body;

    // Validate signedBy value if provided
    if (signedBy && !Object.values(SignedBy).includes(signedBy)) {
      return res.status(400).json({ 
        error: 'Invalid signedBy value. Must be PROJECT_MANAGER, PARTNER, or CLIENT' 
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
          error: 'Organization must be of type VENDOR to create agreements' 
        });
      }
    }

    // Validate estimate if provided
    if (estimateId) {
      const estimate = await prisma.estimate.findUnique({
        where: { id: parseInt(estimateId) }
      });
      
      if (!estimate) {
        return res.status(400).json({ error: 'Invalid estimate ID' });
      }

      // Get current agreement to check matter and organization consistency
      const currentAgreement = await prisma.vendorAgreement.findUnique({
        where: { id: parseInt(id) }
      });

      const finalMatterId = matterId ? parseInt(matterId) : currentAgreement.matterId;
      const finalOrgId = organizationId ? parseInt(organizationId) : currentAgreement.organizationId;

      if (estimate.matterId !== finalMatterId) {
        return res.status(400).json({ 
          error: 'Estimate must belong to the same matter' 
        });
      }

      if (estimate.organizationId !== finalOrgId) {
        return res.status(400).json({ 
          error: 'Estimate must belong to the same vendor organization' 
        });
      }
    }

    const agreement = await prisma.vendorAgreement.update({
      where: { id: parseInt(id) },
      data: {
        ...(agreementText !== undefined && { agreementText }),
        ...(signedBy && { signedBy }),
        ...(matterId && { matterId: parseInt(matterId) }),
        ...(organizationId && { organizationId: parseInt(organizationId) }),
        ...(estimateId !== undefined && { estimateId: estimateId ? parseInt(estimateId) : null })
      },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        estimate: true
      }
    });
    
    res.json(agreement);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vendor agreement not found' });
    }
    console.error('Error updating vendor agreement:', error);
    res.status(500).json({ error: 'Failed to update vendor agreement' });
  }
};

// Delete vendor agreement
exports.deleteVendorAgreement = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.vendorAgreement.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Vendor agreement not found' });
    }
    console.error('Error deleting vendor agreement:', error);
    res.status(500).json({ error: 'Failed to delete vendor agreement' });
  }
};

// Get signed by options
exports.getSignedByOptions = async (req, res) => {
  try {
    const options = Object.values(SignedBy).map(option => ({
      value: option,
      label: option.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }));
    res.json(options);
  } catch (error) {
    console.error('Error fetching signed by options:', error);
    res.status(500).json({ error: 'Failed to fetch signed by options' });
  }
};
