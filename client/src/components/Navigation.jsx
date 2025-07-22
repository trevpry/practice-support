import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold">Practice Support</h1>
            </Link>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link to="/">
              <Button 
                variant="ghost"
                className={isActive('/') 
                  ? "bg-blue-800 text-white hover:bg-blue-700" 
                  : "text-white hover:bg-blue-800"
                }
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/clients">
              <Button 
                variant="ghost"
                className={isActive('/clients') 
                  ? "bg-blue-800 text-white hover:bg-blue-700" 
                  : "text-white hover:bg-blue-800"
                }
              >
                Clients
              </Button>
            </Link>
            <Link to="/matters">
              <Button 
                variant="ghost"
                className={isActive('/matters') 
                  ? "bg-blue-800 text-white hover:bg-blue-700" 
                  : "text-white hover:bg-blue-800"
                }
              >
                Matters
              </Button>
            </Link>
            <Link to="/tasks">
              <Button 
                variant="ghost"
                className={isActive('/tasks') 
                  ? "bg-blue-800 text-white hover:bg-blue-700" 
                  : "text-white hover:bg-blue-800"
                }
              >
                Tasks
              </Button>
            </Link>
            
            {/* Hamburger Menu for Desktop */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                onClick={toggleMenu}
                className="text-white hover:bg-blue-800 flex items-center"
              >
                More
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link 
                    to="/people" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    People
                  </Link>
                  <Link 
                    to="/organizations" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Organizations
                  </Link>
                  <Link 
                    to="/custodians" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Custodians
                  </Link>
                  <Link 
                    to="/collections" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Collections
                  </Link>
                  <Link 
                    to="/contract-reviews" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contract Reviews
                  </Link>
                  <Link 
                    to="/users" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Users
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={toggleMenu}
              className="text-white hover:bg-blue-800"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-800">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={`w-full text-left justify-start ${isActive('/') 
                    ? "bg-blue-700 text-white hover:bg-blue-600" 
                    : "text-white hover:bg-blue-700"
                  }`}
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/clients" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={`w-full text-left justify-start ${isActive('/clients') 
                    ? "bg-blue-700 text-white hover:bg-blue-600" 
                    : "text-white hover:bg-blue-700"
                  }`}
                >
                  Clients
                </Button>
              </Link>
              <Link to="/matters" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={`w-full text-left justify-start ${isActive('/matters') 
                    ? "bg-blue-700 text-white hover:bg-blue-600" 
                    : "text-white hover:bg-blue-700"
                  }`}
                >
                  Matters
                </Button>
              </Link>
              <Link to="/tasks" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={`w-full text-left justify-start ${isActive('/tasks') 
                    ? "bg-blue-700 text-white hover:bg-blue-600" 
                    : "text-white hover:bg-blue-700"
                  }`}
                >
                  Tasks
                </Button>
              </Link>
              <Link to="/people" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={`w-full text-left justify-start ${isActive('/people') 
                    ? "bg-blue-700 text-white hover:bg-blue-600" 
                    : "text-white hover:bg-blue-700"
                  }`}
                >
                  People
                </Button>
              </Link>
              <Link to="/organizations" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={`w-full text-left justify-start ${isActive('/organizations') 
                    ? "bg-blue-700 text-white hover:bg-blue-600" 
                    : "text-white hover:bg-blue-700"
                  }`}
                >
                  Organizations
                </Button>
              </Link>
              <Link to="/custodians" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={`w-full text-left justify-start ${isActive('/custodians') 
                    ? "bg-blue-700 text-white hover:bg-blue-600" 
                    : "text-white hover:bg-blue-700"
                  }`}
                >
                  Custodians
                </Button>
              </Link>
              <Link to="/collections" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={`w-full text-left justify-start ${isActive('/collections') 
                    ? "bg-blue-700 text-white hover:bg-blue-600" 
                    : "text-white hover:bg-blue-700"
                  }`}
                >
                  Collections
                </Button>
              </Link>
              <Link to="/contract-reviews" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={`w-full text-left justify-start ${isActive('/contract-reviews') 
                    ? "bg-blue-700 text-white hover:bg-blue-600" 
                    : "text-white hover:bg-blue-700"
                  }`}
                >
                  Contract Reviews
                </Button>
              </Link>
              <Link to="/users" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant="ghost"
                  className={`w-full text-left justify-start ${isActive('/users') 
                    ? "bg-blue-700 text-white hover:bg-blue-600" 
                    : "text-white hover:bg-blue-700"
                  }`}
                >
                  Users
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
