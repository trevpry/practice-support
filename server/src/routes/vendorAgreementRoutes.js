const express = require('express');
const router = express.Router();
const vendorAgreementController = require('../controllers/vendorAgreementController');

// Get all vendor agreements
router.get('/', vendorAgreementController.getVendorAgreements);

// Get vendor agreements by matter ID
router.get('/matter/:matterId', vendorAgreementController.getVendorAgreementsByMatter);

// Get signed by options
router.get('/signed-by-options', vendorAgreementController.getSignedByOptions);

// Get vendor agreement by ID
router.get('/:id', vendorAgreementController.getVendorAgreementById);

// Create vendor agreement
router.post('/', vendorAgreementController.createVendorAgreement);

// Update vendor agreement
router.put('/:id', vendorAgreementController.updateVendorAgreement);

// Delete vendor agreement
router.delete('/:id', vendorAgreementController.deleteVendorAgreement);

module.exports = router;
