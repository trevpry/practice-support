import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, Users, Eye } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const Clients = () => {
  const location = useLocation();
  const [clients, setClients] = useState([]);
  const [attorneys, setAttorneys] = useState([]);
  const [paralegals, setParalegals] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    clientNumber: '',
    attorneyId: '',
    paralegalId: '',
    projectManagerId: ''
  });

  // Fetch clients and people
  const fetchData = async () => {
    try {
      const [clientsResponse, peopleResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/clients`),
        fetch(`${API_BASE_URL}/people`)
      ]);
      
      if (!clientsResponse.ok || !peopleResponse.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const [clientsData, peopleData] = await Promise.all([
        clientsResponse.json(),
        peopleResponse.json()
      ]);
      
      setClients(clientsData);
      setAttorneys(peopleData.filter(person => person.type === 'ATTORNEY'));
      setParalegals(peopleData.filter(person => person.type === 'PARALEGAL'));
      setProjectManagers(peopleData.filter(person => person.type === 'PROJECT_MANAGER'));
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
    if (location.state?.editClientId && clients.length > 0) {
      const clientToEdit = clients.find(client => client.id === location.state.editClientId);
      if (clientToEdit) {
        handleEdit(clientToEdit);
      }
    }
  }, [clients, location.state]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingClient 
        ? `${API_BASE_URL}/clients/${editingClient.id}`
        : '${API_BASE_URL}/clients';
      
      const method = editingClient ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          attorneyId: formData.attorneyId || null,
          paralegalId: formData.paralegalId || null,
          projectManagerId: formData.projectManagerId || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save client');
      }

      await fetchData();
      setIsModalOpen(false);
      setEditingClient(null);
      setFormData({ clientName: '', clientNumber: '', attorneyId: '', paralegalId: '', projectManagerId: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all associated matters.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open modal for editing
  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      clientName: client.clientName,
      clientNumber: client.clientNumber,
      attorneyId: client.attorneyId || '',
      paralegalId: client.paralegalId || '',
      projectManagerId: client.projectManagerId || ''
    });
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    setEditingClient(null);
    setFormData({ clientName: '', clientNumber: '', attorneyId: '', paralegalId: '', projectManagerId: '' });
    setIsModalOpen(true);
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-center py-8 text-red-600">Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage your law firm's clients</p>
          </div>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new client.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {clients.map((client) => (
                <li key={client.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Link 
                          to={`/clients/${client.id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          {client.clientName}
                        </Link>
                        <p className="text-sm text-gray-500">
                          Client #: {client.clientNumber}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        <span>{client.matters.length} matter{client.matters.length !== 1 ? 's' : ''}</span>
                        {client.attorney && (
                          <span>
                            Attorney: <Link 
                              to={`/people/${client.attorney.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {client.attorney.firstName} {client.attorney.lastName}
                            </Link>
                          </span>
                        )}
                        {client.paralegal && (
                          <span>
                            Paralegal: <Link 
                              to={`/people/${client.paralegal.id}`}
                              className="text-green-600 hover:text-green-800"
                            >
                              {client.paralegal.firstName} {client.paralegal.lastName}
                            </Link>
                          </span>
                        )}
                        {client.projectManager && (
                          <span>
                            PM: <Link 
                              to={`/people/${client.projectManager.id}`}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              {client.projectManager.firstName} {client.projectManager.lastName}
                            </Link>
                          </span>
                        )}
                        <span>Created: {new Date(client.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/clients/${client.id}`}>
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
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(client.id)}
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
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Number (7 digits)
                  </label>
                  <input
                    type="text"
                    value={formData.clientNumber}
                    onChange={(e) => setFormData({ ...formData, clientNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="[0-9]{7}"
                    maxLength="7"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attorney
                  </label>
                  <select
                    value={formData.attorneyId}
                    onChange={(e) => setFormData({ ...formData, attorneyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an attorney...</option>
                    {attorneys.map((attorney) => (
                      <option key={attorney.id} value={attorney.id}>
                        {attorney.firstName} {attorney.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paralegal
                  </label>
                  <select
                    value={formData.paralegalId}
                    onChange={(e) => setFormData({ ...formData, paralegalId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a paralegal...</option>
                    {paralegals.map((paralegal) => (
                      <option key={paralegal.id} value={paralegal.id}>
                        {paralegal.firstName} {paralegal.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Manager
                  </label>
                  <select
                    value={formData.projectManagerId}
                    onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a project manager...</option>
                    {projectManagers.map((projectManager) => (
                      <option key={projectManager.id} value={projectManager.id}>
                        {projectManager.firstName} {projectManager.lastName}
                      </option>
                    ))}
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
                    {editingClient ? 'Update' : 'Create'}
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

export default Clients;
