import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { Users, FileText, User, TrendingUp, CheckSquare, LayoutGrid } from 'lucide-react';

// Helper function to check if a task is overdue
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  const taskDate = new Date(dueDate);
  
  // Set both dates to midnight for accurate comparison
  today.setHours(0, 0, 0, 0);
  taskDate.setHours(0, 0, 0, 0);
  
  return taskDate < today;
};

// Format matter status for display
const formatMatterStatus = (status) => {
  return status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Collection';
};

// Get matter status color
const getMatterStatusColor = (status) => {
  switch (status) {
    case 'COLLECTION': return 'bg-blue-100 text-blue-800';
    case 'CULLING': return 'bg-yellow-100 text-yellow-800';
    case 'REVIEW': return 'bg-orange-100 text-orange-800';
    case 'PRODUCTION': return 'bg-green-100 text-green-800';
    case 'INACTIVE': return 'bg-gray-100 text-gray-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

const Home = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalMatters: 0,
    totalTasks: 0,
    activeTasks: 0,
    overdueTasks: 0,
    matterStatusCounts: {},
    recentClients: [],
    recentMatters: [],
    recentTasks: []
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsResponse, mattersResponse, tasksResponse, userResponse] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/matters'),
          fetch('/api/auth/current-user/tasks'),
          fetch('/api/auth/current-user')
        ]);

        if (clientsResponse.ok && mattersResponse.ok && tasksResponse.ok && userResponse.ok) {
          const [allClients, allMatters, tasks, user] = await Promise.all([
            clientsResponse.json(),
            mattersResponse.json(),
            tasksResponse.json(),
            userResponse.json()
          ]);

          setCurrentUser(user);

          // Filter clients and matters based on current user's linked person
          let filteredClients = allClients;
          let filteredMatters = allMatters;

          if (user && user.person) {
            const personId = user.person.id;
            
            // Filter clients where the user's person is assigned as attorney, paralegal, or project manager
            filteredClients = allClients.filter(client => 
              client.attorneyId === personId || 
              client.paralegalId === personId || 
              client.projectManagerId === personId
            );

            // Filter matters where the user's person is assigned to the matter directly
            filteredMatters = allMatters.filter(matter => 
              matter.people && matter.people.some(mp => mp.person && mp.person.id === personId)
            );
          }

          const activeTasks = tasks.filter(task => task.status !== 'COMPLETED').length;
          const overdueTasks = tasks.filter(task => 
            task.dueDate && 
            isOverdue(task.dueDate) && 
            task.status !== 'COMPLETED'
          ).length;

          // Calculate matter status breakdown
          const matterStatusCounts = filteredMatters.reduce((acc, matter) => {
            const status = matter.status || 'COLLECTION';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});

          setStats({
            totalClients: filteredClients.length,
            totalMatters: filteredMatters.length,
            totalTasks: tasks.length,
            activeTasks,
            overdueTasks,
            matterStatusCounts,
            recentClients: filteredClients.slice(-5).reverse(),
            recentMatters: filteredMatters.slice(-5).reverse(),
            recentTasks: tasks.slice(-5).reverse()
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Practice Support
            {currentUser && (
              <span className="block text-lg font-normal text-gray-600 mt-2">
                {currentUser.firstName} {currentUser.lastName}
                {currentUser.person && (
                  <span className="text-sm text-blue-600 block">
                    Linked to: {currentUser.person.firstName} {currentUser.person.lastName}
                  </span>
                )}
              </span>
            )}
          </h1>
          <p className="text-xl text-gray-600">
            {currentUser && currentUser.person 
              ? "Your personalized dashboard showing tasks and matters relevant to you"
              : "Manage your law firm's clients and matters efficiently"
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                <p className="text-gray-600">
                  {currentUser && currentUser.person ? "My Clients" : "Total Clients"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalMatters}</p>
                <p className="text-gray-600">
                  {currentUser && currentUser.person ? "My Matters" : "Total Matters"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckSquare className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
                <p className="text-gray-600">
                  {currentUser && currentUser.person ? "My Tasks" : "Total Tasks"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.activeTasks}</p>
                <p className="text-gray-600">
                  {currentUser && currentUser.person ? "My Active Tasks" : "Active Tasks"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <CheckSquare className={`h-8 w-8 ${stats.overdueTasks > 0 ? 'text-red-600' : 'text-gray-400'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${stats.overdueTasks > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {stats.overdueTasks}
                </p>
                <p className="text-gray-600">
                  {currentUser && currentUser.person ? "My Overdue Tasks" : "Overdue Tasks"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTasks > 0 ? Math.round((stats.totalTasks - stats.activeTasks) / stats.totalTasks * 100) : 0}%
                </p>
                <p className="text-gray-600">Completion Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Matter Status Overview */}
        {stats.totalMatters > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {currentUser && currentUser.person ? "My Matters by Status" : "Matters by Status"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['COLLECTION', 'CULLING', 'REVIEW', 'PRODUCTION', 'INACTIVE'].map(status => (
                <div key={status} className="text-center">
                  <div className={`px-3 py-2 rounded-full text-sm font-medium ${getMatterStatusColor(status)}`}>
                    {formatMatterStatus(status)}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.matterStatusCounts[status] || 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link to="/clients">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                <Users className="w-5 h-5 mr-2" />
                Manage Clients
              </Button>
            </Link>
            <Link to="/matters">
              <Button className="w-full bg-green-600 hover:bg-green-700 h-12">
                <FileText className="w-5 h-5 mr-2" />
                Manage Matters
              </Button>
            </Link>
            <Link to="/people">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 h-12">
                <User className="w-5 h-5 mr-2" />
                Manage People
              </Button>
            </Link>
            <Link to="/tasks">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12">
                <CheckSquare className="w-5 h-5 mr-2" />
                Manage Tasks
              </Button>
            </Link>
            <Link to="/kanban">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12">
                <LayoutGrid className="w-5 h-5 mr-2" />
                Kanban Board
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Clients */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {currentUser && currentUser.person ? "My Recent Clients" : "Recent Clients"}
            </h2>
            {stats.recentClients.length === 0 ? (
              <p className="text-gray-500">
                {currentUser && currentUser.person ? "No clients assigned to you yet" : "No clients yet"}
              </p>
            ) : (
              <ul className="space-y-3">
                {stats.recentClients.map((client) => (
                  <li key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <Link 
                        to={`/clients/${client.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {client.clientName}
                      </Link>
                      <p className="text-sm text-gray-500">#{client.clientNumber}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {client.matters.length} matter{client.matters.length !== 1 ? 's' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Matters */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {currentUser && currentUser.person ? "My Recent Matters" : "Recent Matters"}
            </h2>
            {stats.recentMatters.length === 0 ? (
              <p className="text-gray-500">
                {currentUser && currentUser.person ? "No matters assigned to you yet" : "No matters yet"}
              </p>
            ) : (
              <ul className="space-y-3">
                {stats.recentMatters.map((matter) => (
                  <li key={matter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/matters/${matter.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          {matter.matterName}
                        </Link>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatterStatusColor(matter.status)}`}>
                          {formatMatterStatus(matter.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">#{matter.matterNumber}</p>
                    </div>
                    <Link 
                      to={`/clients/${matter.client.id}`}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      {matter.client.clientName}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {currentUser && currentUser.person ? "My Recent Tasks" : "Recent Tasks"}
            </h2>
            {stats.recentTasks.length === 0 ? (
              <p className="text-gray-500">
                {currentUser && currentUser.person ? "No tasks assigned to you yet" : "No tasks yet"}
              </p>
            ) : (
              <ul className="space-y-3">
                {stats.recentTasks.map((task) => (
                  <li key={task.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <Link 
                        to={`/tasks/${task.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {task.title}
                      </Link>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'URGENT' ? 'text-red-600 bg-red-100' :
                          task.priority === 'HIGH' ? 'text-orange-600 bg-orange-100' :
                          task.priority === 'MEDIUM' ? 'text-yellow-600 bg-yellow-100' :
                          'text-green-600 bg-green-100'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'TODO' ? 'text-gray-600 bg-gray-100' :
                          task.status === 'IN_PROGRESS' ? 'text-blue-600 bg-blue-100' :
                          task.status === 'COMPLETED' ? 'text-green-600 bg-green-100' :
                          'text-yellow-600 bg-yellow-100'
                        }`}>
                          {task.status ? task.status.replace('_', ' ') : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {task.dueDate ? (
                        <span className={isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? 'text-red-600 font-medium' : ''}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue(task.dueDate) && task.status !== 'COMPLETED' && ' (Overdue)'}
                        </span>
                      ) : (
                        <span>No due date</span>
                      )}
                      {task.matter && (
                        <span className="ml-2">
                          | <Link 
                            to={`/matters/${task.matter.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {task.matter.client.clientName} - {task.matter.matterName}
                          </Link>
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;