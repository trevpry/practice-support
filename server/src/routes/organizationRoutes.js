const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// Get all organizations
router.get('/', organizationController.getOrganizations);

// Get organization types
router.get('/types', organizationController.getOrganizationTypes);

// Get organization by ID
router.get('/:id', organizationController.getOrganizationById);

// Create organization
router.post('/', organizationController.createOrganization);

// Update organization
router.put('/:id', organizationController.updateOrganization);

// Delete organization
router.delete('/:id', organizationController.deleteOrganization);

module.exports = router;
