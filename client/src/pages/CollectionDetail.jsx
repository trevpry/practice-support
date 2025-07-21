import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Building2, User, FileText, Calendar, CheckCircle, Clock, MessageSquare, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/collections/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch collection');
      }
      const data = await response.json();
      setCollection(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/collections/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete collection');
        }
        navigate('/collections');
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

  const formatPlatform = (platform) => {
    switch (platform) {
      case 'OUTLOOK':
        return 'Outlook';
      case 'GMAIL':
        return 'Gmail';
      case 'OTHER':
        return 'Other';
      default:
        return platform;
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
        <div className="text-center py-8">Loading collection...</div>
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

  if (!collection) {
    return (
      <Layout>
        <div className="text-center py-8">Collection not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/collections"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Collections
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {formatType(collection.type)} Collection
                </h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(collection.status)}`}>
                  {getStatusIcon(collection.status)}
                  <span className="ml-1">{formatStatus(collection.status)}</span>
                </span>
              </div>
              <p className="text-lg text-gray-600 mt-1">Collection Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/collections/${collection.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Collection Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <FileText className="w-5 h-5 inline mr-2" />
              Collection Information
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="text-sm text-gray-900">{formatType(collection.type)}</dd>
              </div>
              {collection.platform && collection.type === 'EMAIL' && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Platform</dt>
                  <dd className="text-sm text-gray-900">{formatPlatform(collection.platform)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(collection.status)}`}>
                    {getStatusIcon(collection.status)}
                    <span className="ml-1">{formatStatus(collection.status)}</span>
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Matter</dt>
                <dd className="text-sm text-gray-900">
                  <Link
                    to={`/matters/${collection.matter.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {collection.matter.matterName}
                  </Link>
                  <span className="text-gray-500"> - {collection.matter.client.name}</span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Custodian{collection.custodians && collection.custodians.length > 1 ? 's' : ''}</dt>
                <dd className="text-sm text-gray-900">
                  {collection.custodians && collection.custodians.length > 0 ? (
                    <div className="space-y-1">
                      {collection.custodians.map((custodianRelation, index) => (
                        <div key={custodianRelation.custodian.id}>
                          <Link
                            to={`/custodians/${custodianRelation.custodian.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <User className="w-4 h-4 inline mr-1" />
                            {custodianRelation.custodian.name}
                          </Link>
                          {custodianRelation.custodian.organization && (
                            <span className="text-gray-500">
                              {' '}({custodianRelation.custodian.organization.name})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No custodians assigned</span>
                  )}
                </dd>
              </div>
              {collection.organization && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Vendor Organization</dt>
                  <dd className="text-sm text-gray-900">
                    <Link
                      to={`/organizations/${collection.organization.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Building2 className="w-4 h-4 inline mr-1" />
                      {collection.organization.name}
                    </Link>
                  </dd>
                </div>
              )}
              {collection.scheduledDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Scheduled Date</dt>
                  <dd className="text-sm text-gray-900">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatDate(collection.scheduledDate)}
                  </dd>
                </div>
              )}
              {collection.completedDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Completed Date</dt>
                  <dd className="text-sm text-gray-900">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    {formatDate(collection.completedDate)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">{formatDate(collection.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">{formatDate(collection.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <FileText className="w-5 h-5 inline mr-2" />
              Notes
            </h2>
            {collection.notes ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{collection.notes}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes</h3>
                <p className="text-gray-500 mb-4">No notes have been added to this collection yet.</p>
                <Link
                  to={`/collections/${collection.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Add Notes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollectionDetail;
