import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { Users, FileText, User, TrendingUp } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalMatters: 0,
    totalPeople: 0,
    recentClients: [],
    recentMatters: [],
    recentPeople: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsResponse, mattersResponse, peopleResponse] = await Promise.all([
          fetch('http://localhost:5001/api/clients'),
          fetch('http://localhost:5001/api/matters'),
          fetch('http://localhost:5001/api/people')
        ]);

        if (clientsResponse.ok && mattersResponse.ok && peopleResponse.ok) {
          const [clients, matters, people] = await Promise.all([
            clientsResponse.json(),
            mattersResponse.json(),
            peopleResponse.json()
          ]);

          setStats({
            totalClients: clients.length,
            totalMatters: matters.length,
            totalPeople: people.length,
            recentClients: clients.slice(-5).reverse(),
            recentMatters: matters.slice(-5).reverse(),
            recentPeople: people.slice(-5).reverse()
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
          </h1>
          <p className="text-xl text-gray-600">
            Manage your law firm's clients and matters efficiently
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                <p className="text-gray-600">Total Clients</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalMatters}</p>
                <p className="text-gray-600">Total Matters</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalPeople}</p>
                <p className="text-gray-600">Total People</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalClients > 0 ? (stats.totalMatters / stats.totalClients).toFixed(1) : '0'}
                </p>
                <p className="text-gray-600">Matters per Client</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Clients */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Clients</h2>
            {stats.recentClients.length === 0 ? (
              <p className="text-gray-500">No clients yet</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Matters</h2>
            {stats.recentMatters.length === 0 ? (
              <p className="text-gray-500">No matters yet</p>
            ) : (
              <ul className="space-y-3">
                {stats.recentMatters.map((matter) => (
                  <li key={matter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <Link 
                        to={`/matters/${matter.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {matter.matterName}
                      </Link>
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

          {/* Recent People */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent People</h2>
            {stats.recentPeople.length === 0 ? (
              <p className="text-gray-500">No people yet</p>
            ) : (
              <ul className="space-y-3">
                {stats.recentPeople.map((person) => (
                  <li key={person.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <Link 
                        to={`/people/${person.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {person.firstName} {person.lastName}
                      </Link>
                      <p className="text-sm text-gray-500">{person.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {person.email || 'No email'}
                    </span>
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