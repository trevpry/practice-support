import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';
import { Plus, Calendar, User, FileText, AlertCircle, Clock, Check, Edit, Save, X } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [people, setPeople] = useState([]);
  const [matters, setMatters] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingInline, setEditingInline] = useState(null);
  const [inlineFormData, setInlineFormData] = useState({});
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
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

  // Update form data when current user is loaded
  useEffect(() => {
    if (currentUser && currentUser.person && !editingTask) {
      setFormData(prevData => ({
        ...prevData,
        ownerId: currentUser.person.id.toString()
      }));
    }
  }, [currentUser, editingTask]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/current-user`);
      const user = await response.json();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      // Use current user's tasks endpoint instead of all tasks
      const response = await fetch(`${API_BASE_URL}/auth/current-user/tasks`);
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
      const response = await fetch(`${API_BASE_URL}/people`);
      const data = await response.json();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const fetchMatters = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/matters`);
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
        ? `${API_BASE_URL}/tasks/${editingTask.id}`
        : `${API_BASE_URL}/tasks`;
      
      const method = editingTask ? 'PUT' : 'POST';
      
      // For new tasks, automatically set the current user's linked person as the owner
      const ownerId = editingTask 
        ? parseInt(formData.ownerId)
        : (currentUser && currentUser.person ? currentUser.person.id : parseInt(formData.ownerId));
      
      // Validate that we have a valid ownerId
      if (!ownerId || isNaN(ownerId)) {
        alert('Error: No valid owner found. Please ensure you are logged in and linked to a person.');
        console.error('Invalid ownerId:', ownerId, 'Current user:', currentUser, 'Form ownerId:', formData.ownerId);
        return;
      }
      
      const requestBody = {
        ...formData,
        matterId: formData.matterId || null,
        ownerId: ownerId,
        assigneeIds: formData.assigneeIds.map(id => parseInt(id))
      };
      
      console.log('Submitting task with data:', requestBody);
      console.log('Current user:', currentUser);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        fetchTasks();
        setShowModal(false);
        resetForm();
      } else {
        const errorData = await response.text();
        console.error('Failed to save task. Status:', response.status, 'Response:', errorData);
        alert(`Failed to save task: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert(`Error saving task: ${error.message}`);
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
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
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

  // Inline editing functions
  const startInlineEdit = (task) => {
    setEditingInline(task.id);
    setInlineFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
  };

  const cancelInlineEdit = () => {
    setEditingInline(null);
    setInlineFormData({});
  };

  const saveInlineEdit = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inlineFormData,
          dueDate: inlineFormData.dueDate || null
        }),
      });

      if (response.ok) {
        fetchTasks();
        setEditingInline(null);
        setInlineFormData({});
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const markAsCompleted = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED'
        }),
      });

      if (response.ok) {
        fetchTasks();
      } else {
        console.error('Failed to mark task as completed');
      }
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  const handleInlineInputChange = (field, value) => {
    setInlineFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  // TaskCard component for rendering individual task cards
  const TaskCard = ({ task, borderColor, isOverdue: showOverdue = false }) => {
    const isEditing = editingInline === task.id;
    
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${borderColor} ${showOverdue ? 'bg-red-50' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={inlineFormData.title}
                  onChange={(e) => handleInlineInputChange('title', e.target.value)}
                  className="text-xl font-semibold text-blue-600 bg-transparent border-b-2 border-blue-300 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <Link 
                  to={`/tasks/${task.id}`}
                  className="text-xl font-semibold text-blue-600 hover:text-blue-800"
                >
                  {task.title}
                </Link>
              )}
              
              {isEditing ? (
                <select
                  value={inlineFormData.priority}
                  onChange={(e) => handleInlineInputChange('priority', e.target.value)}
                  className="px-2 py-1 rounded-full text-xs font-medium border"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
              
              {isEditing ? (
                <select
                  value={inlineFormData.status}
                  onChange={(e) => handleInlineInputChange('status', e.target.value)}
                  className="px-2 py-1 rounded-full text-xs font-medium border"
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ON_HOLD">ON HOLD</option>
                </select>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              )}
              
              {showOverdue && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                  OVERDUE
                </span>
              )}
            </div>
            
            {isEditing ? (
              <textarea
                value={inlineFormData.description}
                onChange={(e) => handleInlineInputChange('description', e.target.value)}
                className="w-full text-gray-600 mb-3 p-2 border border-gray-300 rounded resize-none"
                rows="2"
                placeholder="Task description..."
              />
            ) : (
              task.description && (
                <p className="text-gray-600 mb-3">{task.description}</p>
              )
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
                {isEditing ? (
                  <input
                    type="date"
                    value={inlineFormData.dueDate}
                    onChange={(e) => handleInlineInputChange('dueDate', e.target.value)}
                    className="border border-gray-300 rounded px-1"
                  />
                ) : (
                  <span>{formatDate(task.dueDate)}</span>
                )}
                {isOverdue(task.dueDate) && !isEditing && <span className="font-medium">(Overdue)</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveInlineEdit(task.id)}
                  className="flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelInlineEdit}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {task.status !== 'COMPLETED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsCompleted(task.id)}
                    className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Check className="h-3 w-3" />
                    Complete
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startInlineEdit(task)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Quick Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(task)}
                >
                  Full Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const taskDate = new Date(dateString);
    
    // Set both dates to midnight for accurate comparison
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    return today.getTime() === taskDate.getTime();
  };

  const isTomorrow = (dateString) => {
    if (!dateString) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(dateString);
    taskDate.setHours(0, 0, 0, 0);
    
    return tomorrow.getTime() === taskDate.getTime();
  };

  const categorizeTasksByDate = (tasks) => {
    const overdue = [];
    const today = [];
    const tomorrow = [];
    const later = [];

    tasks.forEach(task => {
      if (isOverdue(task.dueDate)) {
        overdue.push(task);
      } else if (isToday(task.dueDate)) {
        today.push(task);
      } else if (isTomorrow(task.dueDate)) {
        tomorrow.push(task);
      } else {
        later.push(task);
      }
    });

    return { overdue, today, tomorrow, later };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const taskDate = new Date(dueDate);
    
    // Set both dates to midnight for accurate comparison
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    return taskDate < today;
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

  // Filter tasks into active and completed
  const activeTasks = tasks.filter(task => task.status !== 'COMPLETED');
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED');

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
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showCompletedTasks}
              onChange={(e) => setShowCompletedTasks(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show completed</span>
          </label>
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
      </div>

      <div className="space-y-8">
        {(() => {
          const { overdue, today, tomorrow, later } = categorizeTasksByDate(activeTasks);
          
          if (activeTasks.length === 0 && completedTasks.length === 0) {
            return (
              <div className="text-center py-8 text-gray-500">
                {currentUser && currentUser.person 
                  ? "No tasks assigned to you yet. Create your first task to get started."
                  : "No tasks found. Create your first task to get started."
                }
              </div>
            );
          }

          return (
            <>
              {/* Tasks Past Due */}
              <div>
                <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-red-700 rounded-full mr-2"></span>
                  Tasks Past Due ({overdue.length})
                </h2>
                {overdue.length === 0 ? (
                  <div className="text-gray-500 text-center py-4 border border-gray-200 rounded-lg">
                    No overdue tasks
                  </div>
                ) : (
                  <div className="space-y-4">
                    {overdue.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        borderColor="border-l-red-700 bg-red-50 border border-red-100" 
                        isOverdue={true} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks Due Today */}
              <div>
                <h2 className="text-xl font-semibold text-orange-600 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-orange-400 rounded-full mr-2"></span>
                  Tasks Due Today ({today.length})
                </h2>
                {today.length === 0 ? (
                  <div className="text-gray-500 text-center py-4 border border-gray-200 rounded-lg">
                    No tasks due today
                  </div>
                ) : (
                  <div className="space-y-4">
                    {today.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        borderColor="border-orange-400" 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks Due Tomorrow */}
              <div>
                <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Tasks Due Tomorrow ({tomorrow.length})
                </h2>
                {tomorrow.length === 0 ? (
                  <div className="text-gray-500 text-center py-4 border border-gray-200 rounded-lg">
                    No tasks due tomorrow
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tomorrow.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        borderColor="border-blue-500" 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Tasks Due Later */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                  Tasks Due Later ({later.length})
                </h2>
                {later.length === 0 ? (
                  <div className="text-gray-500 text-center py-4 border border-gray-200 rounded-lg">
                    No future tasks
                  </div>
                ) : (
                  <div className="space-y-4">
                    {later.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        borderColor="border-gray-400" 
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>

      {/* Completed Tasks Section */}
      {showCompletedTasks && completedTasks.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Completed Tasks ({completedTasks.length})
          </h2>
          <div className="space-y-4 opacity-75">
            {completedTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                borderColor="border-green-400" 
              />
            ))}
          </div>
        </div>
      )}

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
