import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, FileText, Eye } from 'lucide-react';

const Matters = () => {
  const location = useLocation();
  const [matters, setMatters] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatter, setEditingMatter] = useState(null);
  const [formData, setFormData] = useState({
    matterName: '',
    matterNumber: '',
    clientId: '',
    status: 'COLLECTION'
  });

  // Format status for display
  const formatStatus = (status) => {
    return status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Collection';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'COLLECTION': return 'bg-blue-100 text-blue-800';
      case 'CULLING': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW': return 'bg-orange-100 text-orange-800';
      case 'PRODUCTION': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Fetch matters and clients
  const fetchData = async () => {
    try {
      const [mattersResponse, clientsResponse] = await Promise.all([
        fetch('http://localhost:5001/api/matters'),
        fetch('http://localhost:5001/api/clients')
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
        ? `http://localhost:5001/api/matters/${editingMatter.id}`
        : 'http://localhost:5001/api/matters';
      
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
      const response = await fetch(`http://localhost:5001/api/matters/${id}`, {
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

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-center py-8 text-red-600">Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matters</h1>
            <p className="text-gray-600">Manage client matters</p>
          </div>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Matter
          </Button>
        </div>

        {matters.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No matters</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new matter.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {matters.map((matter) => (
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
      </div>
    </Layout>
  );
};

export default Matters;
