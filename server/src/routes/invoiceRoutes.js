const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  getInvoicesByMatter,
  getInvoiceStatusOptions,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

// Get all invoices
router.get('/', getInvoices);

// Get invoice status options (must come before /:id route)
router.get('/status-options', getInvoiceStatusOptions);

// Get invoice by ID
router.get('/:id', getInvoiceById);

// Get invoices by matter ID
router.get('/matter/:matterId', getInvoicesByMatter);

// Create new invoice
router.post('/', createInvoice);

// Update invoice
router.put('/:id', updateInvoice);

// Delete invoice
router.delete('/:id', deleteInvoice);

module.exports = router;
