import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { ArrowLeft, Edit, Trash2, User, Users, Building, X, Plus, CheckSquare, Calendar, AlertCircle, DollarSign, FileText, Archive } from 'lucide-react';

const MatterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matter, setMatter] = useState(null);
  const [collections, setCollections] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [allPeople, setAllPeople] = useState([]);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [teamModalLoading, setTeamModalLoading] = useState(false);
  const [estimates, setEstimates] = useState([]);
  const [vendorAgreements, setVendorAgreements] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    const fetchMatter = async () => {
      try {
        const response = await fetch(`/api/matters/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Matter not found');
          }
          throw new Error('Failed to fetch matter');
        }
        const data = await response.json();
        setMatter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCollections = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/collections/matter/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCollections(data);
        }
      } catch (err) {
        console.error('Error fetching collections:', err);
      }
    };

    const fetchWorkspaces = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/workspaces/matter/${id}`);
        if (response.ok) {
          const data = await response.json();
          setWorkspaces(data);
        }
      } catch (err) {
        console.error('Error fetching workspaces:', err);
      }
    };

    const fetchEstimates = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/estimates/matter/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEstimates(data);
        }
      } catch (err) {
        console.error('Error fetching estimates:', err);
      }
    };

    const fetchVendorAgreements = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/vendor-agreements/matter/${id}`);
        if (response.ok) {
          const data = await response.json();
          setVendorAgreements(data);
        }
      } catch (err) {
        console.error('Error fetching vendor agreements:', err);
      }
    };

    const fetchInvoices = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/invoices/matter/${id}`);
        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
        }
      } catch (err) {
        console.error('Error fetching invoices:', err);
      }
    };

    fetchCurrentUser();
    fetchMatter();
    fetchCollections();
    fetchWorkspaces();
    fetchEstimates();
    fetchVendorAgreements();
    fetchInvoices();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this matter?')) {
      return;
    }

    try {
      const response = await fetch(`/api/matters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete matter');

      navigate('/matters');
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch all people for team management
  const fetchAllPeople = async () => {
    try {
      const response = await fetch('/api/people');
      if (!response.ok) throw new Error('Failed to fetch people');
      const people = await response.json();
      setAllPeople(people);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open team management modal
  const openTeamModal = async () => {
    setIsTeamModalOpen(true);
    await fetchAllPeople();
    // Initialize selected people with current team
    const currentTeamIds = matter.people.map(mp => mp.person.id);
    setSelectedPeople(currentTeamIds);
  };

  // Handle team member selection
  const togglePersonSelection = (personId) => {
    setSelectedPeople(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  // Save team changes
  const saveTeamChanges = async () => {
    setTeamModalLoading(true);
    try {
      const response = await fetch(`/api/matters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matterName: matter.matterName,
          matterNumber: matter.matterNumber,
          clientId: matter.clientId,
          peopleIds: selectedPeople
        }),
      });

      if (!response.ok) throw new Error('Failed to update team');

      // Refresh matter data
      const updatedMatter = await response.json();
      setMatter(updatedMatter);
      setIsTeamModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setTeamModalLoading(false);
    }
  };

  const getPersonTypeColor = (type) => {
    switch (type) {
      case 'ATTORNEY': return 'text-blue-600';
      case 'PARALEGAL': return 'text-green-600';
      case 'VENDOR': return 'text-purple-600';
      case 'PROJECT_MANAGER': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getPersonTypeBadgeColor = (type) => {
    switch (type) {
      case 'ATTORNEY': return 'bg-blue-100 text-blue-800';
      case 'PARALEGAL': return 'bg-green-100 text-green-800';
      case 'VENDOR': return 'bg-purple-100 text-purple-800';
      case 'PROJECT_MANAGER': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCollectionStatusColor = (status) => {
    switch (status) {
      case 'DISCUSSING': return 'text-yellow-600 bg-yellow-100';
      case 'SCHEDULED': return 'text-blue-600 bg-blue-100';
      case 'IN_PROGRESS': return 'text-orange-600 bg-orange-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCollectionTypeColor = (type) => {
    switch (type) {
      case 'EMAIL': return 'text-blue-600 bg-blue-100';
      case 'MOBILE': return 'text-purple-600 bg-purple-100';
      case 'COMPUTER': return 'text-green-600 bg-green-100';
      case 'OTHER': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getWorkspaceTypeColor = (type) => {
    switch (type) {
      case 'ECA': return 'text-purple-600 bg-purple-100';
      case 'REVIEW': return 'text-blue-600 bg-blue-100';
      case 'RSMF': return 'text-green-600 bg-green-100';
      case 'OTHER': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatWorkspaceType = (type) => {
    switch (type) {
      case 'ECA': return 'ECA';
      case 'REVIEW': return 'Review';
      case 'RSMF': return 'RSMF';
      case 'OTHER': return 'Other';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'DISCUSSING': return 'Discussing';
      case 'SCHEDULED': return 'Scheduled';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  const formatType = (type) => {
    switch (type) {
      case 'EMAIL': return 'Email';
      case 'MOBILE': return 'Mobile';
      case 'COMPUTER': return 'Computer';
      case 'OTHER': return 'Other';
      default: return type;
    }
  };

  const formatPlatform = (platform) => {
    switch (platform) {
      case 'OUTLOOK': return 'Outlook';
      case 'GMAIL': return 'Gmail';
      case 'OTHER': return 'Other';
      default: return platform;
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-center py-8 text-red-600">Error: {error}</div></Layout>;
  if (!matter) return <Layout><div className="text-center py-8">Matter not found</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/matters">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Matters
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{matter.matterName}</h1>
              <p className="text-gray-600">Matter #{matter.matterNumber}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(`/matters`, { state: { editMatterId: matter.id } })}>
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

        {/* Matter Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Matter Information</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Matter Name</dt>
                <dd className="text-lg text-gray-900">{matter.matterName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Matter Number</dt>
                <dd className="text-lg text-gray-900">{matter.matterNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-lg text-gray-900">{new Date(matter.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-lg text-gray-900">{new Date(matter.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          {/* Client Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Client</h2>
            <div className="flex items-center space-x-3">
              <Building className="w-6 h-6 text-blue-600" />
              <div>
                <Link 
                  to={`/clients/${matter.client.id}`}
                  className="text-lg font-medium text-blue-600 hover:text-blue-800"
                >
                  {matter.client.clientName}
                </Link>
                <p className="text-sm text-gray-500">Client #{matter.client.clientNumber}</p>
              </div>
            </div>
            
            {/* Client Team */}
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Client Team</h3>
              <div className="space-y-2">
                {matter.client.attorney && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Attorney</span>
                    <Link 
                      to={`/people/${matter.client.attorney.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {matter.client.attorney.firstName} {matter.client.attorney.lastName}
                    </Link>
                  </div>
                )}
                {matter.client.paralegal && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Paralegal</span>
                    <Link 
                      to={`/people/${matter.client.paralegal.id}`}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      {matter.client.paralegal.firstName} {matter.client.paralegal.lastName}
                    </Link>
                  </div>
                )}
                {!matter.client.attorney && !matter.client.paralegal && (
                  <p className="text-sm text-gray-500">No team assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Matter Team */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Matter Team ({matter.people.length})
            </h2>
            <Button 
              onClick={openTeamModal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
          </div>
          
          {matter.people.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
              <p className="mt-1 text-sm text-gray-500">Add team members to this matter to track assignments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matter.people.map((matterPerson) => (
                <div key={matterPerson.person.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link 
                        to={`/people/${matterPerson.person.id}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-800"
                      >
                        {matterPerson.person.firstName} {matterPerson.person.lastName}
                      </Link>
                      <div className="mt-1 space-y-1">
                        {matterPerson.person.type && (
                          <span className={`inline-block text-xs px-2 py-1 rounded ${getPersonTypeBadgeColor(matterPerson.person.type)}`}>
                            {matterPerson.person.type.replace('_', ' ')}
                          </span>
                        )}
                        {matterPerson.role && (
                          <div className="text-sm text-gray-600">Role: {matterPerson.role}</div>
                        )}
                      </div>
                    </div>
                    <User className={`w-5 h-5 ${matterPerson.person.type ? getPersonTypeColor(matterPerson.person.type) : 'text-gray-400'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matter Workspaces */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Workspaces ({workspaces.length})
            </h2>
            <Link to="/workspaces/create">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </Link>
          </div>
          
          {workspaces.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No workspaces
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create workspaces for this matter to track Relativity environments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <a 
                        href={workspace.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium text-blue-600 hover:text-blue-800"
                      >
                        {workspace.url}
                      </a>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkspaceTypeColor(workspace.type)}`}>
                        {formatWorkspaceType(workspace.type)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>Hosted by: {workspace.organization.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matter Collections */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Collections ({collections.length})
            </h2>
            <Link to="/collections">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Collection
              </Button>
            </Link>
          </div>
          
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No collections
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create collections for this matter to track data preservation and collection activities.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {collections.map((collection) => (
                <div key={collection.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link 
                        to={`/collections/${collection.id}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-800"
                      >
                        {collection.custodians.map(c => c.custodian.name).join(', ')}
                      </Link>
                      {collection.description && (
                        <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCollectionTypeColor(collection.type)}`}>
                        {formatType(collection.type)}
                      </span>
                      {collection.platform && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {formatPlatform(collection.platform)}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCollectionStatusColor(collection.status)}`}>
                        {formatStatus(collection.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Custodian{collection.custodians.length > 1 ? 's' : ''}: {collection.custodians.map(c => c.custodian.name).join(', ')}</span>
                    </div>
                    
                    {collection.custodians.length > 0 && collection.custodians[0].custodian.organization && (
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>Organization: {collection.custodians[0].custodian.organization.name}</span>
                      </div>
                    )}
                    
                    {collection.organization && (
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>Vendor: {collection.organization.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {collection.completedDate 
                          ? `Completed: ${formatDate(collection.completedDate)}`
                          : collection.scheduledDate 
                            ? `Scheduled: ${formatDate(collection.scheduledDate)}`
                            : 'No date set'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matter Estimates */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Estimates ({estimates.length})
            </h2>
            <Link to="/estimates">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Estimate
              </Button>
            </Link>
          </div>
          
          {estimates.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No estimates</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create estimates from vendors for this matter to track project costs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {estimates.map((estimate) => (
                <div key={estimate.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link 
                        to={`/estimates/${estimate.id}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-800"
                      >
                        {estimate.organization.name} - {estimate.description.substring(0, 100)}
                        {estimate.description.length > 100 && '...'}
                      </Link>
                    </div>
                    <div className="text-lg font-semibold text-green-600 ml-4">
                      ${estimate.totalCost.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>Vendor: {estimate.organization.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(estimate.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vendor Agreements */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Vendor Agreements ({vendorAgreements.length})
            </h2>
            <Link to="/vendor-agreements">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Agreement
              </Button>
            </Link>
          </div>
          
          {vendorAgreements.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vendor agreements</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create vendor agreements to formalize contracts and terms with vendors.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendorAgreements.map((agreement) => (
                <div key={agreement.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link 
                        to={`/vendor-agreements/${agreement.id}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-800"
                      >
                        {agreement.organization.name} - {agreement.agreementText.substring(0, 100)}
                        {agreement.agreementText.length > 100 && '...'}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-600 ml-4">
                      Signed by: {agreement.signedBy.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>Vendor: {agreement.organization.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(agreement.createdAt).toLocaleDateString()}</span>
                    </div>
                    {agreement.estimate && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Related Estimate: ${agreement.estimate.totalCost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matter Invoices */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Invoices ({invoices.length})
            </h2>
            <Link to="/invoices">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
          
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
              <p className="mt-1 text-sm text-gray-500">
                Track vendor invoices for this matter to manage billing and payments.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link 
                        to={`/invoices/${invoice.id}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-800"
                      >
                        {invoice.organization.name} - Invoice #{invoice.id}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-lg font-semibold text-gray-900">
                        ${invoice.invoiceAmount.toLocaleString()}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'QUESTION' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {invoice.status === 'RECEIVED' ? 'Received' :
                         invoice.status === 'SUBMITTED' ? 'Submitted' :
                         invoice.status === 'QUESTION' ? 'Question' :
                         invoice.status === 'PAID' ? 'Paid' : invoice.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>Vendor: {invoice.organization.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Invoice Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {invoice.approved ? (
                        <CheckSquare className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={invoice.approved ? 'text-green-600' : 'text-red-600'}>
                        {invoice.approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                    {invoice.estimate && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Related Estimate: ${invoice.estimate.totalCost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Management Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Manage Matter Team</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTeamModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select people to assign to this matter:
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
                        {person.type ? person.type.replace('_', ' ') : 'No type specified'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsTeamModalOpen(false)}
                  disabled={teamModalLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveTeamChanges}
                  disabled={teamModalLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {teamModalLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MatterDetail;
