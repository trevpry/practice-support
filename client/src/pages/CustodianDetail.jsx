import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Building2, User, Database, Calendar, CheckCircle, Mail } from 'lucide-react';
import Layout from '../components/Layout';

const CustodianDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [custodian, setCustodian] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustodian();
  }, [id]);

  const fetchCustodian = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/custodians/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch custodian');
      }
      const data = await response.json();
      setCustodian(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this custodian? This will also delete all associated collections.')) {
      try {
        const response = await fetch(`http://localhost:5001/api/custodians/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete custodian');
        }
        navigate('/custodians');
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

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading custodian...</div>
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

  if (!custodian) {
    return (
      <Layout>
        <div className="text-center py-8">Custodian not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/custodians"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Custodians
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{custodian.name}</h1>
              <p className="text-lg text-gray-600 mt-1">Custodian Details</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/custodians/${custodian.id}/edit`}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custodian Information */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                <User className="w-5 h-5 inline mr-2" />
                Custodian Information
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{custodian.name}</dd>
                </div>
                {custodian.organization && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Organization</dt>
                    <dd className="text-sm text-gray-900">
                      <Link
                        to={`/organizations/${custodian.organization.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Building2 className="w-4 h-4 inline mr-1" />
                        {custodian.organization.name}
                      </Link>
                    </dd>
                  </div>
                )}
                {custodian.department && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Department</dt>
                    <dd className="text-sm text-gray-900">{custodian.department}</dd>
                  </div>
                )}
                {custodian.title && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Title</dt>
                    <dd className="text-sm text-gray-900">{custodian.title}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Contact Information */}
            {(custodian.email || custodian.streetAddress || custodian.city || custodian.state || custodian.zipCode) && (
              <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  <Mail className="w-5 h-5 inline mr-2" />
                  Contact Information
                </h2>
                <dl className="space-y-4">
                  {custodian.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">
                        <a href={`mailto:${custodian.email}`} className="text-blue-600 hover:text-blue-900">
                          {custodian.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {(custodian.streetAddress || custodian.city || custodian.state || custodian.zipCode) && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="text-sm text-gray-900">
                        {custodian.streetAddress && (
                          <div>{custodian.streetAddress}</div>
                        )}
                        {(custodian.city || custodian.state || custodian.zipCode) && (
                          <div>
                            {[custodian.city, custodian.state, custodian.zipCode].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Collections */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  <Database className="w-5 h-5 inline mr-2" />
                  Collections ({custodian.collections?.length || 0})
                </h2>
                <Link
                  to="/collections/new"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Add Collection
                </Link>
              </div>

              {custodian.collections && custodian.collections.length > 0 ? (
                <div className="space-y-4">
                  {custodian.collections.map((collection) => (
                    <div key={collection.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-sm font-medium text-gray-900">
                              {formatType(collection.type)} Collection
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(collection.status)}`}>
                              {formatStatus(collection.status)}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <strong>Matter:</strong>{' '}
                              <Link
                                to={`/matters/${collection.matter.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                {collection.matter.matterName}
                              </Link>
                              {' - '}
                              <span>{collection.matter.client.name}</span>
                            </p>
                            {collection.organization && (
                              <p className="text-sm text-gray-600">
                                <strong>Vendor:</strong>{' '}
                                <Link
                                  to={`/organizations/${collection.organization.id}`}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  {collection.organization.name}
                                </Link>
                              </p>
                            )}
                            <div className="flex space-x-4 text-sm text-gray-600">
                              {collection.scheduledDate && (
                                <span>
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  Scheduled: {formatDate(collection.scheduledDate)}
                                </span>
                              )}
                              {collection.completedDate && (
                                <span>
                                  <CheckCircle className="w-3 h-3 inline mr-1" />
                                  Completed: {formatDate(collection.completedDate)}
                                </span>
                              )}
                            </div>
                            {collection.notes && (
                              <p className="text-sm text-gray-600">
                                <strong>Notes:</strong> {collection.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/collections/${collection.id}/edit`}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No collections</h3>
                  <p className="text-gray-500 mb-4">This custodian has no collections yet.</p>
                  <Link
                    to="/collections/new"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create First Collection
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustodianDetail;
