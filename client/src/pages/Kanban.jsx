import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';
import { Calendar, User, Building } from 'lucide-react';
import Layout from '../components/Layout';

// Matter status configuration
const MATTER_STATUSES = [
  { id: 'COLLECTION', label: 'Collection', color: 'bg-blue-100 border-blue-300', textColor: 'text-blue-800' },
  { id: 'CULLING', label: 'Culling', color: 'bg-yellow-100 border-yellow-300', textColor: 'text-yellow-800' },
  { id: 'REVIEW', label: 'Review', color: 'bg-orange-100 border-orange-300', textColor: 'text-orange-800' },
  { id: 'PRODUCTION', label: 'Production', color: 'bg-green-100 border-green-300', textColor: 'text-green-800' },
  { id: 'INACTIVE', label: 'Inactive', color: 'bg-gray-100 border-gray-300', textColor: 'text-gray-800' }
];

// Format matter status for display
const formatMatterStatus = (status) => {
  return status ? status.charAt(0) + status.slice(1).toLowerCase() : 'Collection';
};

// Get matter status color
const getMatterStatusColor = (status) => {
  const statusConfig = MATTER_STATUSES.find(s => s.id === status);
  return statusConfig ? statusConfig.color : 'bg-blue-100 border-blue-300';
};

// Get matter status text color
const getMatterStatusTextColor = (status) => {
  const statusConfig = MATTER_STATUSES.find(s => s.id === status);
  return statusConfig ? statusConfig.textColor : 'text-blue-800';
};

const MatterCard = ({ matter, index }) => {
  return (
    <Draggable draggableId={matter.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-white rounded-lg shadow-sm border p-4 mb-3 cursor-move
            ${snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'}
            transition-all duration-200
          `}
        >
          <div className="space-y-3">
            {/* Matter Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link 
                  to={`/matters/${matter.id}`}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-sm leading-tight"
                >
                  {matter.title || matter.matterName}
                </Link>
                <p className="text-xs text-gray-600 mt-1">#{matter.matterNumber}</p>
              </div>
            </div>

            {/* Client Info */}
            {matter.client && (
              <div className="flex items-center text-xs text-gray-600">
                <Building className="w-3 h-3 mr-1" />
                <Link 
                  to={`/clients/${matter.client.id}`}
                  className="hover:text-blue-600 transition-colors truncate"
                >
                  {matter.client.name || `Client #${matter.client.clientNumber}`}
                </Link>
              </div>
            )}

            {/* Team Members */}
            {matter.people && matter.people.length > 0 && (
              <div className="flex items-center text-xs text-gray-600">
                <User className="w-3 h-3 mr-1" />
                <span className="truncate">
                  {matter.people.length} team member{matter.people.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Created {new Date(matter.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const KanbanColumn = ({ status, matters, matterCount }) => {
  const statusConfig = MATTER_STATUSES.find(s => s.id === status.id);
  
  return (
    <div className="flex-1 min-w-[280px] max-w-sm">
      <div className={`
        rounded-lg border-2 border-dashed h-full min-h-[600px]
        ${statusConfig.color}
      `}>
        {/* Column Header */}
        <div className={`
          p-4 border-b border-current/20 ${statusConfig.textColor}
        `}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{status.label}</h3>
            <span className="text-xs font-medium px-2 py-1 bg-white/60 rounded-full">
              {matterCount}
            </span>
          </div>
        </div>

        {/* Droppable Area */}
        <Droppable droppableId={status.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                p-4 min-h-[500px] transition-colors
                ${snapshot.isDraggingOver ? 'bg-white/30' : ''}
              `}
            >
              {matters.map((matter, index) => (
                <MatterCard 
                  key={matter.id} 
                  matter={matter} 
                  index={index}
                />
              ))}
              {provided.placeholder}
              
              {/* Empty State */}
              {matters.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-8">
                  <p>No matters in {status.label.toLowerCase()}</p>
                  <p className="text-xs mt-1">Drag matters here to update status</p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

const Kanban = () => {
  const [matters, setMatters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch user's assigned matters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mattersResponse, userResponse] = await Promise.all([
          fetch('/api/matters'),
          fetch('/api/auth/current-user')
        ]);

        if (mattersResponse.ok && userResponse.ok) {
          const [allMatters, user] = await Promise.all([
            mattersResponse.json(),
            userResponse.json()
          ]);

          setCurrentUser(user);

          // Filter matters to show only those assigned to current user
          let userMatters = allMatters;
          if (user && user.person) {
            const personId = user.person.id;
            userMatters = allMatters.filter(matter => 
              matter.people && matter.people.some(mp => mp.person && mp.person.id === personId)
            );
          }

          setMatters(userMatters);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle drag end
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const matterId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    const matter = matters.find(m => m.id === matterId);

    if (!matter) {
      setError('Matter not found');
      return;
    }

    // Optimistically update UI first
    setMatters(prevMatters => 
      prevMatters.map(m => 
        m.id === matterId 
          ? { ...m, status: newStatus }
          : m
      )
    );

    // Update matter status in backend using status-specific endpoint
    try {
      const response = await fetch(`/api/matters/${matterId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        // Revert optimistic update on error
        setMatters(prevMatters => 
          prevMatters.map(m => 
            m.id === matterId 
              ? { ...m, status: matter.status }
              : m
          )
        );
        setError('Failed to update matter status');
      }
    } catch (err) {
      // Revert optimistic update on error
      setMatters(prevMatters => 
        prevMatters.map(m => 
          m.id === matterId 
            ? { ...m, status: matter.status }
            : m
        )
      );
      setError('An error occurred while updating matter status');
      console.error('Error:', err);
    }
  };

  // Group matters by status
  const mattersByStatus = MATTER_STATUSES.reduce((acc, status) => {
    acc[status.id] = matters.filter(matter => (matter.status || 'COLLECTION') === status.id);
    return acc;
  }, {});

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading kanban board...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Matter Kanban Board</h1>
            <p className="text-gray-600">
              Drag and drop matters between columns to update their status. 
              Showing {matters.length} of your assigned matters.
            </p>
            {currentUser && currentUser.person && (
              <p className="text-sm text-blue-600 mt-1">
                Viewing as: {currentUser.person.firstName} {currentUser.person.lastName}
              </p>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
                <button 
                  onClick={() => setError(null)} 
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {MATTER_STATUSES.map(status => (
                <KanbanColumn
                  key={status.id}
                  status={status}
                  matters={mattersByStatus[status.id]}
                  matterCount={mattersByStatus[status.id].length}
                />
              ))}
            </div>
          </DragDropContext>

          {/* Empty State */}
          {matters.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No matters assigned to you</p>
              <p className="text-gray-400">Ask a project manager to assign you to matters to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Kanban;
