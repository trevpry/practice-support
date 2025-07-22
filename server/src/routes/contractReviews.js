const express = require('express');
const router = express.Router();
const {
  getContractReviews,
  getContractReviewById,
  createContractReview,
  updateContractReview,
  deleteContractReview
} = require('../controllers/contractReviewController');

// GET /api/contract-reviews - Get all contract reviews
router.get('/', getContractReviews);

// GET /api/contract-reviews/:id - Get contract review by ID
router.get('/:id', getContractReviewById);

// POST /api/contract-reviews - Create new contract review
router.post('/', createContractReview);

// PUT /api/contract-reviews/:id - Update contract review
router.put('/:id', updateContractReview);

// DELETE /api/contract-reviews/:id - Delete contract review
router.delete('/:id', deleteContractReview);

module.exports = router;
