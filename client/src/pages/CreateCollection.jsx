import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '../components/Layout';
import { API_BASE_URL } from '../config/api';

const CreateCollection = () => {
  const [formData, setFormData] = useState({
    type: '',
    platform: '',
    status: 'DISCUSSING',
    matterId: '',
    custodianIds: [],
    organizationId: '',
    scheduledDate: '',
    completedDate: '',
    notes: ''
  });
  const [matters, setMatters] = useState([]);
  const [custodians, setCustodians] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.matterId) {
      fetchCustodiansByMatter(formData.matterId);
    } else {
      setCustodians([]);
    }
  }, [formData.matterId]);

  const fetchInitialData = async () => {
    try {
      const [mattersRes, orgsRes, statusRes, typeRes, platformRes] = await Promise.all([
        fetch(`${API_BASE_URL}/matters`),
        fetch(`${API_BASE_URL}/organizations`),
        fetch(`${API_BASE_URL}/collections/status-options`),
        fetch(`${API_BASE_URL}/collections/type-options`),
        fetch(`${API_BASE_URL}/collections/platform-options`)
      ]);

      if (!mattersRes.ok || !orgsRes.ok || !statusRes.ok || !typeRes.ok || !platformRes.ok) {
        throw new Error('Failed to fetch required data');
      }

      const [mattersData, orgsData, statusData, typeData, platformData] = await Promise.all([
        mattersRes.json(),
        orgsRes.json(),
        statusRes.json(),
        typeRes.json(),
        platformRes.json()
      ]);

      setMatters(mattersData);
      setOrganizations(orgsData);
      setStatusOptions(statusData);
      setTypeOptions(typeData);
      setPlatformOptions(platformData);
    } catch (error) {
      setErrors({ fetch: error.message });
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCustodiansByMatter = async (matterId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/custodians?matterId=${matterId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch custodians');
      }
      const custodiansData = await response.json();
      setCustodians(custodiansData);
    } catch (error) {
      setErrors(prev => ({ ...prev, custodians: error.message }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Clear platform if type is not EMAIL
      if (name === 'type' && value !== 'EMAIL') {
        newData.platform = '';
      }
      
      // Clear custodians if matter changes
      if (name === 'matterId') {
        newData.custodianIds = [];
      }
      
      return newData;
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCustodianChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const custodianIds = checked 
        ? [...prev.custodianIds, value]
        : prev.custodianIds.filter(id => id !== value);
      return {
        ...prev,
        custodianIds
      };
    });
    
    // Clear error when user selects custodians
    if (errors.custodianIds) {
      setErrors(prev => ({
        ...prev,
        custodianIds: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.type) {
      newErrors.type = 'Collection type is required';
    }
    
    if (!formData.matterId) {
      newErrors.matterId = 'Matter is required';
    }
    
    if (!formData.custodianIds || formData.custodianIds.length === 0) {
      newErrors.custodianIds = 'At least one custodian is required';
    }

    if (formData.scheduledDate && formData.completedDate && new Date(formData.scheduledDate) > new Date(formData.completedDate)) {
      newErrors.completedDate = 'Completed date cannot be before scheduled date';
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
    
    try {
      const submitData = {
        ...formData,
        matterId: parseInt(formData.matterId),
        custodianIds: formData.custodianIds.map(id => parseInt(id)),
        organizationId: formData.organizationId ? parseInt(formData.organizationId) : null,
        scheduledDate: formData.scheduledDate || null,
        completedDate: formData.completedDate || null
      };

      const response = await fetch('${API_BASE_URL}/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create collection');
      }
      
      navigate('/collections');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading...</div>
      </Layout>
    );
  }

  if (errors.fetch) {
    return (
      <Layout>
        <div className="text-center py-8 text-red-600">Error: {errors.fetch}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/collections')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Collections
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Collection</h1>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {errors.submit}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.type ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
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
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {formData.type === 'EMAIL' && (
                <div>
                  <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    id="platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select platform...</option>
                    {platformOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="matterId" className="block text-sm font-medium text-gray-700 mb-1">
                Matter *
              </label>
              <select
                id="matterId"
                name="matterId"
                value={formData.matterId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.matterId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              >
                <option value="">Select matter...</option>
                {matters.map(matter => (
                  <option key={matter.id} value={matter.id}>
                    {matter.matterName} - {matter.client?.clientName}
                  </option>
                ))}
              </select>
              {errors.matterId && (
                <p className="mt-1 text-sm text-red-600">{errors.matterId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custodians *
              </label>
              <div className={`border rounded-md p-3 max-h-40 overflow-y-auto ${
                errors.custodianIds ? 'border-red-300' : 'border-gray-300'
              }`}>
                {custodians.length === 0 ? (
                  <p className="text-gray-500 text-sm">No custodians available</p>
                ) : (
                  <div className="space-y-2">
                    {custodians.map(custodian => (
                      <label key={custodian.id} className="flex items-center">
                        <input
                          type="checkbox"
                          value={custodian.id}
                          checked={formData.custodianIds.includes(custodian.id.toString())}
                          onChange={handleCustodianChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {custodian.name} - {custodian.organization?.name || 'No Organization'}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {errors.custodianIds && (
                <p className="mt-1 text-sm text-red-600">{errors.custodianIds}</p>
              )}
            </div>

            <div>
              <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Organization (Optional)
              </label>
              <select
                id="organizationId"
                name="organizationId"
                value={formData.organizationId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select organization...</option>
                {organizations.filter(org => org.type === 'VENDOR').map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="completedDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Completed Date
                </label>
                <input
                  type="date"
                  id="completedDate"
                  name="completedDate"
                  value={formData.completedDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.completedDate ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors.completedDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.completedDate}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter any additional notes about this collection..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => navigate('/collections')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Create Collection
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCollection;
