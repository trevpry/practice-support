import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Plus, FileText, Building2, DollarSign, Edit, Trash2, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const VendorAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [matters, setMatters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [signedByOptions, setSignedByOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);
  const [formData, setFormData] = useState({
    agreementText: '',
    signedBy: '',
    matterId: '',
    organizationId: '',
    estimateId: ''
  });

  useEffect(() => {
    fetchAgreements();
    fetchMatters();
    fetchVendors();
    fetchEstimates();
    fetchSignedByOptions();
  }, []);

  const fetchAgreements = async () => {
    try {
      const response = await fetch('/api/vendor-agreements');
      if (!response.ok) throw new Error('Failed to fetch vendor agreements');
      const data = await response.json();
      setAgreements(data);
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

  const fetchEstimates = async () => {
    try {
      const response = await fetch('/api/estimates');
      if (!response.ok) throw new Error('Failed to fetch estimates');
      const data = await response.json();
      setEstimates(data);
    } catch (err) {
      console.error('Error fetching estimates:', err);
    }
  };

  const fetchSignedByOptions = async () => {
    try {
      const response = await fetch('/api/vendor-agreements/signed-by-options');
      if (!response.ok) throw new Error('Failed to fetch signed by options');
      const data = await response.json();
      setSignedByOptions(data);
    } catch (err) {
      console.error('Error fetching signed by options:', err);
    }
  };

  // Filter estimates based on selected matter and vendor
  const getFilteredEstimates = () => {
    if (!formData.matterId || !formData.organizationId) return [];
    return estimates.filter(est => 
      est.matterId === parseInt(formData.matterId) && 
      est.organizationId === parseInt(formData.organizationId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingAgreement 
        ? `/api/vendor-agreements/${editingAgreement.id}` 
        : '/api/vendor-agreements';
      const method = editingAgreement ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        estimateId: formData.estimateId || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save vendor agreement');
      }

      await fetchAgreements();
      setShowForm(false);
      setEditingAgreement(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (agreement) => {
    setEditingAgreement(agreement);
    setFormData({
      agreementText: agreement.agreementText || '',
      signedBy: agreement.signedBy || '',
      matterId: agreement.matterId?.toString() || '',
      organizationId: agreement.organizationId?.toString() || '',
      estimateId: agreement.estimateId?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vendor agreement?')) return;
    
    try {
      const response = await fetch(`/api/vendor-agreements/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete vendor agreement');
      }

      await fetchAgreements();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      agreementText: '',
      signedBy: '',
      matterId: '',
      organizationId: '',
      estimateId: ''
    });
  };

  const formatSignedBy = (signedBy) => {
    return signedBy.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
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
          <div className="text-lg">Loading vendor agreements...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Agreements</h1>
            <p className="mt-2 text-gray-600">
              Manage vendor agreements for matters
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingAgreement(null);
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Agreement
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Agreement Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingAgreement ? 'Edit Vendor Agreement' : 'Add New Vendor Agreement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Matter *
                  </label>
                  <select
                    value={formData.matterId}
                    onChange={(e) => setFormData({ ...formData, matterId: e.target.value, estimateId: '' })}
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
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value, estimateId: '' })}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Signed By *
                  </label>
                  <select
                    value={formData.signedBy}
                    onChange={(e) => setFormData({ ...formData, signedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Signatory</option>
                    {signedByOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Estimate (Optional)
                  </label>
                  <select
                    value={formData.estimateId}
                    onChange={(e) => setFormData({ ...formData, estimateId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.matterId || !formData.organizationId}
                  >
                    <option value="">No related estimate</option>
                    {getFilteredEstimates().map(estimate => (
                      <option key={estimate.id} value={estimate.id}>
                        {formatCurrency(estimate.totalCost)} - {estimate.description.substring(0, 50)}...
                      </option>
                    ))}
                  </select>
                  {(!formData.matterId || !formData.organizationId) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Select matter and vendor first to see related estimates
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agreement Text *
                </label>
                <textarea
                  value={formData.agreementText}
                  onChange={(e) => setFormData({ ...formData, agreementText: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the full agreement text, terms, conditions, and any relevant details..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingAgreement ? 'Update Agreement' : 'Create Agreement'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingAgreement(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Agreements List */}
        <div className="grid gap-6">
          {agreements.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendor agreements yet</h3>
              <p className="text-gray-600">Get started by adding your first vendor agreement.</p>
            </div>
          ) : (
            agreements.map((agreement) => (
              <div key={agreement.id} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        <Link 
                          to={`/matters/${agreement.matter.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {agreement.matter.matterNumber} - {agreement.matter.matterName}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <Link 
                          to={`/organizations/${agreement.organization.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {agreement.organization.name}
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Signed by: <span className="font-medium">{formatSignedBy(agreement.signedBy)}</span></span>
                      </div>
                      {agreement.estimate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />
                          <span>Related estimate: </span>
                          <Link 
                            to={`/estimates/${agreement.estimate.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {formatCurrency(agreement.estimate.totalCost)}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(agreement)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(agreement.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Link 
                  to={`/vendor-agreements/${agreement.id}`}
                  className="block mb-4 p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <p className="text-gray-700 whitespace-pre-wrap">{agreement.agreementText}</p>
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    Click to view full details →
                  </div>
                </Link>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created: {new Date(agreement.createdAt).toLocaleDateString()}
                  </div>
                  {agreement.updatedAt !== agreement.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Updated: {new Date(agreement.updatedAt).toLocaleDateString()}
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

export default VendorAgreements;
