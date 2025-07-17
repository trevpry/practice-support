import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, DollarSign, Calendar, CheckCircle, XCircle, FileText, Building2, Briefcase, Receipt } from 'lucide-react';
import Layout from '../components/Layout';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/invoices/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Invoice not found');
        }
        throw new Error('Failed to fetch invoice');
      }
      const data = await response.json();
      setInvoice(data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/invoices/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete invoice');
        }
        navigate('/invoices');
      } catch (err) {
        console.error('Error deleting invoice:', err);
        alert('Failed to delete invoice');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInvoiceStatusColor = (status) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800';
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'QUESTION':
        return 'bg-red-100 text-red-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatInvoiceStatus = (status) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading invoice...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/invoices')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Invoice not found</div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/invoices')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Invoices
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice #{invoice.id}</h1>
            <p className="text-gray-500 mt-1">Created on {formatDate(invoice.createdAt)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/invoices/${invoice.id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Information */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Invoice Date
                </label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{formatDate(invoice.invoiceDate)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Invoice Amount
                </label>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(invoice.invoiceAmount)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Status
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                  {formatInvoiceStatus(invoice.status)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Approval Status
                </label>
                <div className="flex items-center">
                  {invoice.approved ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm text-green-800 font-medium">Approved</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-sm text-red-800 font-medium">Pending Approval</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Information */}
        <div className="space-y-6">
          {/* Matter Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Matter
            </h3>
            <div className="space-y-3">
              <div>
                <Link
                  to={`/matters/${invoice.matter.id}`}
                  className="text-blue-600 hover:text-blue-900 font-medium"
                >
                  {invoice.matter.matterName}
                </Link>
                <p className="text-sm text-gray-500">#{invoice.matter.matterNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Client</label>
                <Link
                  to={`/clients/${invoice.matter.client.id}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  {invoice.matter.client.clientName}
                </Link>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Vendor
            </h3>
            <div className="space-y-3">
              <div>
                <Link
                  to={`/organizations/${invoice.organization.id}`}
                  className="text-blue-600 hover:text-blue-900 font-medium"
                >
                  {invoice.organization.name}
                </Link>
              </div>
              {invoice.organization.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <a
                    href={`mailto:${invoice.organization.email}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {invoice.organization.email}
                  </a>
                </div>
              )}
              {invoice.organization.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <a
                    href={`tel:${invoice.organization.phone}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {invoice.organization.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Related Estimate */}
          {invoice.estimate && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                Related Estimate
              </h3>
              <div className="space-y-3">
                <div>
                  <Link
                    to={`/estimates/${invoice.estimate.id}`}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View Estimate Details
                  </Link>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Estimated Cost</label>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(invoice.estimate.totalCost)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Difference</label>
                  <span className={`font-semibold ${
                    invoice.invoiceAmount > invoice.estimate.totalCost ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {invoice.invoiceAmount > invoice.estimate.totalCost ? '+' : ''}
                    {formatCurrency(invoice.invoiceAmount - invoice.estimate.totalCost)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    {invoice.estimate.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default InvoiceDetail;
