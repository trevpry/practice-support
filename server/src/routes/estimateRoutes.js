const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimateController');

// Get all estimates
router.get('/', estimateController.getEstimates);

// Get estimates by matter ID
router.get('/matter/:matterId', estimateController.getEstimatesByMatter);

// Get estimate by ID
router.get('/:id', estimateController.getEstimateById);

// Create estimate
router.post('/', estimateController.createEstimate);

// Update estimate
router.put('/:id', estimateController.updateEstimate);

// Delete estimate
router.delete('/:id', estimateController.deleteEstimate);

module.exports = router;
