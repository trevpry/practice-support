import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold">Practice Support</h1>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/">
              <Button 
                variant={isActive('/') ? 'secondary' : 'ghost'}
                className="text-white hover:bg-blue-800"
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/clients">
              <Button 
                variant={isActive('/clients') ? 'secondary' : 'ghost'}
                className="text-white hover:bg-blue-800"
              >
                Clients
              </Button>
            </Link>
            <Link to="/matters">
              <Button 
                variant={isActive('/matters') ? 'secondary' : 'ghost'}
                className="text-white hover:bg-blue-800"
              >
                Matters
              </Button>
            </Link>
            <Link to="/people">
              <Button 
                variant={isActive('/people') ? 'secondary' : 'ghost'}
                className="text-white hover:bg-blue-800"
              >
                People
              </Button>
            </Link>
            <Link to="/organizations">
              <Button 
                variant={isActive('/organizations') ? 'secondary' : 'ghost'}
                className="text-white hover:bg-blue-800"
              >
                Organizations
              </Button>
            </Link>
            <Link to="/tasks">
              <Button 
                variant={isActive('/tasks') ? 'secondary' : 'ghost'}
                className="text-white hover:bg-blue-800"
              >
                Tasks
              </Button>
            </Link>
            <Link to="/users">
              <Button 
                variant={isActive('/users') ? 'secondary' : 'ghost'}
                className="text-white hover:bg-blue-800"
              >
                Users
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
