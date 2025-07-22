import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { ArrowLeft, Edit, Trash2, Building2, User, Mail, Phone, Globe, MapPin, X, Plus } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const OrganizationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false);
  const [allPeople, setAllPeople] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [peopleModalLoading, setPeopleModalLoading] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/organizations/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Organization not found');
          }
          throw new Error('Failed to fetch organization');
        }
        const data = await response.json();
        setOrganization(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this organization? This will unlink all associated people.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/organizations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete organization');
      }

      navigate('/organizations');
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch all people for people management
  const fetchAllPeople = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/people`);
      if (!response.ok) throw new Error('Failed to fetch people');
      const people = await response.json();
      setAllPeople(people);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open people management modal
  const openPeopleModal = async () => {
    setIsPeopleModalOpen(true);
    await fetchAllPeople();
    // Initialize selected people with current assignments
    const currentPeopleIds = organization.people?.map(person => person.id) || [];
    setSelectedPeople(currentPeopleIds);
  };

  // Handle person selection
  const togglePersonSelection = (personId) => {
    setSelectedPeople(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  // Save people assignments (by updating each person individually)
  const savePeopleChanges = async () => {
    setPeopleModalLoading(true);
    try {
      // Get current people assignments
      const currentPeopleIds = organization.people?.map(person => person.id) || [];
      
      // Find people to add (in selectedPeople but not in currentPeopleIds)
      const peopleToAdd = selectedPeople.filter(id => !currentPeopleIds.includes(id));
      
      // Find people to remove (in currentPeopleIds but not in selectedPeople)
      const peopleToRemove = currentPeopleIds.filter(id => !selectedPeople.includes(id));

      // Update people to add organization
      for (const personId of peopleToAdd) {
        const person = allPeople.find(p => p.id === personId);
        if (person) {
          await fetch(`${API_BASE_URL}/people/${personId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...person,
              organizationId: parseInt(id)
            }),
          });
        }
      }

      // Update people to remove organization
      for (const personId of peopleToRemove) {
        const person = allPeople.find(p => p.id === personId);
        if (person) {
          await fetch(`${API_BASE_URL}/people/${personId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...person,
              organizationId: null
            }),
          });
        }
      }

      // Refresh organization data
      const response = await fetch(`${API_BASE_URL}/organizations/${id}`);
      if (response.ok) {
        const updatedOrganization = await response.json();
        setOrganization(updatedOrganization);
      }
      
      setIsPeopleModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setPeopleModalLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'CURRENT_LAW_FIRM': 'bg-blue-100 text-blue-800',
      'CO_COUNSEL': 'bg-green-100 text-green-800',
      'OPPOSING_COUNSEL': 'bg-red-100 text-red-800',
      'VENDOR': 'bg-yellow-100 text-yellow-800',
      'THIRD_PARTY': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatType = (type) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPersonTypeColor = (type) => {
    switch (type) {
      case 'ATTORNEY': return 'bg-blue-100 text-blue-800';
      case 'PARALEGAL': return 'bg-green-100 text-green-800';
      case 'VENDOR': return 'bg-purple-100 text-purple-800';
      case 'PROJECT_MANAGER': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-center py-8 text-red-600">Error: {error}</div></Layout>;
  if (!organization) return <Layout><div className="text-center py-8">Organization not found</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/organizations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organizations
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {organization.name}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-block text-sm px-3 py-1 rounded-full ${getTypeColor(organization.type)}`}>
                  {formatType(organization.type)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(`/organizations`, { state: { editOrganizationId: organization.id } })}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Organization Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Organization Information</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-lg text-gray-900">{organization.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="text-lg text-gray-900">{formatType(organization.type)}</dd>
              </div>
              {organization.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-lg text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`mailto:${organization.email}`} className="text-blue-600 hover:text-blue-800">
                      {organization.email}
                    </a>
                  </dd>
                </div>
              )}
              {organization.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-lg text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`tel:${organization.phone}`} className="text-blue-600 hover:text-blue-800">
                      {organization.phone}
                    </a>
                  </dd>
                </div>
              )}
              {organization.website && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Website</dt>
                  <dd className="text-lg text-gray-900 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-gray-400" />
                    <a 
                      href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {organization.website}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-lg text-gray-900">{new Date(organization.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-lg text-gray-900">{new Date(organization.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          {/* Address & Statistics */}
          <div className="space-y-6">
            {/* Address */}
            {(organization.streetAddress || organization.city || organization.state || organization.zipCode || organization.country) && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Address
                </h2>
                <div className="text-gray-900">
                  {organization.streetAddress && (
                    <div className="mb-1">{organization.streetAddress}</div>
                  )}
                  <div>
                    {[organization.city, organization.state, organization.zipCode].filter(Boolean).join(', ')}
                  </div>
                  {organization.country && (
                    <div className="mt-1">{organization.country}</div>
                  )}
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Organization Statistics</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {organization.people?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Associated People</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {organization.notes && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{organization.notes}</p>
          </div>
        )}

        {/* Associated People */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Associated People ({organization.people?.length || 0})
            </h2>
            <Button 
              onClick={openPeopleModal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <User className="w-4 h-4 mr-2" />
              Manage People
            </Button>
          </div>
          
          {(organization.people?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No associated people</h3>
              <p className="mt-1 text-sm text-gray-500">Link people to this organization to track relationships.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organization.people.map((person) => (
                <div key={person.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <Link 
                      to={`/people/${person.id}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800"
                    >
                      {person.firstName} {person.lastName}
                    </Link>
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    {person.type && (
                      <span className={`inline-block text-xs px-2 py-1 rounded-full ${getPersonTypeColor(person.type)}`}>
                        {person.type.replace('_', ' ')}
                      </span>
                    )}
                    {person.email && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <a 
                          href={`mailto:${person.email}`}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          {person.email}
                        </a>
                      </div>
                    )}
                    {person.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <a 
                          href={`tel:${person.phone}`}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          {person.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* People Management Modal */}
      {isPeopleModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Manage People Assignments</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPeopleModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select people to associate with this organization:
              </p>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {allPeople.map((person) => (
                  <label
                    key={person.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPeople.includes(person.id)}
                      onChange={() => togglePersonSelection(person.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {person.firstName} {person.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {person.type && `${person.type.replace('_', ' ')} • `}
                        {person.email || 'No email'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsPeopleModalOpen(false)}
                  disabled={peopleModalLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={savePeopleChanges}
                  disabled={peopleModalLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {peopleModalLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default OrganizationDetail;
