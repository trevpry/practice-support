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
  updateMatterStatus,
  deleteMatter
} = require('../controllers/matterController');

const {
  getPeople,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson
} = require('../controllers/personController');

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByMatter,
  getTasksByPerson,
  getTasksForCurrentUser
} = require('../controllers/taskController');

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser
} = require('../controllers/userController');

// Organization routes
const organizationRoutes = require('./organizationRoutes');

// Estimate routes
const estimateRoutes = require('./estimateRoutes');

// Vendor Agreement routes
const vendorAgreementRoutes = require('./vendorAgreementRoutes');

// Invoice routes
const invoiceRoutes = require('./invoiceRoutes');

// Custodian routes
const custodianRoutes = require('./custodianRoutes');

// Collection routes
const collectionRoutes = require('./collectionRoutes');

// Workspace routes
const workspaceRoutes = require('./workspaceRoutes');

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
router.put('/matters/:id/status', updateMatterStatus);
router.delete('/matters/:id', deleteMatter);

// Person routes
router.get('/people', getPeople);
router.get('/people/:id', getPerson);
router.post('/people', createPerson);
router.put('/people/:id', updatePerson);
router.delete('/people/:id', deletePerson);

// Task routes
router.get('/tasks', getAllTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);
router.get('/matters/:matterId/tasks', getTasksByMatter);
router.get('/people/:personId/tasks', getTasksByPerson);
router.get('/auth/current-user/tasks', getTasksForCurrentUser);

// User routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/auth/current-user', getCurrentUser);

// Organization routes
router.use('/organizations', organizationRoutes);

// Estimate routes
router.use('/estimates', estimateRoutes);

// Vendor Agreement routes
router.use('/vendor-agreements', vendorAgreementRoutes);

// Invoice routes
router.use('/invoices', invoiceRoutes);

// Custodian routes
router.use('/custodians', custodianRoutes);

// Collection routes
router.use('/collections', collectionRoutes);

// Workspace routes
router.use('/workspaces', workspaceRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ message: 'Practice Support API is working!' });
});

module.exports = router;