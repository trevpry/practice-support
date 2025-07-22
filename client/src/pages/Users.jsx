import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { API_BASE_URL } from '../config/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    personId: ''
  });
  const [people, setPeople] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchPeople();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/people`);
      const data = await response.json();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = currentUser ? `${API_BASE_URL}/users/${currentUser.id}` : `${API_BASE_URL}/users`;
      const method = currentUser ? 'PUT' : 'POST';
      
      // Generate username from email (part before @) or from first/last name
      const generateUsername = () => {
        if (formData.email) {
          return formData.email.split('@')[0].toLowerCase();
        }
        return `${formData.firstName}${formData.lastName}`.toLowerCase().replace(/\s+/g, '');
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          username: generateUsername(),
          personId: formData.personId ? parseInt(formData.personId) : null
        }),
      });

      if (response.ok) {
        fetchUsers();
        closeModal();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to save user'));
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      personId: user.personId ? user.personId.toString() : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchUsers();
        } else {
          alert('Error deleting user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const openCreateModal = () => {
    setCurrentUser(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      personId: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentUser(null);
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      personId: ''
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div>Loading users...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button onClick={openCreateModal}>
            Add New User
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Linked Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.person ? `${user.person.firstName} ${user.person.lastName}` : 'Not linked'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {currentUser ? 'Edit User' : 'Create New User'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Linked Person (Optional)</label>
                    <select
                      value={formData.personId}
                      onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a person...</option>
                      {people.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.firstName} {person.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {currentUser ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Users;
