import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, User, FileText, Users } from 'lucide-react';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../config/api';

const Custodians = () => {
  const [custodians, setCustodians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustodians();
  }, []);

  const fetchCustodians = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/custodians`);
      if (!response.ok) {
        throw new Error('Failed to fetch custodians');
      }
      const data = await response.json();
      setCustodians(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this custodian?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/custodians/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete custodian');
        }
        fetchCustodians(); // Refresh the list
      } catch (err) {
        alert(err.message);
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Custodians</h1>
          <Link
            to="/custodians/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Custodian
          </Link>
        </div>

        {custodians.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No custodians found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first custodian.</p>
            <Link
              to="/custodians/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Custodian
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {custodians.map((custodian) => (
                <li key={custodian.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center">
                          <Link
                            to={`/custodians/${custodian.id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-900 truncate"
                          >
                            {custodian.name}
                          </Link>
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                          {custodian.organization && (
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <Link
                                to={`/organizations/${custodian.organization.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                {custodian.organization.name}
                              </Link>
                            </div>
                          )}
                          {custodian.department && (
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              Department: {custodian.department}
                            </div>
                          )}
                          {custodian.title && (
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              Title: {custodian.title}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <FileText className="w-4 h-4 mr-1" />
                          {custodian.collections.length} collection(s)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/custodians/${custodian.id}/edit`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(custodian.id)}
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

export default Custodians;
