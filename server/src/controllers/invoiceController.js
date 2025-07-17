const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        estimate: true,
        vendorAgreement: true
      },
      orderBy: {
        invoiceDate: 'desc'
      }
    });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        estimate: true,
        vendorAgreement: true
      }
    });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

// Get invoices by matter ID
const getInvoicesByMatter = async (req, res) => {
  try {
    const { matterId } = req.params;
    const invoices = await prisma.invoice.findMany({
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
        invoiceDate: 'desc'
      }
    });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices by matter:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Get available invoice status options
const getInvoiceStatusOptions = async (req, res) => {
  try {
    const statusOptions = ['RECEIVED', 'SUBMITTED', 'QUESTION', 'PAID'];
    res.json(statusOptions);
  } catch (error) {
    console.error('Error fetching invoice status options:', error);
    res.status(500).json({ error: 'Failed to fetch invoice status options' });
  }
};

// Create invoice
const createInvoice = async (req, res) => {
  try {
    const { invoiceDate, invoiceAmount, approved, status, matterId, organizationId, estimateId, vendorAgreementId } = req.body;
    
    // Validate required fields
    if (!invoiceDate || invoiceAmount === undefined || !matterId || !organizationId) {
      return res.status(400).json({ error: 'Invoice date, amount, matter, and organization are required' });
    }
    
    // Verify the organization is a vendor
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });
    
    if (!organization || organization.type !== 'VENDOR') {
      return res.status(400).json({ error: 'Organization must be of type VENDOR' });
    }
    
    // Verify the matter exists
    const matter = await prisma.matter.findUnique({
      where: { id: matterId }
    });
    
    if (!matter) {
      return res.status(400).json({ error: 'Matter not found' });
    }
    
    // If estimate is provided, verify it exists and belongs to the same matter and organization
    if (estimateId) {
      const estimate = await prisma.estimate.findUnique({
        where: { id: estimateId }
      });
      
      if (!estimate || estimate.matterId !== matterId || estimate.organizationId !== organizationId) {
        return res.status(400).json({ error: 'Estimate must belong to the same matter and organization' });
      }
    }
    
    // If vendor agreement is provided, verify it exists and belongs to the same matter and organization
    if (vendorAgreementId) {
      const vendorAgreement = await prisma.vendorAgreement.findUnique({
        where: { id: vendorAgreementId }
      });
      
      if (!vendorAgreement || vendorAgreement.matterId !== matterId || vendorAgreement.organizationId !== organizationId) {
        return res.status(400).json({ error: 'Vendor agreement must belong to the same matter and organization' });
      }
    }
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceDate: new Date(invoiceDate),
        invoiceAmount: parseFloat(invoiceAmount),
        approved: approved || false,
        status: status || 'RECEIVED',
        matterId,
        organizationId,
        estimateId: estimateId || null,
        vendorAgreementId: vendorAgreementId || null
      },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        estimate: true,
        vendorAgreement: true
      }
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { invoiceDate, invoiceAmount, approved, status, matterId, organizationId, estimateId, vendorAgreementId } = req.body;
    
    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Validate required fields
    if (!invoiceDate || invoiceAmount === undefined || !matterId || !organizationId) {
      return res.status(400).json({ error: 'Invoice date, amount, matter, and organization are required' });
    }
    
    // Verify the organization is a vendor
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });
    
    if (!organization || organization.type !== 'VENDOR') {
      return res.status(400).json({ error: 'Organization must be of type VENDOR' });
    }
    
    // Verify the matter exists
    const matter = await prisma.matter.findUnique({
      where: { id: matterId }
    });
    
    if (!matter) {
      return res.status(400).json({ error: 'Matter not found' });
    }
    
    // If estimate is provided, verify it exists and belongs to the same matter and organization
    if (estimateId) {
      const estimate = await prisma.estimate.findUnique({
        where: { id: estimateId }
      });
      
      if (!estimate || estimate.matterId !== matterId || estimate.organizationId !== organizationId) {
        return res.status(400).json({ error: 'Estimate must belong to the same matter and organization' });
      }
    }
    
    // If vendor agreement is provided, verify it exists and belongs to the same matter and organization
    if (vendorAgreementId) {
      const vendorAgreement = await prisma.vendorAgreement.findUnique({
        where: { id: vendorAgreementId }
      });
      
      if (!vendorAgreement || vendorAgreement.matterId !== matterId || vendorAgreement.organizationId !== organizationId) {
        return res.status(400).json({ error: 'Vendor agreement must belong to the same matter and organization' });
      }
    }
    
    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        invoiceDate: new Date(invoiceDate),
        invoiceAmount: parseFloat(invoiceAmount),
        approved,
        status,
        matterId,
        organizationId,
        estimateId: estimateId || null,
        vendorAgreementId: vendorAgreementId || null
      },
      include: {
        matter: {
          include: {
            client: true
          }
        },
        organization: true,
        estimate: true,
        vendorAgreement: true
      }
    });
    
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    await prisma.invoice.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  getInvoicesByMatter,
  getInvoiceStatusOptions,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
