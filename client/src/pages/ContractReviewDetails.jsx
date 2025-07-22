import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { 
  FileText, 
  Building, 
  User, 
  Monitor, 
  FileBarChart, 
  Calendar, 
  ArrowLeft, 
  Edit, 
  DollarSign,
  FileCheck,
  Receipt
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ContractReviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contractReview, setContractReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContractReview();
  }, [id]);

  const fetchContractReview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contract-reviews/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setContractReview(data);
      } else {
        setError('Contract review not found');
      }
    } catch (error) {
      console.error('Error fetching contract review:', error);
      setError('Failed to fetch contract review details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading contract review details...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={() => navigate('/contract-reviews')} className="bg-blue-500 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contract Reviews
          </Button>
        </div>
      </Layout>
    );
  }

  if (!contractReview) {
    return (
      <Layout>
        <div className="text-center py-8">Contract review not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/contract-reviews')}
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {contractReview.batchTitle || `Contract Review #${contractReview.id}`}
              </h1>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(contractReview.status)}`}>
                {contractReview.status || 'Discussing'}
              </span>
            </div>
          </div>
          <Link
            to={`/contract-reviews/edit/${contractReview.id}`}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-3 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Matter</div>
                    <div className="font-medium">
                      {contractReview.matter?.client?.clientName || 'Unknown Client'} - {contractReview.matter?.matterName || 'Unknown Matter'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Monitor className="w-5 h-5 mr-3 text-indigo-500" />
                  <div>
                    <div className="text-sm text-gray-500">Workspace</div>
                    {contractReview.workspace ? (
                      <a 
                        href={contractReview.workspace.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        {contractReview.workspace.type} Workspace
                      </a>
                    ) : (
                      <div className="text-gray-500">No workspace assigned</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Building className="w-5 h-5 mr-3 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-500">Vendor Organization</div>
                    <div className="font-medium">{contractReview.vendorOrganization?.name || 'Unknown Vendor'}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="w-5 h-5 mr-3 text-purple-500" />
                  <div>
                    <div className="text-sm text-gray-500">Review Manager</div>
                    <div className="font-medium">
                      {contractReview.reviewManager 
                        ? `${contractReview.reviewManager.firstName} ${contractReview.reviewManager.lastName}`
                        : 'No manager assigned'
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <FileBarChart className="w-5 h-5 mr-3 text-orange-500" />
                  <div>
                    <div className="text-sm text-gray-500">Document Count</div>
                    <div className="font-medium">{contractReview.reviewDocumentCount?.toLocaleString() || '0'} documents</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-teal-500" />
                  <div>
                    <div className="text-sm text-gray-500">Timeline</div>
                    <div className="font-medium">
                      {contractReview.startDate && contractReview.endDate ? (
                        <>
                          {new Date(contractReview.startDate).toLocaleDateString()} - {new Date(contractReview.endDate).toLocaleDateString()}
                        </>
                      ) : contractReview.startDate ? (
                        <>Started: {new Date(contractReview.startDate).toLocaleDateString()}</>
                      ) : contractReview.endDate ? (
                        <>Due: {new Date(contractReview.endDate).toLocaleDateString()}</>
                      ) : (
                        'No timeline set'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Items */}
            {((contractReview.estimates && contractReview.estimates.length > 0) ||
              (contractReview.vendorAgreements && contractReview.vendorAgreements.length > 0) ||
              (contractReview.invoices && contractReview.invoices.length > 0)) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Linked Items</h2>
                
                {/* Estimates */}
                {contractReview.estimates && contractReview.estimates.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-blue-500" />
                      Estimates ({contractReview.estimates.length})
                    </h3>
                    <div className="space-y-2">
                      {contractReview.estimates.map((estimate) => (
                        <div key={estimate.id} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Link 
                            to={`/estimates/${estimate.id}`}
                            className="block"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-blue-600 hover:text-blue-800">${estimate.amount?.toLocaleString() || '0'}</div>
                                <div className="text-sm text-gray-600">{estimate.organization?.name || 'Unknown Organization'}</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vendor Agreements */}
                {contractReview.vendorAgreements && contractReview.vendorAgreements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <FileCheck className="w-5 h-5 mr-2 text-green-500" />
                      Vendor Agreements ({contractReview.vendorAgreements.length})
                    </h3>
                    <div className="space-y-2">
                      {contractReview.vendorAgreements.map((agreement) => (
                        <div key={agreement.id} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Link 
                            to={`/vendor-agreements/${agreement.id}`}
                            className="block"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-blue-600 hover:text-blue-800">{agreement.title || 'Untitled Agreement'}</div>
                                <div className="text-sm text-gray-600">{agreement.organization?.name || 'Unknown Organization'}</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoices */}
                {contractReview.invoices && contractReview.invoices.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <Receipt className="w-5 h-5 mr-2 text-orange-500" />
                      Invoices ({contractReview.invoices.length})
                    </h3>
                    <div className="space-y-2">
                      {contractReview.invoices.map((invoice) => (
                        <div key={invoice.id} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Link 
                            to={`/invoices/${invoice.id}`}
                            className="block"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-blue-600 hover:text-blue-800">
                                  {invoice.invoiceNumber || 'No Number'} - ${invoice.amount?.toLocaleString() || '0'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Due: {new Date(invoice.dueDate || invoice.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{contractReview.status || 'Discussing'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents:</span>
                  <span className="font-medium">{contractReview.reviewDocumentCount?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimates:</span>
                  <span className="font-medium">{contractReview.estimates?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agreements:</span>
                  <span className="font-medium">{contractReview.vendorAgreements?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoices:</span>
                  <span className="font-medium">{contractReview.invoices?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContractReviewDetails;
