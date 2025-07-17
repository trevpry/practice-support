import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { Plus, Calendar, User, FileText, AlertCircle, Clock } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [people, setPeople] = useState([]);
  const [matters, setMatters] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
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
    fetchCurrentUser();
    fetchTasks();
    fetchPeople();
    fetchMatters();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/current-user');
      const user = await response.json();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      // Use current user's tasks endpoint instead of all tasks
      const response = await fetch('/api/auth/current-user/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeople = async () => {
    try {
      const response = await fetch('/api/people');
      const data = await response.json();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const fetchMatters = async () => {
    try {
      const response = await fetch('/api/matters');
      const data = await response.json();
      setMatters(data);
    } catch (error) {
      console.error('Error fetching matters:', error);
    }
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
      const url = editingTask 
        ? `/api/tasks/${editingTask.id}`
        : '/api/tasks';
      
      const method = editingTask ? 'PUT' : 'POST';
      
      // For new tasks, automatically set the current user's linked person as the owner
      const ownerId = editingTask 
        ? parseInt(formData.ownerId)
        : (currentUser && currentUser.person ? currentUser.person.id : parseInt(formData.ownerId));
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          matterId: formData.matterId || null,
          ownerId: ownerId,
          assigneeIds: formData.assigneeIds.map(id => parseInt(id))
        }),
      });

      if (response.ok) {
        fetchTasks();
        setShowModal(false);
        resetForm();
      } else {
        console.error('Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
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
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchTasks();
        } else {
          console.error('Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      matterId: '',
      ownerId: currentUser && currentUser.person ? currentUser.person.id.toString() : '',
      assigneeIds: []
    });
    setEditingTask(null);
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-lg">Loading tasks...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          {currentUser && currentUser.person && (
            <p className="text-gray-600 mt-1">
              Tasks for {currentUser.person.firstName} {currentUser.person.lastName}
            </p>
          )}
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {currentUser && currentUser.person 
              ? "No tasks assigned to you yet. Create your first task to get started."
              : "No tasks found. Create your first task to get started."
            }
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Link 
                      to={`/tasks/${task.id}`}
                      className="text-xl font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {task.title}
                    </Link>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-gray-600 mb-3">{task.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Owner: {task.owner.firstName} {task.owner.lastName}</span>
                    </div>
                    
                    {task.assignees.length > 0 && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Assigned: {task.assignees.map(a => `${a.firstName} ${a.lastName}`).join(', ')}</span>
                      </div>
                    )}
                    
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

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingTask ? 'Edit Task' : 'Create My Task'}
            </h2>
            
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
                {!editingTask && currentUser && currentUser.person ? (
                  <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50">
                    {currentUser.person.firstName} {currentUser.person.lastName} ({currentUser.person.type || 'No type'}) - Auto-assigned
                  </div>
                ) : (
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
                        {person.firstName} {person.lastName} ({person.type || 'No type'})
                      </option>
                    ))}
                  </select>
                )}
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
                      <span>{person.firstName} {person.lastName} ({person.type || 'No type'})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTask ? 'Update Task' : 'Create My Task'}
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

export default Tasks;
