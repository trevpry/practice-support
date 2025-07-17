import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '../components/Layout';

const EditCollection = () => {
  const [formData, setFormData] = useState({
    type: '',
    status: '',
    matterId: '',
    custodianId: '',
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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [collectionRes, mattersRes, custodiansRes, orgsRes, statusRes, typeRes] = await Promise.all([
        fetch(`http://localhost:5001/api/collections/${id}`),
        fetch('http://localhost:5001/api/matters'),
        fetch('http://localhost:5001/api/custodians'),
        fetch('http://localhost:5001/api/organizations'),
        fetch('http://localhost:5001/api/collections/status-options'),
        fetch('http://localhost:5001/api/collections/type-options')
      ]);

      if (!collectionRes.ok || !mattersRes.ok || !custodiansRes.ok || !orgsRes.ok || !statusRes.ok || !typeRes.ok) {
        throw new Error('Failed to fetch required data');
      }

      const [collectionData, mattersData, custodiansData, orgsData, statusData, typeData] = await Promise.all([
        collectionRes.json(),
        mattersRes.json(),
        custodiansRes.json(),
        orgsRes.json(),
        statusRes.json(),
        typeRes.json()
      ]);

      setMatters(mattersData);
      setCustodians(custodiansData);
      setOrganizations(orgsData);
      setStatusOptions(statusData);
      setTypeOptions(typeData);

      // Format dates for input fields
      const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
      };

      setFormData({
        type: collectionData.type || '',
        status: collectionData.status || '',
        matterId: collectionData.matterId?.toString() || '',
        custodianId: collectionData.custodianId?.toString() || '',
        organizationId: collectionData.organizationId?.toString() || '',
        scheduledDate: formatDate(collectionData.scheduledDate),
        completedDate: formatDate(collectionData.completedDate),
        notes: collectionData.notes || ''
      });
    } catch (error) {
      setErrors({ fetch: error.message });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
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
    
    if (!formData.type) {
      newErrors.type = 'Collection type is required';
    }
    
    if (!formData.matterId) {
      newErrors.matterId = 'Matter is required';
    }
    
    if (!formData.custodianId) {
      newErrors.custodianId = 'Custodian is required';
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
        custodianId: parseInt(formData.custodianId),
        organizationId: formData.organizationId ? parseInt(formData.organizationId) : null,
        scheduledDate: formData.scheduledDate || null,
        completedDate: formData.completedDate || null
      };

      const response = await fetch(`http://localhost:5001/api/collections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update collection');
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
        <div className="text-center py-8">Loading collection...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Collection</h1>
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
                    {matter.matterName} - {matter.client?.name}
                  </option>
                ))}
              </select>
              {errors.matterId && (
                <p className="mt-1 text-sm text-red-600">{errors.matterId}</p>
              )}
            </div>

            <div>
              <label htmlFor="custodianId" className="block text-sm font-medium text-gray-700 mb-1">
                Custodian *
              </label>
              <select
                id="custodianId"
                name="custodianId"
                value={formData.custodianId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.custodianId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              >
                <option value="">Select custodian...</option>
                {custodians.map(custodian => (
                  <option key={custodian.id} value={custodian.id}>
                    {custodian.name} - {custodian.organization?.name || 'No Organization'}
                  </option>
                ))}
              </select>
              {errors.custodianId && (
                <p className="mt-1 text-sm text-red-600">{errors.custodianId}</p>
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
                Update Collection
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditCollection;
