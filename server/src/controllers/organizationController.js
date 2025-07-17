const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const OrganizationType = {
  CURRENT_LAW_FIRM: 'CURRENT_LAW_FIRM',
  CO_COUNSEL: 'CO_COUNSEL',
  OPPOSING_COUNSEL: 'OPPOSING_COUNSEL',
  VENDOR: 'VENDOR',
  THIRD_PARTY: 'THIRD_PARTY'
};

// Get all organizations
exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        people: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
};

// Get organization by ID
exports.getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await prisma.organization.findUnique({
      where: { id: parseInt(id) },
      include: {
        people: true
      }
    });
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
};

// Create organization
exports.createOrganization = async (req, res) => {
  try {
    const {
      name,
      type,
      email,
      phone,
      website,
      streetAddress,
      city,
      state,
      zipCode,
      country,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ 
        error: 'Name and type are required' 
      });
    }

    // Validate organization type
    if (!Object.values(OrganizationType).includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid organization type' 
      });
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        type,
        email,
        phone,
        website,
        streetAddress,
        city,
        state,
        zipCode,
        country,
        notes
      }
    });
    
    res.status(201).json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

// Update organization
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      email,
      phone,
      website,
      streetAddress,
      city,
      state,
      zipCode,
      country,
      notes
    } = req.body;

    // Validate organization type if provided
    if (type && !Object.values(OrganizationType).includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid organization type' 
      });
    }

    const organization = await prisma.organization.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(streetAddress !== undefined && { streetAddress }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(country !== undefined && { country }),
        ...(notes !== undefined && { notes })
      }
    });
    
    res.json(organization);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
};

// Delete organization
exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if organization has people linked to it
    const peopleCount = await prisma.person.count({
      where: { organizationId: parseInt(id) }
    });
    
    if (peopleCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete organization with linked people. Please unlink people first.' 
      });
    }
    
    await prisma.organization.delete({
      where: { id: parseInt(id) }
    });
    
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Organization not found' });
    }
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
};

// Get organization types
exports.getOrganizationTypes = async (req, res) => {
  try {
    const types = Object.values(OrganizationType).map(type => ({
      value: type,
      label: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }));
    res.json(types);
  } catch (error) {
    console.error('Error fetching organization types:', error);
    res.status(500).json({ error: 'Failed to fetch organization types' });
  }
};
