const express = require('express');
const router = express.Router();
const {
  getWorkspaces,
  getWorkspaceById,
  getWorkspacesByMatter,
  getWorkspaceTypeOptions,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
} = require('../controllers/workspaceController');

// Get all workspaces
router.get('/', getWorkspaces);

// Get workspace type options
router.get('/type-options', getWorkspaceTypeOptions);

// Get workspaces by matter ID
router.get('/matter/:matterId', getWorkspacesByMatter);

// Get workspace by ID
router.get('/:id', getWorkspaceById);

// Create new workspace
router.post('/', createWorkspace);

// Update workspace
router.put('/:id', updateWorkspace);

// Delete workspace
router.delete('/:id', deleteWorkspace);

module.exports = router;
