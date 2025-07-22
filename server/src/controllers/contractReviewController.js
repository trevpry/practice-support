const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all contract reviews
const getContractReviews = async (req, res) => {
  try {
    const contractReviews = await prisma.contractReview.findMany({
      include: {
        matter: {
          include: {
            client: true
          }
        },
        vendorOrganization: true,
        reviewManager: true,
        workspace: true,
        estimates: {
          include: {
            organization: true
          }
        },
        vendorAgreements: {
          include: {
            organization: true
          }
        },
        invoices: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(contractReviews);
  } catch (error) {
    console.error('Error fetching contract reviews:', error);
    res.status(500).json({ error: 'Failed to fetch contract reviews' });
  }
};

// Get contract review by ID
const getContractReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const contractReview = await prisma.contractReview.findUnique({
      where: { id: parseInt(id) },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        vendorOrganization: true,
        reviewManager: true,
        workspace: true,
        estimates: {
          include: {
            organization: true
          }
        },
        vendorAgreements: {
          include: {
            organization: true
          }
        },
        invoices: true
      }
    });

    if (!contractReview) {
      return res.status(404).json({ error: 'Contract review not found' });
    }

    res.json(contractReview);
  } catch (error) {
    console.error('Error fetching contract review:', error);
    res.status(500).json({ error: 'Failed to fetch contract review' });
  }
};

// Create new contract review
const createContractReview = async (req, res) => {
  try {
    const {
      reviewDocumentCount,
      matterId,
      vendorOrganizationId,
      reviewManagerId,
      workspaceId,
      status,
      startDate,
      endDate,
      batchTitle,
      estimateIds,
      agreementIds,
      invoiceIds
    } = req.body;

    // Validate required fields
    if (!reviewDocumentCount || !matterId || !vendorOrganizationId || !workspaceId) {
      return res.status(400).json({ 
        error: 'Missing required fields: reviewDocumentCount, matterId, vendorOrganizationId, workspaceId' 
      });
    }

    // Validate that the vendor organization is actually a vendor
    const vendorOrg = await prisma.organization.findUnique({
      where: { id: parseInt(vendorOrganizationId) }
    });

    if (!vendorOrg || vendorOrg.type !== 'VENDOR') {
      return res.status(400).json({ error: 'Selected organization must be of type VENDOR' });
    }

    // Validate that the review manager is linked to the vendor organization (if provided)
    if (reviewManagerId) {
      const reviewManager = await prisma.person.findUnique({
        where: { id: parseInt(reviewManagerId) }
      });

      if (!reviewManager || reviewManager.organizationId !== parseInt(vendorOrganizationId)) {
        return res.status(400).json({ error: 'Review manager must be linked to the selected vendor organization' });
      }
    }

    // Validate status if provided
    const validStatuses = ['Discussing', 'In Progress', 'Completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: Discussing, In Progress, Completed' });
    }

    const contractReview = await prisma.contractReview.create({
      data: {
        reviewDocumentCount: parseInt(reviewDocumentCount),
        matterId: parseInt(matterId),
        vendorOrganizationId: parseInt(vendorOrganizationId),
        reviewManagerId: reviewManagerId ? parseInt(reviewManagerId) : null,
        workspaceId: parseInt(workspaceId),
        status: status || 'Discussing',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        batchTitle: batchTitle || null,
        estimates: estimateIds && estimateIds.length > 0 ? {
          connect: estimateIds.map(id => ({ id: parseInt(id) }))
        } : undefined,
        vendorAgreements: agreementIds && agreementIds.length > 0 ? {
          connect: agreementIds.map(id => ({ id: parseInt(id) }))
        } : undefined,
        invoices: invoiceIds && invoiceIds.length > 0 ? {
          connect: invoiceIds.map(id => ({ id: parseInt(id) }))
        } : undefined
      },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        vendorOrganization: true,
        reviewManager: true,
        workspace: true,
        estimates: {
          include: {
            organization: true
          }
        },
        vendorAgreements: {
          include: {
            organization: true
          }
        },
        invoices: true
      }
    });

    res.status(201).json(contractReview);
  } catch (error) {
    console.error('Error creating contract review:', error);
    res.status(500).json({ error: 'Failed to create contract review' });
  }
};

// Update contract review
const updateContractReview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      reviewDocumentCount,
      matterId,
      vendorOrganizationId,
      reviewManagerId,
      workspaceId,
      status,
      startDate,
      endDate,
      batchTitle,
      estimateIds,
      agreementIds,
      invoiceIds
    } = req.body;

    // Check if contract review exists
    const existingReview = await prisma.contractReview.findUnique({
      where: { id: parseInt(id) },
      include: {
        estimates: true,
        vendorAgreements: true,
        invoices: true
      }
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Contract review not found' });
    }

    // Validate vendor organization if provided
    if (vendorOrganizationId) {
      const vendorOrg = await prisma.organization.findUnique({
        where: { id: parseInt(vendorOrganizationId) }
      });

      if (!vendorOrg || vendorOrg.type !== 'VENDOR') {
        return res.status(400).json({ error: 'Selected organization must be of type VENDOR' });
      }
    }

    // Validate review manager if provided
    if (reviewManagerId && vendorOrganizationId) {
      const reviewManager = await prisma.person.findUnique({
        where: { id: parseInt(reviewManagerId) }
      });

      if (!reviewManager || reviewManager.organizationId !== parseInt(vendorOrganizationId)) {
        return res.status(400).json({ error: 'Review manager must be linked to the selected vendor organization' });
      }
    }

    // Validate status if provided
    const validStatuses = ['Discussing', 'In Progress', 'Completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: Discussing, In Progress, Completed' });
    }

    const updateData = {};
    if (reviewDocumentCount !== undefined) updateData.reviewDocumentCount = parseInt(reviewDocumentCount);
    if (matterId !== undefined) updateData.matterId = parseInt(matterId);
    if (vendorOrganizationId !== undefined) updateData.vendorOrganizationId = parseInt(vendorOrganizationId);
    if (reviewManagerId !== undefined) updateData.reviewManagerId = reviewManagerId ? parseInt(reviewManagerId) : null;
    if (workspaceId !== undefined) updateData.workspaceId = parseInt(workspaceId);
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (batchTitle !== undefined) updateData.batchTitle = batchTitle || null;

    // Handle linked items updates
    if (estimateIds !== undefined) {
      // Disconnect existing estimates and connect new ones
      updateData.estimates = {
        set: estimateIds.map(id => ({ id: parseInt(id) }))
      };
    }

    if (agreementIds !== undefined) {
      // Disconnect existing agreements and connect new ones
      updateData.vendorAgreements = {
        set: agreementIds.map(id => ({ id: parseInt(id) }))
      };
    }

    if (invoiceIds !== undefined) {
      // Disconnect existing invoices and connect new ones
      updateData.invoices = {
        set: invoiceIds.map(id => ({ id: parseInt(id) }))
      };
    }

    const contractReview = await prisma.contractReview.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        matter: {
          include: {
            client: true
          }
        },
        vendorOrganization: true,
        reviewManager: true,
        workspace: true,
        estimates: {
          include: {
            organization: true
          }
        },
        vendorAgreements: {
          include: {
            organization: true
          }
        },
        invoices: true
      }
    });

    res.json(contractReview);
  } catch (error) {
    console.error('Error updating contract review:', error);
    res.status(500).json({ error: 'Failed to update contract review' });
  }
};

// Delete contract review
const deleteContractReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if contract review exists
    const existingReview = await prisma.contractReview.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Contract review not found' });
    }

    await prisma.contractReview.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Contract review deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract review:', error);
    res.status(500).json({ error: 'Failed to delete contract review' });
  }
};

module.exports = {
  getContractReviews,
  getContractReviewById,
  createContractReview,
  updateContractReview,
  deleteContractReview
};
