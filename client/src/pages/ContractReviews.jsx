import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { FileText, Plus, Edit, Trash2, Building, User, Monitor, FileBarChart, Calendar, AlertCircle, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ContractReviews = () => {
  const [contractReviews, setContractReviews] = useState([]);
  const [matters, setMatters] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [people, setPeople] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    matterId: '',
    workspaceId: '',
    status: 'Discussing',
    startDate: '',
    endDate: '',
    reviewDocumentCount: '',
    vendorOrganizationId: '',
    reviewManagerId: '',
    batchTitle: '',
    estimateIds: [],
    agreementIds: [],
    invoiceIds: []
  });

  // Filter contract reviews based on search term
  const filteredContractReviews = contractReviews.filter(review => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (review.batchTitle && review.batchTitle.toLowerCase().includes(searchLower)) ||
      review.status.toLowerCase().includes(searchLower) ||
      (review.matter && review.matter.matterName.toLowerCase().includes(searchLower)) ||
      (review.matter && review.matter.client && review.matter.client.clientName.toLowerCase().includes(searchLower)) ||
      (review.vendorOrganization && review.vendorOrganization.name.toLowerCase().includes(searchLower)) ||
      (review.reviewManager && `${review.reviewManager.firstName} ${review.reviewManager.lastName}`.toLowerCase().includes(searchLower)) ||
      (review.workspace && review.workspace.name.toLowerCase().includes(searchLower))
    );
  });

  // Calculate contract review status counts
  const contractReviewStats = {
    discussing: contractReviews.filter(r => r.status === 'Discussing').length,
    inProgress: contractReviews.filter(r => r.status === 'In Progress').length,
    completed: contractReviews.filter(r => r.status === 'Completed').length,
    withEstimates: contractReviews.filter(r => r.estimates && r.estimates.length > 0).length,
    withAgreements: contractReviews.filter(r => r.agreements && r.agreements.length > 0).length
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsResponse, mattersResponse, organizationsResponse, peopleResponse, workspacesResponse, estimatesResponse, agreementsResponse, invoicesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/contract-reviews`),
        fetch(`${API_BASE_URL}/matters`),
        fetch(`${API_BASE_URL}/organizations`),
        fetch(`${API_BASE_URL}/people`),
        fetch(`${API_BASE_URL}/workspaces`),
        fetch(`${API_BASE_URL}/estimates`),
        fetch(`${API_BASE_URL}/vendor-agreements`),
        fetch(`${API_BASE_URL}/invoices`)
      ]);

      if (reviewsResponse.ok && mattersResponse.ok && organizationsResponse.ok && peopleResponse.ok && workspacesResponse.ok && estimatesResponse.ok && agreementsResponse.ok && invoicesResponse.ok) {
        const [reviews, allMatters, allOrganizations, allPeople, allWorkspaces, allEstimates, allAgreements, allInvoices] = await Promise.all([
          reviewsResponse.json(),
          mattersResponse.json(),
          organizationsResponse.json(),
          peopleResponse.json(),
          workspacesResponse.json(),
          estimatesResponse.json(),
          agreementsResponse.json(),
          invoicesResponse.json()
        ]);

        setContractReviews(reviews);
        setMatters(allMatters);
        setVendors(allOrganizations.filter(org => org.type === 'VENDOR'));
        setPeople(allPeople);
        setWorkspaces(allWorkspaces);
        setEstimates(allEstimates);
        setAgreements(allAgreements);
        setInvoices(allInvoices);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // When matter changes, reset workspace and linked items
    if (name === 'matterId') {
      setFormData(prev => ({
        ...prev,
        workspaceId: '',
        estimateIds: [],
        agreementIds: [],
        invoiceIds: []
      }));
    }

    // When vendor changes, filter available review managers
    if (name === 'vendorOrganizationId') {
      setFormData(prev => ({
        ...prev,
        reviewManagerId: '' // Reset review manager when vendor changes
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingReview 
        ? `${API_BASE_URL}/contract-reviews/${editingReview.id}`
        : `${API_BASE_URL}/contract-reviews`;
      
      const method = editingReview ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchData();
        resetForm();
        setShowModal(false);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving contract review:', error);
      alert('Error saving contract review');
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setFormData({
      matterId: review.matterId.toString(),
      workspaceId: review.workspaceId ? review.workspaceId.toString() : '',
      status: review.status || 'Discussing',
      startDate: review.startDate ? new Date(review.startDate).toISOString().split('T')[0] : '',
      endDate: review.endDate ? new Date(review.endDate).toISOString().split('T')[0] : '',
      reviewDocumentCount: review.reviewDocumentCount.toString(),
      vendorOrganizationId: review.vendorOrganizationId.toString(),
      reviewManagerId: review.reviewManagerId ? review.reviewManagerId.toString() : '',
      batchTitle: review.batchTitle || '',
      estimateIds: review.estimates ? review.estimates.map(e => e.id.toString()) : [],
      agreementIds: review.vendorAgreements ? review.vendorAgreements.map(a => a.id.toString()) : [],
      invoiceIds: review.invoices ? review.invoices.map(i => i.id.toString()) : []
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this contract review?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/contract-reviews/${reviewId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchData();
        } else {
          alert('Error deleting contract review');
        }
      } catch (error) {
        console.error('Error deleting contract review:', error);
        alert('Error deleting contract review');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      matterId: '',
      workspaceId: '',
      status: 'Discussing',
      startDate: '',
      endDate: '',
      reviewDocumentCount: '',
      vendorOrganizationId: '',
      reviewManagerId: '',
      batchTitle: '',
      estimateIds: [],
      agreementIds: [],
      invoiceIds: []
    });
    setEditingReview(null);
  };

  // Get available review managers for selected vendor
  const getAvailableReviewManagers = () => {
    if (!formData.vendorOrganizationId) return [];
    return people.filter(person => 
      person.organizationId === parseInt(formData.vendorOrganizationId)
    );
  };

  // Get workspaces for selected matter
  const getAvailableWorkspaces = () => {
    if (!formData.matterId || !workspaces) return [];
    return workspaces.filter(workspace => workspace.matterId === parseInt(formData.matterId));
  };

  // Get estimates for selected matter and organization
  const getAvailableEstimates = () => {
    if (!formData.matterId || !estimates) return [];
    return estimates.filter(estimate => {
      const matterMatch = estimate.matterId === parseInt(formData.matterId);
      const orgMatch = !formData.vendorOrganizationId || estimate.organizationId === parseInt(formData.vendorOrganizationId);
      return matterMatch && orgMatch;
    });
  };

  // Get agreements for selected matter and organization
  const getAvailableAgreements = () => {
    if (!formData.matterId || !agreements) return [];
    return agreements.filter(agreement => {
      const matterMatch = agreement.matterId === parseInt(formData.matterId);
      const orgMatch = !formData.vendorOrganizationId || agreement.organizationId === parseInt(formData.vendorOrganizationId);
      return matterMatch && orgMatch;
    });
  };

  // Get invoices for selected matter and organization
  const getAvailableInvoices = () => {
    if (!formData.matterId || !invoices) return [];
    return invoices.filter(invoice => {
      const matterMatch = invoice.matterId === parseInt(formData.matterId);
      const orgMatch = !formData.vendorOrganizationId || invoice.organizationId === parseInt(formData.vendorOrganizationId);
      return matterMatch && orgMatch;
    });
  };

  // Handle multi-select changes
  const handleMultiSelectChange = (name, selectedOptions) => {
    const values = Array.from(selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      [name]: values
    }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Contract Reviews</h1>
            <p className="text-gray-600">
              Manage contract review projects • {contractReviews.length} total {contractReviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Contract Review
          </Button>
        </div>

        {/* Contract Review Status Breakdown */}
        {contractReviews.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contract Reviews by Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Discussing
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {contractReviewStats.discussing}
                </p>
              </div>
              <div className="text-center">
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  In Progress
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {contractReviewStats.inProgress}
                </p>
              </div>
              <div className="text-center">
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Completed
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {contractReviewStats.completed}
                </p>
              </div>
              <div className="text-center">
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  With Estimates
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {contractReviewStats.withEstimates}
                </p>
              </div>
              <div className="text-center">
                <div className="px-3 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  With Agreements
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {contractReviewStats.withAgreements}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Search Contract Reviews</h2>
            <span className="text-sm text-gray-500">
              {searchTerm ? `${filteredContractReviews.length} of ${contractReviews.length} reviews` : `${contractReviews.length} total reviews`}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reviews by title, status, matter, vendor, manager, or workspace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {filteredContractReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No contract reviews found matching your search. Try adjusting your search terms.' : 'No contract reviews found. Create your first contract review to get started.'}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredContractReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-md p-6 border">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        <Link 
                          to={`/contract-reviews/${review.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {review.batchTitle || `Contract Review #${review.id}`}
                        </Link>
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        review.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {review.status || 'Discussing'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        <span>{review.matter?.client?.clientName || 'Unknown Client'} - {review.matter?.matterName || 'Unknown Matter'}</span>
                      </div>
                      <div className="flex items-center">
                        <Monitor className="w-4 h-4 mr-2 text-indigo-500" />
                        {review.workspace ? (
                          <a 
                            href={review.workspace.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {review.workspace.type} Workspace
                          </a>
                        ) : (
                          <span>No workspace assigned</span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-green-500" />
                        <span>{review.vendorOrganization?.name || 'Unknown Vendor'}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{review.reviewManager ? `${review.reviewManager.firstName} ${review.reviewManager.lastName}` : 'No manager assigned'}</span>
                      </div>
                      <div className="flex items-center">
                        <FileBarChart className="w-4 h-4 mr-2 text-orange-500" />
                        <span>{review.reviewDocumentCount?.toLocaleString() || '0'} documents</span>
                      </div>
                      {(review.startDate || review.endDate) && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-teal-500" />
                          <span>
                            {review.startDate && new Date(review.startDate).toLocaleDateString()}
                            {review.startDate && review.endDate && ' - '}
                            {review.endDate && new Date(review.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Created: {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleEditClick(review)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(review.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Related items summary */}
                {((review.estimates && review.estimates.length > 0) || (review.vendorAgreements && review.vendorAgreements.length > 0) || (review.invoices && review.invoices.length > 0)) && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex space-x-6 text-sm">
                      {review.estimates && review.estimates.length > 0 && (
                        <span className="text-blue-600">
                          {review.estimates.length} Estimate{review.estimates.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {review.vendorAgreements && review.vendorAgreements.length > 0 && (
                        <span className="text-green-600">
                          {review.vendorAgreements.length} Agreement{review.vendorAgreements.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {review.invoices && review.invoices.length > 0 && (
                        <span className="text-orange-600">
                          {review.invoices.length} Invoice{review.invoices.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal for Add/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingReview ? 'Edit Contract Review' : 'Add Contract Review'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Matter *</label>
                  <select
                    name="matterId"
                    value={formData.matterId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Matter</option>
                    {matters.map((matter) => (
                      <option key={matter.id} value={matter.id}>
                        {matter.client.clientName} - {matter.matterName} (#{matter.matterNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Workspace *</label>
                  <select
                    name="workspaceId"
                    value={formData.workspaceId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                    disabled={!formData.matterId}
                  >
                    <option value="">Select Workspace</option>
                    {getAvailableWorkspaces().map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.type} - {workspace.organization?.name}
                      </option>
                    ))}
                  </select>
                  {!formData.matterId && (
                    <p className="text-sm text-gray-500 mt-1">Select a matter first</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="Discussing">Discussing</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Review Document Count *</label>
                  <input
                    type="number"
                    name="reviewDocumentCount"
                    value={formData.reviewDocumentCount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Vendor Organization *</label>
                  <select
                    name="vendorOrganizationId"
                    value={formData.vendorOrganizationId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Review Manager (Optional)</label>
                  <select
                    name="reviewManagerId"
                    value={formData.reviewManagerId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={!formData.vendorOrganizationId}
                  >
                    <option value="">Select Review Manager</option>
                    {getAvailableReviewManagers().map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.firstName} {person.lastName}
                      </option>
                    ))}
                  </select>
                  {!formData.vendorOrganizationId && (
                    <p className="text-sm text-gray-500 mt-1">Select a vendor first</p>
                  )}
                </div>

                {/* Linked Items Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Link Related Items (Optional)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Estimates</label>
                      <select
                        multiple
                        name="estimateIds"
                        value={formData.estimateIds}
                        onChange={(e) => handleMultiSelectChange('estimateIds', e.target.selectedOptions)}
                        className="w-full p-2 border border-gray-300 rounded-md h-24"
                        disabled={!formData.matterId}
                      >
                        {getAvailableEstimates().map((estimate) => (
                          <option key={estimate.id} value={estimate.id}>
                            ${estimate.amount?.toLocaleString() || '0'} - {estimate.organization?.name || 'Unknown'} ({new Date(estimate.createdAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                      {!formData.matterId && (
                        <p className="text-sm text-gray-500 mt-1">Select a matter first</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Vendor Agreements</label>
                      <select
                        multiple
                        name="agreementIds"
                        value={formData.agreementIds}
                        onChange={(e) => handleMultiSelectChange('agreementIds', e.target.selectedOptions)}
                        className="w-full p-2 border border-gray-300 rounded-md h-24"
                        disabled={!formData.matterId}
                      >
                        {getAvailableAgreements().map((agreement) => (
                          <option key={agreement.id} value={agreement.id}>
                            {agreement.title || 'Untitled'} - {agreement.organization?.name || 'Unknown'} ({new Date(agreement.createdAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                      {!formData.matterId && (
                        <p className="text-sm text-gray-500 mt-1">Select a matter first</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Invoices</label>
                      <select
                        multiple
                        name="invoiceIds"
                        value={formData.invoiceIds}
                        onChange={(e) => handleMultiSelectChange('invoiceIds', e.target.selectedOptions)}
                        className="w-full p-2 border border-gray-300 rounded-md h-24"
                        disabled={!formData.matterId}
                      >
                        {getAvailableInvoices().map((invoice) => (
                          <option key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber || 'No Number'} - ${invoice.amount?.toLocaleString() || '0'} ({new Date(invoice.dueDate || invoice.createdAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                      {!formData.matterId && (
                        <p className="text-sm text-gray-500 mt-1">Select a matter first</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Batch Title (Optional)</label>
                  <input
                    type="text"
                    name="batchTitle"
                    value={formData.batchTitle}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter a descriptive title for this review batch"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    {editingReview ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContractReviews;
