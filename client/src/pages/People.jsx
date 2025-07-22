import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { Plus, Edit, Trash2, User, Eye } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const People = () => {
  const location = useLocation();
  const [people, setPeople] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: '',
    organizationId: ''
  });

  const personTypes = [
    { value: 'ATTORNEY', label: 'Attorney' },
    { value: 'PARALEGAL', label: 'Paralegal' },
    { value: 'VENDOR', label: 'Vendor' },
    { value: 'PROJECT_MANAGER', label: 'Project Manager' }
  ];

  // Fetch people
  const fetchPeople = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/people`);
      if (!response.ok) throw new Error('Failed to fetch people');
      const data = await response.json();
      setPeople(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations`);
      if (!response.ok) throw new Error('Failed to fetch organizations');
      const data = await response.json();
      setOrganizations(data);
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  useEffect(() => {
    fetchPeople();
    fetchOrganizations();
  }, []);

  // Auto-open edit modal if navigated from detail page
  useEffect(() => {
    if (location.state?.editPersonId && people.length > 0) {
      const personToEdit = people.find(person => person.id === location.state.editPersonId);
      if (personToEdit) {
        handleEdit(personToEdit);
      }
    }
  }, [people, location.state]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPerson 
        ? `${API_BASE_URL}/people/${editingPerson.id}`
        : `${API_BASE_URL}/people`;
      
      const method = editingPerson ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email || null,
          phone: formData.phone || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save person');
      }

      await fetchPeople();
      setIsModalOpen(false);
      setEditingPerson(null);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', type: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this person?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/people/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete person');

      await fetchPeople();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open modal for editing
  const handleEdit = (person) => {
    setEditingPerson(person);
    setFormData({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email || '',
      phone: person.phone || '',
      type: person.type,
      organizationId: person.organizationId || ''
    });
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    setEditingPerson(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', type: '', organizationId: '' });
    setIsModalOpen(true);
  };

  // Get linked clients and matters for a person
  const getLinkedInfo = (person) => {
    const clients = [...(person.clientsAsAttorney || []), ...(person.clientsAsParalegal || [])];
    const totalMatters = clients.reduce((sum, client) => sum + (client.matters?.length || 0), 0);
    return { clients: clients.length, matters: totalMatters };
  };

  // Format person type for display
  const formatPersonType = (type) => {
    return personTypes.find(t => t.value === type)?.label || type;
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-center py-8 text-red-600">Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">People</h1>
            <p className="text-gray-600">Manage attorneys, paralegals, vendors, and project managers</p>
          </div>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        </div>

        {people.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No people</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new person.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {people.map((person) => (
                <li key={person.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Link 
                          to={`/people/${person.id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          {person.firstName} {person.lastName}
                        </Link>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {formatPersonType(person.type)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                        {person.organization && (
                          <span className="flex items-center">
                            <span className="mr-1">🏢</span>
                            <Link 
                              to={`/organizations/${person.organization.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {person.organization.name}
                            </Link>
                          </span>
                        )}
                        {person.email && (
                          <span className="flex items-center">
                            <span className="mr-1">📧</span>
                            {person.email}
                          </span>
                        )}
                        {person.phone && (
                          <span className="flex items-center">
                            <span className="mr-1">📞</span>
                            {person.phone}
                          </span>
                        )}
                        {(() => {
                          const linkedInfo = getLinkedInfo(person);
                          return (
                            <>
                              {linkedInfo.clients > 0 && (
                                <span>{linkedInfo.clients} client{linkedInfo.clients !== 1 ? 's' : ''}</span>
                              )}
                              {linkedInfo.matters > 0 && (
                                <span>{linkedInfo.matters} matter{linkedInfo.matters !== 1 ? 's' : ''}</span>
                              )}
                            </>
                          );
                        })()}
                        <span>Created: {new Date(person.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/people/${person.id}`}>
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
                        onClick={() => handleEdit(person)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(person.id)}
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
                {editingPerson ? 'Edit Person' : 'Add New Person'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a type...</option>
                    {personTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())})
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
                    {editingPerson ? 'Update' : 'Create'}
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

export default People;
