import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, DollarSign } from 'lucide-react';

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [matters, setMatters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [formData, setFormData] = useState({
    invoiceDate: '',
    invoiceAmount: '',
    approved: false,
    status: 'RECEIVED',
    matterId: '',
    organizationId: '',
    estimateId: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  useEffect(() => {
    if (formData.matterId && formData.organizationId && !fetchingData) {
      fetchEstimates();
    } else if (!fetchingData) {
      setEstimates([]);
      setFormData(prev => ({ ...prev, estimateId: '' }));
    }
  }, [formData.matterId, formData.organizationId, fetchingData]);

  const fetchInitialData = async () => {
    try {
      const [invoiceRes, mattersRes, vendorsRes, statusRes] = await Promise.all([
        fetch(`http://localhost:5001/api/invoices/${id}`),
        fetch('http://localhost:5001/api/matters'),
        fetch('http://localhost:5001/api/organizations'),
        fetch('http://localhost:5001/api/invoices/status-options')
      ]);

      if (!invoiceRes.ok || !mattersRes.ok || !vendorsRes.ok || !statusRes.ok) {
        throw new Error('Failed to fetch initial data');
      }

      const [invoiceData, mattersData, organizationsData, statusData] = await Promise.all([
        invoiceRes.json(),
        mattersRes.json(),
        vendorsRes.json(),
        statusRes.json()
      ]);

      setMatters(mattersData);
      setVendors(organizationsData.filter(org => org.type === 'VENDOR'));
      setStatusOptions(statusData);

      // Set form data from existing invoice
      setFormData({
        invoiceDate: new Date(invoiceData.invoiceDate).toISOString().split('T')[0],
        invoiceAmount: invoiceData.invoiceAmount.toString(),
        approved: invoiceData.approved,
        status: invoiceData.status,
        matterId: invoiceData.matterId.toString(),
        organizationId: invoiceData.organizationId.toString(),
        estimateId: invoiceData.estimateId ? invoiceData.estimateId.toString() : ''
      });

      setFetchingData(false);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      alert('Failed to load invoice data');
      navigate('/invoices');
    }
  };

  const fetchEstimates = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/estimates');
      if (!response.ok) {
        throw new Error('Failed to fetch estimates');
      }
      const data = await response.json();
      
      // Filter estimates that match the selected matter and organization
      const filteredEstimates = data.filter(
        estimate => estimate.matterId === parseInt(formData.matterId) && 
                   estimate.organizationId === parseInt(formData.organizationId)
      );
      
      setEstimates(filteredEstimates);
    } catch (error) {
      console.error('Error fetching estimates:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5001/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          matterId: parseInt(formData.matterId),
          organizationId: parseInt(formData.organizationId),
          estimateId: formData.estimateId ? parseInt(formData.estimateId) : null,
          invoiceAmount: parseFloat(formData.invoiceAmount)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice');
      }

      navigate(`/invoices/${id}`);
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert(error.message || 'Failed to update invoice');
    } finally {
      setLoading(false);
    }
  };

  const formatStatusDisplay = (status) => {
    switch (status) {
      case 'RECEIVED':
        return 'Received';
      case 'SUBMITTED':
        return 'Submitted';
      case 'QUESTION':
        return 'Question';
      case 'PAID':
        return 'Paid';
      default:
        return status;
    }
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading invoice...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/invoices/${id}`)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoice
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Invoice #{id}</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  name="invoiceAmount"
                  value={formData.invoiceAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matter *
              </label>
              <select
                name="matterId"
                value={formData.matterId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a matter</option>
                {matters.map(matter => (
                  <option key={matter.id} value={matter.id}>
                    {matter.matterName} ({matter.client?.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor *
              </label>
              <select
                name="organizationId"
                value={formData.organizationId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Estimate (Optional)
              </label>
              <select
                name="estimateId"
                value={formData.estimateId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={!formData.matterId || !formData.organizationId}
              >
                <option value="">No related estimate</option>
                {estimates.map(estimate => (
                  <option key={estimate.id} value={estimate.id}>
                    {estimate.description.substring(0, 50)}... (${estimate.totalCost})
                  </option>
                ))}
              </select>
              {(!formData.matterId || !formData.organizationId) && (
                <p className="text-sm text-gray-500 mt-1">
                  Select matter and vendor first to see available estimates
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {formatStatusDisplay(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="approved"
                checked={formData.approved}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Invoice Approved
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/invoices/${id}`)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInvoice;
