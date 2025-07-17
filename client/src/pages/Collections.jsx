import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, Database, Calendar, User, Building2, Clock, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/collections');
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
        const response = await fetch(`http://localhost:5001/api/collections/${id}`, {
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
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          <Link
            to="/collections/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Collection
          </Link>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first collection.</p>
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
              {collections.map((collection) => (
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
                            <span>{collection.matter.client.name}</span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <User className="w-4 h-4 mr-1" />
                            <Link
                              to={`/custodians/${collection.custodian.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              {collection.custodian.name}
                            </Link>
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
