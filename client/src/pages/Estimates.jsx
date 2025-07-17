import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Plus, DollarSign, Building2, FileText, Edit, Trash2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Estimates = () => {
  const [estimates, setEstimates] = useState([]);
  const [matters, setMatters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    totalCost: '',
    matterId: '',
    organizationId: ''
  });

  useEffect(() => {
    fetchEstimates();
    fetchMatters();
    fetchVendors();
  }, []);

  const fetchEstimates = async () => {
    try {
      const response = await fetch('/api/estimates');
      if (!response.ok) throw new Error('Failed to fetch estimates');
      const data = await response.json();
      setEstimates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatters = async () => {
    try {
      const response = await fetch('/api/matters');
      if (!response.ok) throw new Error('Failed to fetch matters');
      const data = await response.json();
      setMatters(data);
    } catch (err) {
      console.error('Error fetching matters:', err);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (!response.ok) throw new Error('Failed to fetch organizations');
      const data = await response.json();
      // Filter to only vendor organizations
      const vendorOrgs = data.filter(org => org.type === 'VENDOR');
      setVendors(vendorOrgs);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEstimate 
        ? `/api/estimates/${editingEstimate.id}` 
        : '/api/estimates';
      const method = editingEstimate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save estimate');
      }

      await fetchEstimates();
      setShowForm(false);
      setEditingEstimate(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (estimate) => {
    setEditingEstimate(estimate);
    setFormData({
      description: estimate.description || '',
      totalCost: estimate.totalCost?.toString() || '',
      matterId: estimate.matterId?.toString() || '',
      organizationId: estimate.organizationId?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this estimate?')) return;
    
    try {
      const response = await fetch(`/api/estimates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete estimate');
      }

      await fetchEstimates();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      totalCost: '',
      matterId: '',
      organizationId: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading estimates...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
            <p className="mt-2 text-gray-600">
              Manage vendor estimates for matters
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingEstimate(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Estimate
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Estimate Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingEstimate ? 'Edit Estimate' : 'Add New Estimate'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matter *
                  </label>
                  <select
                    value={formData.matterId}
                    onChange={(e) => setFormData({ ...formData, matterId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Matter</option>
                    {matters.map(matter => (
                      <option key={matter.id} value={matter.id}>
                        {matter.matterNumber} - {matter.matterName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor *
                  </label>
                  <select
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Cost *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalCost}
                    onChange={(e) => setFormData({ ...formData, totalCost: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the work to be performed and any relevant details..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingEstimate ? 'Update Estimate' : 'Create Estimate'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingEstimate(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Estimates List */}
        <div className="grid gap-6">
          {estimates.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates yet</h3>
              <p className="text-gray-600">Get started by adding your first estimate.</p>
            </div>
          ) : (
            estimates.map((estimate) => (
              <div key={estimate.id} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <Link 
                        to={`/estimates/${estimate.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-gray-700"
                      >
                        {formatCurrency(estimate.totalCost)}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        <Link 
                          to={`/matters/${estimate.matter.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {estimate.matter.matterNumber} - {estimate.matter.matterName}
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Building2 className="h-4 w-4" />
                      <Link 
                        to={`/organizations/${estimate.organization.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {estimate.organization.name}
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(estimate)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(estimate.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700">{estimate.description}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created: {new Date(estimate.createdAt).toLocaleDateString()}
                  </div>
                  {estimate.updatedAt !== estimate.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Updated: {new Date(estimate.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Estimates;
