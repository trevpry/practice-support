const express = require('express');
const router = express.Router();
const { 
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} = require('../controllers/clientController');

const {
  getMatters,
  getMattersByClient,
  getMatter,
  createMatter,
  updateMatter,
  deleteMatter
} = require('../controllers/matterController');

const {
  getPeople,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson
} = require('../controllers/personController');

// Client routes
router.get('/clients', getClients);
router.get('/clients/:id', getClient);
router.post('/clients', createClient);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

// Matter routes
router.get('/matters', getMatters);
router.get('/matters/:id', getMatter);
router.get('/clients/:clientId/matters', getMattersByClient);
router.post('/matters', createMatter);
router.put('/matters/:id', updateMatter);
router.delete('/matters/:id', deleteMatter);

// Person routes
router.get('/people', getPeople);
router.get('/people/:id', getPerson);
router.post('/people', createPerson);
router.put('/people/:id', updatePerson);
router.delete('/people/:id', deletePerson);

// Health check route
router.get('/health', (req, res) => {
  res.json({ message: 'Practice Support API is working!' });
});

module.exports = router;