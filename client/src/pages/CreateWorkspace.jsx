import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../config/api';

const CreateWorkspace = () => {
  const [formData, setFormData] = useState({
    url: '',
    type: '',
    matterId: '',
    organizationId: ''
  });
  const [matters, setMatters] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [mattersRes, orgsRes, typeRes] = await Promise.all([
        fetch(`${API_BASE_URL}/matters`),
        fetch(`${API_BASE_URL}/organizations`),
        fetch(`${API_BASE_URL}/workspaces/type-options`)
      ]);

      if (!mattersRes.ok || !orgsRes.ok || !typeRes.ok) {
        throw new Error('Failed to fetch required data');
      }

      const [mattersData, orgsData, typeData] = await Promise.all([
        mattersRes.json(),
        orgsRes.json(),
        typeRes.json()
      ]);

      setMatters(mattersData);
      setOrganizations(orgsData);
      setTypeOptions(typeData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setErrors({ submit: 'Failed to load required data. Please refresh the page.' });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!formData.url.includes('http')) {
      newErrors.url = 'Please enter a valid URL';
    }
    
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    
    if (!formData.matterId) {
      newErrors.matterId = 'Matter is required';
    }
    
    if (!formData.organizationId) {
      newErrors.organizationId = 'Organization is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('${API_BASE_URL}/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          matterId: parseInt(formData.matterId),
          organizationId: parseInt(formData.organizationId)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create workspace');
      }
      
      const workspace = await response.json();
      navigate(`/matters/${workspace.matterId}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Workspace</h1>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {errors.submit}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* URL */}
              <div className="md:col-span-2">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Relativity Workspace URL *
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.url ? 'border-red-500' : ''
                  }`}
                  placeholder="https://example.relativity.com/workspace"
                />
                {errors.url && (
                  <p className="text-red-500 text-sm mt-1">{errors.url}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select type...</option>
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>

              {/* Hosted By */}
              <div>
                <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-2">
                  Hosted By *
                </label>
                <select
                  id="organizationId"
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.organizationId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select organization...</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                {errors.organizationId && (
                  <p className="text-red-500 text-sm mt-1">{errors.organizationId}</p>
                )}
              </div>

              {/* Matter */}
              <div className="md:col-span-2">
                <label htmlFor="matterId" className="block text-sm font-medium text-gray-700 mb-2">
                  Matter *
                </label>
                <select
                  id="matterId"
                  name="matterId"
                  value={formData.matterId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.matterId ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Select matter...</option>
                  {matters.map(matter => (
                    <option key={matter.id} value={matter.id}>
                      {matter.matterNumber} - {matter.matterName} ({matter.client.clientName})
                    </option>
                  ))}
                </select>
                {errors.matterId && (
                  <p className="text-red-500 text-sm mt-1">{errors.matterId}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateWorkspace;
