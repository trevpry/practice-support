import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { 
  Calendar, 
  User, 
  FileText, 
  AlertCircle, 
  Clock, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Users
} from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [people, setPeople] = useState([]);
  const [matters, setMatters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    matterId: '',
    ownerId: '',
    assigneeIds: []
  });

  useEffect(() => {
    fetchTask();
    fetchPeople();
    fetchMatters();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/tasks/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
      } else {
        console.error('Failed to fetch task');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/people');
      const data = await response.json();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const fetchMatters = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/matters');
      const data = await response.json();
      setMatters(data);
    } catch (error) {
      console.error('Error fetching matters:', error);
    }
  };

  const handleEdit = () => {
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      matterId: task.matterId || '',
      ownerId: task.ownerId.toString(),
      assigneeIds: task.assignees.map(assignee => assignee.id.toString())
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssigneeChange = (personId) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(personId)
        ? prev.assigneeIds.filter(id => id !== personId)
        : [...prev.assigneeIds, personId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5001/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          matterId: formData.matterId || null,
          ownerId: parseInt(formData.ownerId),
          assigneeIds: formData.assigneeIds.map(id => parseInt(id))
        }),
      });

      if (response.ok) {
        fetchTask();
        setShowEditModal(false);
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/tasks/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          navigate('/tasks');
        } else {
          console.error('Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-100 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'IN_PROGRESS': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'COMPLETED': return 'text-green-700 bg-green-100 border-green-200';
      case 'ON_HOLD': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-lg">Loading task...</div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Not Found</h1>
            <p className="text-gray-600 mb-4">The task you're looking for doesn't exist.</p>
            <Link to="/tasks">
              <Button>Back to Tasks</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/tasks">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-500">Task #{task.id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status and Priority Badges */}
      <div className="flex gap-3 mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority} Priority
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {task.description && (
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Matter Information */}
          {task.matter && (
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Related Matter
              </h2>
              <div className="space-y-2">
                <div>
                  <Link 
                    to={`/matters/${task.matter.id}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-800"
                  >
                    {task.matter.matterNumber} - {task.matter.matterName}
                  </Link>
                </div>
                <div className="text-gray-600">
                  Client: <Link 
                    to={`/clients/${task.matter.client.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {task.matter.client.clientName}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Team */}
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team
            </h2>
            
            <div className="space-y-4">
              {/* Owner */}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Task Owner</h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <Link 
                      to={`/people/${task.owner.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {task.owner.firstName} {task.owner.lastName}
                    </Link>
                    <p className="text-sm text-gray-500">{task.owner.type.replace('_', ' ')}</p>
                    {task.owner.email && (
                      <p className="text-sm text-gray-500">{task.owner.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Assignees */}
              {task.assignees.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Assigned To</h3>
                  <div className="space-y-2">
                    {task.assignees.map(assignee => (
                      <div key={assignee.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <Link 
                            to={`/people/${assignee.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {assignee.firstName} {assignee.lastName}
                          </Link>
                          <p className="text-sm text-gray-500">{assignee.type.replace('_', ' ')}</p>
                          {assignee.email && (
                            <p className="text-sm text-gray-500">{assignee.email}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Due Date */}
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Due Date
            </h2>
            <div className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-700'}`}>
              {isOverdue(task.dueDate) && (
                <div className="flex items-center gap-1 text-red-600 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Overdue</span>
                </div>
              )}
              <p className="font-medium">{formatDate(task.dueDate)}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-900">Created:</span>
                <p className="text-gray-600">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Last Updated:</span>
                <p className="text-gray-600">
                  {new Date(task.updatedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Matter (Optional)</label>
                <select
                  name="matterId"
                  value={formData.matterId}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a matter (optional)</option>
                  {matters.map(matter => (
                    <option key={matter.id} value={matter.id}>
                      {matter.matterNumber} - {matter.matterName} ({matter.client.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Task Owner *</label>
                <select
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select an owner</option>
                  {people.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName} ({person.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Assign To (Optional)</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {people.map(person => (
                    <label key={person.id} className="flex items-center gap-2 p-1">
                      <input
                        type="checkbox"
                        checked={formData.assigneeIds.includes(person.id.toString())}
                        onChange={() => handleAssigneeChange(person.id.toString())}
                      />
                      <span>{person.firstName} {person.lastName} ({person.type})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Task
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

export default TaskDetail;
