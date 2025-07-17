import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { ArrowLeft, Edit, Trash2, Building2, FileText, DollarSign, Calendar, User } from 'lucide-react';

const VendorAgreementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgreement();
  }, [id]);

  const fetchAgreement = async () => {
    try {
      const response = await fetch(`/api/vendor-agreements/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Vendor agreement not found');
        }
        throw new Error('Failed to fetch vendor agreement');
      }
      const data = await response.json();
      setAgreement(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vendor agreement? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/vendor-agreements/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete vendor agreement');
      }

      navigate('/vendor-agreements');
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatSignedBy = (signedBy) => {
    return signedBy.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading vendor agreement...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/vendor-agreements')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Agreements
            </Button>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  if (!agreement) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Vendor agreement not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/vendor-agreements')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Agreements
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vendor Agreement
              </h1>
              <p className="text-gray-600">
                With {agreement.organization.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate(`/vendor-agreements/${id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="outline"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Agreement Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Agreement Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor Organization
                </label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <Link 
                    to={`/organizations/${agreement.organization.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {agreement.organization.name}
                  </Link>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Matter
                </label>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <Link 
                    to={`/matters/${agreement.matter.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {agreement.matter.matterNumber} - {agreement.matter.matterName}
                  </Link>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signed By
                </label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formatSignedBy(agreement.signedBy)}</span>
                </div>
              </div>
              {agreement.estimate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Estimate
                  </label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <Link 
                      to={`/estimates/${agreement.estimate.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {formatCurrency(agreement.estimate.totalCost)}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created
                </label>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {new Date(agreement.createdAt).toLocaleDateString()}
                </div>
              </div>
              {agreement.updatedAt !== agreement.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {new Date(agreement.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agreement Text */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Agreement Text</h2>
          <div className="prose max-w-none">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{agreement.agreementText}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VendorAgreementDetail;
