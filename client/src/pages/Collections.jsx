import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Database, Calendar, User, Building2, Clock, CheckCircle, AlertTriangle, MessageSquare, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../config/api';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter collections based on search term
  const filteredCollections = collections.filter(collection => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      collection.collectionName.toLowerCase().includes(searchLower) ||
      (collection.collectionDescription && collection.collectionDescription.toLowerCase().includes(searchLower)) ||
      collection.status.toLowerCase().includes(searchLower) ||
      (collection.custodian && collection.custodian.name.toLowerCase().includes(searchLower)) ||
      (collection.matter && collection.matter.matterName.toLowerCase().includes(searchLower)) ||
      (collection.matter && collection.matter.client && collection.matter.client.clientName.toLowerCase().includes(searchLower))
    );
  });

  // Calculate collection status counts
  const collectionStats = {
    discussing: collections.filter(c => c.status === 'DISCUSSING').length,
    scheduled: collections.filter(c => c.status === 'SCHEDULED').length,
    inProgress: collections.filter(c => c.status === 'IN_PROGRESS').length,
    completed: collections.filter(c => c.status === 'COMPLETED').length,
    withCustodian: collections.filter(c => c.custodian).length
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/collections`);
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      const data = await response.json();
      setCollections(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete collection');
        }
        fetchCollections(); // Refresh the list
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'DISCUSSING':
        return 'Discussing';
      case 'SCHEDULED':
        return 'Scheduled';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  const formatType = (type) => {
    switch (type) {
      case 'EMAIL':
        return 'Email';
      case 'MOBILE':
        return 'Mobile';
      case 'COMPUTER':
        return 'Computer';
      case 'OTHER':
        return 'Other';
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISCUSSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DISCUSSING':
        return <MessageSquare className="w-4 h-4" />;
      case 'SCHEDULED':
        return <Calendar className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-600">Error: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
            <p className="text-gray-600">
              Manage data collections • {collections.length} total {collections.length === 1 ? 'collection' : 'collections'}
            </p>
          </div>
          <Link
            to="/collections/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Collection
          </Link>
        </div>

        {/* Collection Status Breakdown */}
        {collections.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Collections by Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Discussing
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {collectionStats.discussing}
                </p>
              </div>
              <div className="text-center">
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Scheduled
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {collectionStats.scheduled}
                </p>
              </div>
              <div className="text-center">
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  In Progress
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {collectionStats.inProgress}
                </p>
              </div>
              <div className="text-center">
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Completed
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {collectionStats.completed}
                </p>
              </div>
              <div className="text-center">
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  With Custodian
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {collectionStats.withCustodian}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Search Collections</h2>
            <span className="text-sm text-gray-500">
              {searchTerm ? `${filteredCollections.length} of ${collections.length} collections` : `${collections.length} total collections`}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search collections by name, description, status, custodian, or matter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {filteredCollections.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No collections found' : 'No collections found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first collection.'}
            </p>
            <Link
              to="/collections/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredCollections.map((collection) => (
                <li key={collection.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <Database className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/collections/${collection.id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-900"
                          >
                            {formatType(collection.type)} Collection
                          </Link>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(collection.status)}`}>
                            {getStatusIcon(collection.status)}
                            <span className="ml-1">{formatStatus(collection.status)}</span>
                          </span>
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <Link
                              to={`/matters/${collection.matter.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {collection.matter.matterName}
                            </Link>
                            <span className="mx-1">•</span>
                            <span>{collection.matter.client.clientName}</span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <User className="w-4 h-4 mr-1" />
                            {collection.custodians && collection.custodians.length > 0 ? (
                              <span>
                                {collection.custodians.map((custodianRelation, index) => (
                                  <span key={custodianRelation.custodian.id}>
                                    <Link
                                      to={`/custodians/${custodianRelation.custodian.id}`}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      {custodianRelation.custodian.name}
                                    </Link>
                                    {index < collection.custodians.length - 1 && ', '}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span className="text-gray-400">No custodians</span>
                            )}
                          </div>
                          {collection.organization && (
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <Building2 className="w-4 h-4 mr-1" />
                              <Link
                                to={`/organizations/${collection.organization.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                {collection.organization.name}
                              </Link>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                          {collection.scheduledDate && (
                            <div className="mt-1 flex items-center text-sm text-gray-500 sm:mt-0">
                              <Calendar className="w-4 h-4 mr-1" />
                              Scheduled: {formatDate(collection.scheduledDate)}
                            </div>
                          )}
                          {collection.completedDate && (
                            <div className="mt-1 flex items-center text-sm text-gray-500 sm:mt-0">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Completed: {formatDate(collection.completedDate)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/collections/${collection.id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(collection.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Collections;
