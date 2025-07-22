import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const EditContractReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    batchTitle: '',
    matterId: '',
    workspaceId: '',
    vendorOrganizationId: '',
    reviewManagerId: '',
    reviewDocumentCount: '',
    status: 'Discussing',
    startDate: '',
    endDate: '',
    estimateIds: [],
    vendorAgreementIds: [],
    invoiceIds: []
  });

  const [matters, setMatters] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [people, setPeople] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [vendorAgreements, setVendorAgreements] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchContractReview();
    fetchRelatedData();
  }, [id]);

  const fetchContractReview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contract-reviews/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          batchTitle: data.batchTitle || '',
          matterId: data.matterId || '',
          workspaceId: data.workspaceId || '',
          vendorOrganizationId: data.vendorOrganizationId || '',
          reviewManagerId: data.reviewManagerId || '',
          reviewDocumentCount: data.reviewDocumentCount || '',
          status: data.status || 'Discussing',
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          endDate: data.endDate ? data.endDate.split('T')[0] : '',
          estimateIds: data.estimates?.map(e => e.id) || [],
          vendorAgreementIds: data.vendorAgreements?.map(va => va.id) || [],
          invoiceIds: data.invoices?.map(i => i.id) || []
        });
      } else {
        setError('Contract review not found');
      }
    } catch (error) {
      console.error('Error fetching contract review:', error);
      setError('Failed to fetch contract review');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [mattersRes, workspacesRes, organizationsRes, peopleRes, estimatesRes, vendorAgreementsRes, invoicesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/matters`),
        fetch(`${API_BASE_URL}/workspaces`),
        fetch(`${API_BASE_URL}/organizations`),
        fetch(`${API_BASE_URL}/people`),
        fetch(`${API_BASE_URL}/estimates`),
        fetch(`${API_BASE_URL}/vendor-agreements`),
        fetch(`${API_BASE_URL}/invoices`)
      ]);

      if (mattersRes.ok) setMatters(await mattersRes.json());
      if (workspacesRes.ok) setWorkspaces(await workspacesRes.json());
      if (organizationsRes.ok) setOrganizations(await organizationsRes.json());
      if (peopleRes.ok) setPeople(await peopleRes.json());
      if (estimatesRes.ok) setEstimates(await estimatesRes.json());
      if (vendorAgreementsRes.ok) setVendorAgreements(await vendorAgreementsRes.json());
      if (invoicesRes.ok) setInvoices(await invoicesRes.json());
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (e, fieldName) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({
      ...prev,
      [fieldName]: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/contract-reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          matterId: parseInt(formData.matterId),
          workspaceId: parseInt(formData.workspaceId),
          vendorOrganizationId: formData.vendorOrganizationId ? parseInt(formData.vendorOrganizationId) : null,
          reviewManagerId: formData.reviewManagerId ? parseInt(formData.reviewManagerId) : null,
          reviewDocumentCount: formData.reviewDocumentCount ? parseInt(formData.reviewDocumentCount) : null,
        }),
      });

      if (response.ok) {
        navigate(`/contract-reviews/${id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update contract review');
      }
    } catch (error) {
      console.error('Error updating contract review:', error);
      setError('Failed to update contract review');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading contract review...</div>
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

  // Filter workspaces based on selected matter
  const filteredWorkspaces = formData.matterId 
    ? workspaces.filter(workspace => workspace.matterId === parseInt(formData.matterId))
    : [];

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate(`/contract-reviews/${id}`)}
            className="bg-gray-500 text-white hover:bg-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Contract Review</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Matter Selection */}
            <div>
              <label htmlFor="matterId" className="block text-sm font-medium text-gray-700 mb-2">
                Matter *
              </label>
              <select
                id="matterId"
                name="matterId"
                value={formData.matterId}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a matter</option>
                {matters.map((matter) => (
                  <option key={matter.id} value={matter.id}>
                    {matter.client?.clientName || 'Unknown Client'} - {matter.matterName}
                  </option>
                ))}
              </select>
            </div>

            {/* Workspace Selection */}
            <div>
              <label htmlFor="workspaceId" className="block text-sm font-medium text-gray-700 mb-2">
                Workspace *
              </label>
              <select
                id="workspaceId"
                name="workspaceId"
                value={formData.workspaceId}
                onChange={handleInputChange}
                required
                disabled={!formData.matterId}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select a workspace</option>
                {filteredWorkspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.type} Workspace
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Title */}
            <div>
              <label htmlFor="batchTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Batch Title
              </label>
              <input
                type="text"
                id="batchTitle"
                name="batchTitle"
                value={formData.batchTitle}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter batch title"
              />
            </div>

            {/* Vendor Organization */}
            <div>
              <label htmlFor="vendorOrganizationId" className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Organization
              </label>
              <select
                id="vendorOrganizationId"
                name="vendorOrganizationId"
                value={formData.vendorOrganizationId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select vendor organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Review Manager */}
            <div>
              <label htmlFor="reviewManagerId" className="block text-sm font-medium text-gray-700 mb-2">
                Review Manager
              </label>
              <select
                id="reviewManagerId"
                name="reviewManagerId"
                value={formData.reviewManagerId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select review manager</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Count and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reviewDocumentCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Document Count
                </label>
                <input
                  type="number"
                  id="reviewDocumentCount"
                  name="reviewDocumentCount"
                  value={formData.reviewDocumentCount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Number of documents"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Discussing">Discussing</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Linked Items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="estimateIds" className="block text-sm font-medium text-gray-700 mb-2">
                  Link Estimates
                </label>
                <select
                  id="estimateIds"
                  name="estimateIds"
                  multiple
                  value={formData.estimateIds.map(String)}
                  onChange={(e) => handleMultiSelectChange(e, 'estimateIds')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                >
                  {estimates
                    .filter(estimate => {
                      const matterMatch = !formData.matterId || estimate.matterId === parseInt(formData.matterId);
                      const orgMatch = !formData.vendorOrganizationId || estimate.organizationId === parseInt(formData.vendorOrganizationId);
                      return matterMatch && orgMatch;
                    })
                    .map((estimate) => (
                    <option key={estimate.id} value={estimate.id}>
                      ${estimate.amount?.toLocaleString() || '0'} - {estimate.organization?.name || 'Unknown'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label htmlFor="vendorAgreementIds" className="block text-sm font-medium text-gray-700 mb-2">
                  Link Vendor Agreements
                </label>
                <select
                  id="vendorAgreementIds"
                  name="vendorAgreementIds"
                  multiple
                  value={formData.vendorAgreementIds.map(String)}
                  onChange={(e) => handleMultiSelectChange(e, 'vendorAgreementIds')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                >
                  {vendorAgreements
                    .filter(agreement => {
                      const matterMatch = !formData.matterId || agreement.matterId === parseInt(formData.matterId);
                      const orgMatch = !formData.vendorOrganizationId || agreement.organizationId === parseInt(formData.vendorOrganizationId);
                      return matterMatch && orgMatch;
                    })
                    .map((agreement) => (
                    <option key={agreement.id} value={agreement.id}>
                      {agreement.title || 'Untitled'} - {agreement.organization?.name || 'Unknown'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label htmlFor="invoiceIds" className="block text-sm font-medium text-gray-700 mb-2">
                  Link Invoices
                </label>
                <select
                  id="invoiceIds"
                  name="invoiceIds"
                  multiple
                  value={formData.invoiceIds.map(String)}
                  onChange={(e) => handleMultiSelectChange(e, 'invoiceIds')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                >
                  {invoices
                    .filter(invoice => {
                      const matterMatch = !formData.matterId || invoice.matterId === parseInt(formData.matterId);
                      const orgMatch = !formData.vendorOrganizationId || invoice.organizationId === parseInt(formData.vendorOrganizationId);
                      return matterMatch && orgMatch;
                    })
                    .map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber || 'No Number'} - ${invoice.amount?.toLocaleString() || '0'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                onClick={() => navigate(`/contract-reviews/${id}`)}
                className="bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditContractReview;
