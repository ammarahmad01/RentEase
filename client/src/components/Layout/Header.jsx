import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, User, Menu, X, MessageSquare, Bell, PlusCircle, Home, Package, LogOut } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?keyword=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (userMenuOpen) setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-1 rounded mr-1">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-blue-600">RentEase</span>
          </div>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for items..."
              className="w-full py-2 pl-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-blue-600 transition-colors">
              <Search className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </form>

        <nav className="hidden md:flex items-center space-x-1">
          <Link to="/browse" className="px-3 py-2 text-sm font-medium hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
            Browse
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="px-3 py-2 text-sm font-medium hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                Dashboard
              </Link>
              
              <Link to="/create-listing" className="ml-1 flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <PlusCircle className="h-4 w-4 mr-1" /> List Item
              </Link>
              
              <div className="ml-2 flex items-center space-x-1">
                <Link to="/messages" className="relative p-2 rounded-full hover:bg-blue-50 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>
                
                <NotificationDropdown />
                
                <div className="relative">
                  <button 
                    onClick={toggleUserMenu}
                    className="flex items-center ml-1 p-1 rounded-full hover:bg-blue-50 transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {user?.name?.charAt(0)}
                      </div>
                    )}
                    <span className="hidden lg:block ml-2 mr-1 text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      
                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link 
                        to="/dashboard" 
                        className="flex items-center px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 ml-2">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        <div className="flex md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 pt-1 md:hidden">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for items..."
              className="w-full py-2 pl-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </form>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="py-3 space-y-1 px-4">
            <Link 
              to="/browse" 
              className="flex items-center text-sm font-medium py-2 px-3 hover:bg-blue-50 hover:text-blue-600 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="h-4 w-4 mr-2" />
              Browse
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center text-sm font-medium py-2 px-3 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link 
                  to="/create-listing" 
                  className="flex items-center text-sm font-medium py-2 px-3 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  List Your Item
                </Link>
                <Link 
                  to="/messages" 
                  className="flex items-center text-sm font-medium py-2 px-3 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Link>
                <Link 
                  to="/notifications" 
                  className="flex items-center text-sm font-medium py-2 px-3 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
                
                <div className="border-t border-gray-100 my-2"></div>
                
                <div className="px-3 py-2">
                  <div className="flex items-center">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {user?.name?.charAt(0)}
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <Link 
                  to="/profile" 
                  className="flex items-center text-sm font-medium py-2 px-3 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                <Link 
                  to="/dashboard" 
                  className="flex items-center text-sm font-medium py-2 px-3 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                
                <div className="border-t border-gray-100 my-2"></div>
                
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left text-sm font-medium py-2 px-3 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-3 pt-2">
                <Link 
                  to="/login" 
                  className="w-full py-2 text-center text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="w-full py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;