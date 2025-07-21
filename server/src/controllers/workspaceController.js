const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all workspaces
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
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
    res.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
};

// Get workspace by ID
const getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await prisma.workspace.findUnique({
      where: { id: parseInt(id) },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true
      }
    });
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    res.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ error: 'Failed to fetch workspace' });
  }
};

// Get workspaces by matter ID
const getWorkspacesByMatter = async (req, res) => {
  try {
    const { matterId } = req.params;
    const workspaces = await prisma.workspace.findMany({
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
    res.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces for matter:', error);
    res.status(500).json({ error: 'Failed to fetch workspaces for matter' });
  }
};

// Get workspace type options
const getWorkspaceTypeOptions = async (req, res) => {
  try {
    const typeOptions = [
      { value: 'ECA', label: 'ECA' },
      { value: 'REVIEW', label: 'Review' },
      { value: 'RSMF', label: 'RSMF' },
      { value: 'OTHER', label: 'Other' }
    ];
    res.json(typeOptions);
  } catch (error) {
    console.error('Error fetching workspace type options:', error);
    res.status(500).json({ error: 'Failed to fetch workspace type options' });
  }
};

// Create workspace
const createWorkspace = async (req, res) => {
  try {
    const { url, type, matterId, organizationId } = req.body;
    
    // Validate required fields
    if (!url || !type || !matterId || !organizationId) {
      return res.status(400).json({ error: 'URL, type, matter, and organization are required' });
    }
    
    // Verify the matter exists
    const matter = await prisma.matter.findUnique({
      where: { id: matterId }
    });
    
    if (!matter) {
      return res.status(400).json({ error: 'Matter not found' });
    }
    
    // Verify the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });
    
    if (!organization) {
      return res.status(400).json({ error: 'Organization not found' });
    }
    
    const workspace = await prisma.workspace.create({
      data: {
        url,
        type,
        matterId,
        organizationId
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
    
    res.status(201).json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ error: 'Failed to create workspace' });
  }
};

// Update workspace
const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, type, matterId, organizationId } = req.body;
    
    // Check if workspace exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingWorkspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    // Validate required fields
    if (!url || !type || !matterId || !organizationId) {
      return res.status(400).json({ error: 'URL, type, matter, and organization are required' });
    }
    
    // Verify the matter exists
    const matter = await prisma.matter.findUnique({
      where: { id: matterId }
    });
    
    if (!matter) {
      return res.status(400).json({ error: 'Matter not found' });
    }
    
    // Verify the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });
    
    if (!organization) {
      return res.status(400).json({ error: 'Organization not found' });
    }
    
    const workspace = await prisma.workspace.update({
      where: { id: parseInt(id) },
      data: {
        url,
        type,
        matterId,
        organizationId
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
    
    res.json(workspace);
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ error: 'Failed to update workspace' });
  }
};

// Delete workspace
const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingWorkspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    
    await prisma.workspace.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ error: 'Failed to delete workspace' });
  }
};

module.exports = {
  getWorkspaces,
  getWorkspaceById,
  getWorkspacesByMatter,
  getWorkspaceTypeOptions,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
};
