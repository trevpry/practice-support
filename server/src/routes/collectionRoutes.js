const express = require('express');
const router = express.Router();
const {
  getCollections,
  getCollectionById,
  getCollectionsByMatter,
  getCollectionStatusOptions,
  getCollectionTypeOptions,
  createCollection,
  updateCollection,
  deleteCollection
} = require('../controllers/collectionController');

// Routes
router.get('/', getCollections);
router.get('/status-options', getCollectionStatusOptions);
router.get('/type-options', getCollectionTypeOptions);
router.get('/matter/:matterId', getCollectionsByMatter);
router.get('/:id', getCollectionById);
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

module.exports = router;
