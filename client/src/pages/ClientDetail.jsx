import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { ArrowLeft, Edit, Trash2, FileText, User, Users } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getMatterStatusColor = (status) => {
    switch (status) {
      case 'COLLECTION': return 'text-blue-600 bg-blue-100';
      case 'CULLING': return 'text-yellow-600 bg-yellow-100';
      case 'REVIEW': return 'text-orange-600 bg-orange-100';
      case 'PRODUCTION': return 'text-green-600 bg-green-100';
      case 'INACTIVE': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatMatterStatus = (status) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Client not found');
          }
          throw new Error('Failed to fetch client');
        }
        const data = await response.json();
        setClient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all associated matters.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      navigate('/clients');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-center py-8 text-red-600">Error: {error}</div></Layout>;
  if (!client) return <Layout><div className="text-center py-8">Client not found</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/clients">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Clients
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.clientName}</h1>
              <p className="text-gray-600">Client #{client.clientNumber}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(`/clients`, { state: { editClientId: client.id } })}>
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

        {/* Client Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Client Information</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Client Name</dt>
                <dd className="text-lg text-gray-900">{client.clientName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Client Number</dt>
                <dd className="text-lg text-gray-900">{client.clientNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-lg text-gray-900">{new Date(client.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-lg text-gray-900">{new Date(client.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          {/* Team */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assigned Team</h2>
            <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-2">Attorney</dt>
                {client.attorney ? (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <Link 
                      to={`/people/${client.attorney.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {client.attorney.firstName} {client.attorney.lastName}
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">No attorney assigned</p>
                )}
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-2">Paralegal</dt>
                {client.paralegal ? (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-green-600" />
                    <Link 
                      to={`/people/${client.paralegal.id}`}
                      className="text-green-600 hover:text-green-800"
                    >
                      {client.paralegal.firstName} {client.paralegal.lastName}
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">No paralegal assigned</p>
                )}
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-2">Project Manager</dt>
                {client.projectManager ? (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <Link 
                      to={`/people/${client.projectManager.id}`}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      {client.projectManager.firstName} {client.projectManager.lastName}
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">No project manager assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Matters */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Matters ({client.matters.length})
            </h2>
            <Button 
              onClick={() => navigate('/matters/new', { state: { clientId: client.id } })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Add Matter
            </Button>
          </div>
          
          {client.matters.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No matters</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new matter for this client.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {client.matters.map((matter) => (
                <div key={matter.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Link 
                          to={`/matters/${matter.id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          {matter.matterName}
                        </Link>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatterStatusColor(matter.status)}`}>
                          {formatMatterStatus(matter.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Matter #{matter.matterNumber}</p>
                      <p className="text-sm text-gray-500">Created: {new Date(matter.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Link to={`/matters/${matter.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClientDetail;
