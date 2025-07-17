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