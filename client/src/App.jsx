import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Matters from './pages/Matters';
import MatterDetail from './pages/MatterDetail';
import People from './pages/People';
import PersonDetail from './pages/PersonDetail';
import Organizations from './pages/Organizations';
import OrganizationDetail from './pages/OrganizationDetail';
import Estimates from './pages/Estimates';
import EstimateDetail from './pages/EstimateDetail';
import VendorAgreements from './pages/VendorAgreements';
import VendorAgreementDetail from './pages/VendorAgreementDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import CreateInvoice from './pages/CreateInvoice';
import EditInvoice from './pages/EditInvoice';
import Custodians from './pages/Custodians';
import CustodianDetail from './pages/CustodianDetail';
import CreateCustodian from './pages/CreateCustodian';
import EditCustodian from './pages/EditCustodian';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import CreateCollection from './pages/CreateCollection';
import EditCollection from './pages/EditCollection';
import CreateWorkspace from './pages/CreateWorkspace';
import EditWorkspace from './pages/EditWorkspace';
import ContractReviews from './pages/ContractReviews';
import ContractReviewDetails from './pages/ContractReviewDetails';
import EditContractReview from './pages/EditContractReview';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Users from './pages/Users';
import Kanban from './pages/Kanban';
import ApiTest from './pages/ApiTest';
import './styles/globals.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/matters" element={<Matters />} />
        <Route path="/matters/:id" element={<MatterDetail />} />
        <Route path="/people" element={<People />} />
        <Route path="/people/:id" element={<PersonDetail />} />
        <Route path="/organizations" element={<Organizations />} />
        <Route path="/organizations/:id" element={<OrganizationDetail />} />
        <Route path="/estimates" element={<Estimates />} />
        <Route path="/estimates/:id" element={<EstimateDetail />} />
        <Route path="/vendor-agreements" element={<VendorAgreements />} />
        <Route path="/vendor-agreements/:id" element={<VendorAgreementDetail />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/new" element={<CreateInvoice />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/invoices/:id/edit" element={<EditInvoice />} />
        <Route path="/custodians" element={<Custodians />} />
        <Route path="/custodians/new" element={<CreateCustodian />} />
        <Route path="/custodians/:id" element={<CustodianDetail />} />
        <Route path="/custodians/:id/edit" element={<EditCustodian />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collections/new" element={<CreateCollection />} />
        <Route path="/collections/:id" element={<CollectionDetail />} />
        <Route path="/collections/:id/edit" element={<EditCollection />} />
        <Route path="/workspaces/create" element={<CreateWorkspace />} />
        <Route path="/workspaces/:id/edit" element={<EditWorkspace />} />
        <Route path="/contract-reviews" element={<ContractReviews />} />
        <Route path="/contract-reviews/:id" element={<ContractReviewDetails />} />
        <Route path="/contract-reviews/edit/:id" element={<EditContractReview />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/users" element={<Users />} />
        <Route path="/kanban" element={<Kanban />} />
        <Route path="/api-test" element={<ApiTest />} />
      </Routes>
    </Router>
  );
};

export default App;