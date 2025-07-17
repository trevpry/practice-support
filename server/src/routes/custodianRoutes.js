const express = require('express');
const router = express.Router();
const {
  getCustodians,
  getCustodianById,
  createCustodian,
  updateCustodian,
  deleteCustodian
} = require('../controllers/custodianController');

// Routes
router.get('/', getCustodians);
router.get('/:id', getCustodianById);
router.post('/', createCustodian);
router.put('/:id', updateCustodian);
router.delete('/:id', deleteCustodian);

module.exports = router;
