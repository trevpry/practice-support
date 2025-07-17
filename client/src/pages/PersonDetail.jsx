import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { ArrowLeft, Edit, Trash2, User, Building, FileText, Mail, Phone, X, Plus, CheckSquare, Calendar, AlertCircle } from 'lucide-react';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMattersModalOpen, setIsMattersModalOpen] = useState(false);
  const [allMatters, setAllMatters] = useState([]);
  const [selectedMatters, setSelectedMatters] = useState([]);
  const [mattersModalLoading, setMattersModalLoading] = useState(false);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/people/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Person not found');
          }
          throw new Error('Failed to fetch person');
        }
        const data = await response.json();
        setPerson(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/people/${id}/tasks`);
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    fetchPerson();
    fetchTasks();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this person? This will remove them from all assignments.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/people/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete person');

      navigate('/people');
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch all matters for matter management
  const fetchAllMatters = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/matters');
      if (!response.ok) throw new Error('Failed to fetch matters');
      const matters = await response.json();
      setAllMatters(matters);
    } catch (err) {
      setError(err.message);
    }
  };

  // Open matter management modal
  const openMattersModal = async () => {
    setIsMattersModalOpen(true);
    await fetchAllMatters();
    // Initialize selected matters with current assignments
    const currentMatterIds = person.matters?.map(mp => mp.matter.id) || [];
    setSelectedMatters(currentMatterIds);
  };

  // Handle matter selection
  const toggleMatterSelection = (matterId) => {
    setSelectedMatters(prev => 
      prev.includes(matterId) 
        ? prev.filter(id => id !== matterId)
        : [...prev, matterId]
    );
  };

  // Save matter assignments
  const saveMatterChanges = async () => {
    setMattersModalLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/people/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: person.firstName,
          lastName: person.lastName,
          email: person.email,
          phone: person.phone,
          type: person.type,
          matterIds: selectedMatters
        }),
      });

      if (!response.ok) throw new Error('Failed to update matter assignments');

      // Refresh person data
      const updatedPerson = await response.json();
      setPerson(updatedPerson);
      setIsMattersModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setMattersModalLoading(false);
    }
  };

  const getPersonTypeColor = (type) => {
    switch (type) {
      case 'ATTORNEY': return 'text-blue-600';
      case 'PARALEGAL': return 'text-green-600';
      case 'VENDOR': return 'text-purple-600';
      case 'PROJECT_MANAGER': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getPersonTypeBadgeColor = (type) => {
    switch (type) {
      case 'ATTORNEY': return 'bg-blue-100 text-blue-800';
      case 'PARALEGAL': return 'bg-green-100 text-green-800';
      case 'VENDOR': return 'bg-purple-100 text-purple-800';
      case 'PROJECT_MANAGER': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'text-gray-600 bg-gray-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'ON_HOLD': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  if (error) return <Layout><div className="text-center py-8 text-red-600">Error: {error}</div></Layout>;
  if (!person) return <Layout><div className="text-center py-8">Person not found</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/people">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to People
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {person.firstName} {person.lastName}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                {person.type && (
                  <span className={`inline-block text-sm px-3 py-1 rounded-full ${getPersonTypeBadgeColor(person.type)}`}>
                    {person.type.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(`/people`, { state: { editPersonId: person.id } })}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Person Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="text-lg text-gray-900">{person.firstName} {person.lastName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="text-lg text-gray-900">{person.type ? person.type.replace('_', ' ') : 'No type specified'}</dd>
              </div>
              {person.email && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-lg text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`mailto:${person.email}`} className="text-blue-600 hover:text-blue-800">
                      {person.email}
                    </a>
                  </dd>
                </div>
              )}
              {person.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-lg text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`tel:${person.phone}`} className="text-blue-600 hover:text-blue-800">
                      {person.phone}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-lg text-gray-900">{new Date(person.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-lg text-gray-900">{new Date(person.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          {/* Statistics */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {person.assignedAsAttorney?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Clients as Attorney</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {person.assignedAsParalegal?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Clients as Paralegal</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg col-span-2">
                <div className="text-2xl font-bold text-purple-600">
                  {person.matters?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Matter Assignments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Assignments */}
        {((person.assignedAsAttorney?.length || 0) > 0 || (person.assignedAsParalegal?.length || 0) > 0) && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Client Assignments</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attorney Assignments */}
              {(person.assignedAsAttorney?.length || 0) > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-blue-600 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Attorney for {person.assignedAsAttorney.length} client(s)
                  </h3>
                  <div className="space-y-3">
                    {person.assignedAsAttorney.map((client) => (
                      <div key={client.id} className="border border-blue-200 rounded-lg p-3">
                        <Link 
                          to={`/clients/${client.id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800"
                        >
                          {client.clientName}
                        </Link>
                        <p className="text-sm text-gray-500">Client #{client.clientNumber}</p>
                        <p className="text-sm text-gray-500">{client.matters.length} matter(s)</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paralegal Assignments */}
              {(person.assignedAsParalegal?.length || 0) > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-green-600 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Paralegal for {person.assignedAsParalegal.length} client(s)
                  </h3>
                  <div className="space-y-3">
                    {person.assignedAsParalegal.map((client) => (
                      <div key={client.id} className="border border-green-200 rounded-lg p-3">
                        <Link 
                          to={`/clients/${client.id}`}
                          className="text-lg font-medium text-green-600 hover:text-green-800"
                        >
                          {client.clientName}
                        </Link>
                        <p className="text-sm text-gray-500">Client #{client.clientNumber}</p>
                        <p className="text-sm text-gray-500">{client.matters.length} matter(s)</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Matter Assignments */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Matter Assignments ({person.matters?.length || 0})
            </h2>
            <Button 
              onClick={openMattersModal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Manage Matters
            </Button>
          </div>
          
          {(person.matters?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No matter assignments</h3>
              <p className="mt-1 text-sm text-gray-500">Add this person to matters to track their assignments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {person.matters.map((matterPerson) => (
                <div key={matterPerson.matter.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <Link 
                      to={`/matters/${matterPerson.matter.id}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800"
                    >
                      {matterPerson.matter.matterName}
                    </Link>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Matter #{matterPerson.matter.matterNumber}</p>
                    {matterPerson.role && (
                      <p className="text-sm text-gray-600">Role: {matterPerson.role}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <Link 
                        to={`/clients/${matterPerson.matter.client.id}`}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        {matterPerson.matter.client.clientName}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Person Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Tasks ({tasks.length})
            </h2>
            <Link to="/tasks">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </Link>
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
              <p className="mt-1 text-sm text-gray-500">No tasks owned or assigned to this person.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link 
                        to={`/tasks/${task.id}`}
                        className="text-lg font-medium text-blue-600 hover:text-blue-800"
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>
                        {task.owner.id === person.id ? 'Owner' : 'Assigned'}
                      </span>
                    </div>
                    
                    {task.matter && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <Link 
                          to={`/matters/${task.matter.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {task.matter.matterNumber} - {task.matter.matterName}
                        </Link>
                      </div>
                    )}
                    
                    <div className={`flex items-center gap-1 ${isOverdue(task.dueDate) ? 'text-red-600' : ''}`}>
                      {isOverdue(task.dueDate) ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <Calendar className="h-4 w-4" />
                      )}
                      <span>{formatDate(task.dueDate)}</span>
                      {isOverdue(task.dueDate) && <span className="font-medium">(Overdue)</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* No Assignments */}
        {(person.assignedAsAttorney?.length || 0) === 0 && 
         (person.assignedAsParalegal?.length || 0) === 0 && 
         (person.matters?.length || 0) === 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
              <p className="mt-1 text-sm text-gray-500">
                This person is not currently assigned to any clients or matters.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Matter Management Modal */}
      {isMattersModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Manage Matter Assignments</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMattersModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select matters to assign to this person:
              </p>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {allMatters.map((matter) => (
                  <label
                    key={matter.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMatters.includes(matter.id)}
                      onChange={() => toggleMatterSelection(matter.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {matter.matterName}
                      </div>
                      <div className="text-xs text-gray-500">
                        #{matter.matterNumber} - {matter.client.clientName}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsMattersModalOpen(false)}
                  disabled={mattersModalLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveMatterChanges}
                  disabled={mattersModalLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {mattersModalLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PersonDetail;
