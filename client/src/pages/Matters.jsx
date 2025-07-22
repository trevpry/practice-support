import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, FileText, Eye, DollarSign, Receipt, FileSignature, Users, Database, Search, FileOutput, X, LayoutGrid, List, Calendar, User, Building } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Matter status configuration for Kanban board
const MATTER_STATUSES = ['COLLECTION', 'CULLING', 'REVIEW', 'PRODUCTION', 'INACTIVE'];

const Matters = () => {
  const location = useLocation();
  const [matters, setMatters] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatter, setEditingMatter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMattersModal, setShowMattersModal] = useState(false);
  const [mattersList, setMattersList] = useState([]);
  const [mattersLoading, setMattersLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [formData, setFormData] = useState({
    matterName: '',
    matterNumber: '',
    clientId: '',
    status: 'COLLECTION'
  });

  // Format matter status for display
  const formatMatterStatus = (status) => {
    return status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Collection';
  };

  // Get matter status color
  const getMatterStatusColor = (status) => {
    switch (status) {
      case 'COLLECTION': return 'bg-blue-100 text-blue-800';
      case 'CULLING': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW': return 'bg-orange-100 text-orange-800';
      case 'PRODUCTION': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Format status for display
  const formatStatus = (status) => {
    return formatMatterStatus(status);
  };

  // Get status color
  const getStatusColor = (status) => {
    return getMatterStatusColor(status);
  };

  // Filter matters based on search term
  const filteredMatters = matters.filter(matter => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      matter.matterName.toLowerCase().includes(searchLower) ||
      matter.matterNumber.toLowerCase().includes(searchLower) ||
      matter.client.clientName.toLowerCase().includes(searchLower) ||
      matter.client.clientNumber.toLowerCase().includes(searchLower) ||
      formatMatterStatus(matter.status).toLowerCase().includes(searchLower)
    );
  });

  // Calculate matter status counts for all matters
  const matterStatusCounts = matters.reduce((acc, matter) => {
    const status = matter.status || 'COLLECTION';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Fetch matters and clients
  const fetchData = async () => {
    try {
      const [mattersResponse, clientsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/matters`),
        fetch(`${API_BASE_URL}/clients`)
      ]);

      if (!mattersResponse.ok || !clientsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [mattersData, clientsData] = await Promise.all([
        mattersResponse.json(),
        clientsResponse.json()
      ]);

      setMatters(mattersData);
      setClients(clientsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle drag end for Kanban board
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If no destination, return
    if (!destination) return;

    // If dropped in the same position, return
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Find the matter being dragged
    const matter = matters.find(m => m.id === parseInt(draggableId));
    if (!matter) return;

    // Update the matter status
    const newStatus = destination.droppableId;
    
    try {
      const response = await fetch(`${API_BASE_URL}/matters/${matter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...matter,
          status: newStatus,
          clientId: matter.client.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update matter status');
      }

      // Refresh the data
      fetchData();
    } catch (error) {
      console.error('Error updating matter status:', error);
      alert('Failed to update matter status');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-open edit modal if navigated from detail page
  useEffect(() => {
    if (location.state?.editMatterId && matters.length > 0) {
      const matterToEdit = matters.find(matter => matter.id === location.state.editMatterId);
      if (matterToEdit) {
        handleEdit(matterToEdit);
      }
    }
  }, [matters, location.state]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingMatter 
        ? `${API_BASE_URL}/matters/${editingMatter.id}`
        : `${API_BASE_URL}/matters`;
      
      const method = editingMatter ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clientId: parseInt(formData.clientId)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save matter');
      }

      await fetchData();
      setIsModalOpen(false);
      setEditingMatter(null);
      setFormData({ matterName: '', matterNumber: '', clientId: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this matter?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/matters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete matter');

      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open modal for editing
  const handleEdit = (matter) => {
    setEditingMatter(matter);
    setFormData({
      matterName: matter.matterName,
      matterNumber: matter.matterNumber,
      clientId: matter.clientId.toString(),
      status: matter.status || 'COLLECTION'
    });
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    setEditingMatter(null);
    setFormData({ matterName: '', matterNumber: '', clientId: '', status: 'COLLECTION' });
    setIsModalOpen(true);
  };

  const fetchMattersWithProjectManagers = async () => {
    setMattersLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/matters`);
      if (response.ok) {
        const allMatters = await response.json();
        
        // Filter out inactive matters and get those with project managers
        const activeMatters = allMatters.filter(matter => 
          matter.status !== 'INACTIVE'
        );

        // Transform the data to include project manager information
        const mattersWithPMs = activeMatters.map(matter => {
          const projectManager = matter.client?.projectManager || null;
          return {
            id: matter.id,
            matterName: matter.matterName,
            matterNumber: matter.matterNumber,
            status: matter.status,
            clientName: matter.client?.clientName || 'Unknown Client',
            projectManager: projectManager ? {
              firstName: projectManager.firstName,
              lastName: projectManager.lastName,
              email: projectManager.email
            } : null
          };
        });

        setMattersList(mattersWithPMs);
        setShowMattersModal(true);
      }
    } catch (error) {
      console.error('Error fetching matters with project managers:', error);
    } finally {
      setMattersLoading(false);
    }
  };

  // MatterCard component for Kanban board
  const MatterCard = ({ matter, index }) => (
    <Draggable draggableId={matter.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg rotate-3' : ''
          }`}
        >
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 text-sm leading-tight">
              {matter.matterName}
            </h3>
            <p className="text-xs text-gray-600">
              {matter.matterNumber}
            </p>
            <p className="text-xs text-gray-500">
              {matter.client.clientName}
            </p>
            
            {/* Team information */}
            {matter.people && matter.people.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {matter.people.slice(0, 3).map((person) => (
                  <span 
                    key={person.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {(person.firstName && person.firstName[0]) || '?'}{(person.lastName && person.lastName[0]) || '?'}
                  </span>
                ))}
                {matter.people.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                    +{matter.people.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-center py-8 text-red-600">Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matters</h1>
            <p className="text-gray-600">
              Manage client matters • {matters.length} total {matters.length === 1 ? 'matter' : 'matters'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={fetchMattersWithProjectManagers}
              disabled={mattersLoading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <FileOutput className="w-4 h-4 mr-2" />
              {mattersLoading ? 'Loading...' : 'Matters Report'}
            </Button>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Matter
            </Button>
          </div>
        </div>

        {/* All Matters by Status */}
        {matters.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Matters by Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['COLLECTION', 'CULLING', 'REVIEW', 'PRODUCTION', 'INACTIVE'].map(status => (
                <div key={status} className="text-center">
                  <div className={`px-3 py-2 rounded-full text-sm font-medium ${getMatterStatusColor(status)}`}>
                    {formatMatterStatus(status)}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {matterStatusCounts[status] || 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Search Matters</h2>
            <span className="text-sm text-gray-500">
              {searchTerm ? `${filteredMatters.length} of ${matters.length} matters` : `${matters.length} total matters`}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search matters by name, number, client, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">View Options</h2>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4 mr-2 inline" />
                List View
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4 mr-2 inline" />
                Kanban Board
              </button>
            </div>
          </div>
        </div>

        {/* Matter-related sections navigation */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Matter-Related Sections</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/estimates">
              <Button variant="outline" className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Estimates
              </Button>
            </Link>
            <Link to="/vendor-agreements">
              <Button variant="outline" className="flex items-center">
                <FileSignature className="w-4 h-4 mr-2" />
                Agreements
              </Button>
            </Link>
            <Link to="/invoices">
              <Button variant="outline" className="flex items-center">
                <Receipt className="w-4 h-4 mr-2" />
                Invoices
              </Button>
            </Link>
            <Link to="/custodians">
              <Button variant="outline" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Custodians
              </Button>
            </Link>
            <Link to="/collections">
              <Button variant="outline" className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Collections
              </Button>
            </Link>
          </div>
        </div>

        {filteredMatters.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No matters found' : 'No matters'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new matter.'}
            </p>
          </div>
        ) : viewMode === 'kanban' ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {MATTER_STATUSES.map(status => {
                const statusMatters = filteredMatters.filter(matter => matter.status === status);
                return (
                  <div key={status} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-medium text-sm px-3 py-1 rounded-full ${getMatterStatusColor(status)}`}>
                        {formatStatus(status)}
                      </h3>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                        {statusMatters.length}
                      </span>
                    </div>
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200' : ''
                          }`}
                        >
                          {statusMatters.map((matter, index) => (
                            <MatterCard key={matter.id} matter={matter} index={index} />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredMatters.map((matter) => (
                <li key={matter.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Link 
                          to={`/matters/${matter.id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          {matter.matterName}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Matter #: {matter.matterNumber}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>
                          Client: <Link 
                            to={`/clients/${matter.client.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {matter.client.clientName}
                          </Link>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(matter.status)}`}>
                          {formatStatus(matter.status)}
                        </span>
                        <span>Client #: {matter.client.clientNumber}</span>
                        {matter.client.attorney && (
                          <span>
                            Attorney: <Link 
                              to={`/people/${matter.client.attorney.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {matter.client.attorney.firstName} {matter.client.attorney.lastName}
                            </Link>
                          </span>
                        )}
                        {matter.client.paralegal && (
                          <span>
                            Paralegal: <Link 
                              to={`/people/${matter.client.paralegal.id}`}
                              className="text-green-600 hover:text-green-800"
                            >
                              {matter.client.paralegal.firstName} {matter.client.paralegal.lastName}
                            </Link>
                          </span>
                        )}
                        <span>Created: {new Date(matter.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/matters/${matter.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(matter)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(matter.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingMatter ? 'Edit Matter' : 'Add New Matter'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matter Name
                  </label>
                  <input
                    type="text"
                    value={formData.matterName}
                    onChange={(e) => setFormData({ ...formData, matterName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matter Number (6 digits)
                  </label>
                  <input
                    type="text"
                    value={formData.matterNumber}
                    onChange={(e) => setFormData({ ...formData, matterNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.clientName} (#{client.clientNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="COLLECTION">Collection</option>
                    <option value="CULLING">Culling</option>
                    <option value="REVIEW">Review</option>
                    <option value="PRODUCTION">Production</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingMatter ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Matters with Project Managers Modal */}
        {showMattersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Active Matters and Project Managers Report
                </h2>
                <button
                  onClick={() => setShowMattersModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {mattersList.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No active matters found.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Report generated on {new Date().toLocaleDateString()} - {mattersList.length} active matter{mattersList.length !== 1 ? 's' : ''}
                  </div>
                  
                  {/* Email-friendly format */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-800">Copy the text below for email:</h3>
                    </div>
                    <div 
                      className="bg-white p-4 rounded border font-mono text-sm whitespace-pre-wrap select-all cursor-text"
                      onClick={(e) => {
                        const selection = window.getSelection();
                        const range = document.createRange();
                        range.selectNodeContents(e.target);
                        selection.removeAllRanges();
                        selection.addRange(range);
                      }}
                    >
{`ACTIVE MATTERS AND PROJECT MANAGERS REPORT
Generated: ${new Date().toLocaleDateString()}
Total Active Matters: ${mattersList.length}

${mattersList.map(matter => 
`${matter.clientName} - ${matter.matterName} (${formatMatterStatus(matter.status)}). PM: ${matter.projectManager 
  ? `${matter.projectManager.firstName} ${matter.projectManager.lastName}`
  : 'Not assigned'
}`).join('\n')}

---
Report generated by Practice Support System`}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Click the text above to select all for copying
                    </div>
                  </div>

                  {/* Table view for reference */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Table View (for reference):</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Matter
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Client
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Project Manager
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {mattersList.map((matter) => (
                            <tr key={matter.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {matter.matterName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    #{matter.matterNumber}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {matter.clientName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatterStatusColor(matter.status)}`}>
                                  {formatMatterStatus(matter.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {matter.projectManager 
                                    ? `${matter.projectManager.firstName} ${matter.projectManager.lastName}`
                                    : 'Not assigned'
                                  }
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => setShowMattersModal(false)}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Matters;
