import React, { useState, useEffect } from 'react';
// You will need to install lucide-react: npm install lucide-react
import { Search, Mail, Globe, Building } from 'lucide-react';

/**
 * Main App Component
 * This component fetches user data, manages the search state,
 * and renders the search bar and user list.
 */
export default function App() {
  // State for all users fetched from API
  const [allUsers, setAllUsers] = useState([]);
  // State for the users to be displayed (after filtering)
  const [filteredUsers, setFilteredUsers] = useState([]);
  // State for the search input value
  const [searchTerm, setSearchTerm] = useState('');
  // State for loading status
  const [isLoading, setIsLoading] = useState(true);
  // State for any errors during fetching
  const [error, setError] = useState(null);

  // Effect to fetch user data on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllUsers(data);
        setFilteredUsers(data); // Initially, display all users
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch users:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to filter users whenever the search term or the allUsers list changes
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    const newFilteredUsers = allUsers.filter(user =>
      user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      user.email.toLowerCase().includes(lowerCaseSearchTerm)
    );
    
    setFilteredUsers(newFilteredUsers);
  }, [searchTerm, allUsers]); // Re-run this effect if searchTerm or allUsers changes

  return (
    <div className="bg-gray-100 min-h-screen font-inter">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            User Dashboard
          </h1>
        </header>

        <main>
          {/* Pass searchTerm and its setter to the SearchBar */}
          <SearchBar 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />

          {/* Conditional Rendering based on state */}
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <UserList users={filteredUsers} />
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * SearchBar Component
 * Renders the search input field.
 */
const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative w-full max-w-lg mx-auto mb-8 md:mb-12">
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 rounded-full shadow-md bg-white border-2 border-transparent focus:outline-none focus:border-indigo-500 transition-colors"
      />
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={20}
      />
    </div>
  );
};

/**
 * UserList Component
 * Renders a grid of UserCard components.
 */
const UserList = ({ users }) => {
  if (users.length === 0) {
    return (
      <p className="text-center text-gray-600 text-lg">
        No users found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};

/**
 * UserCard Component
 * Displays the details for a single user.
 */
const UserCard = ({ user }) => {
  // Helper function to ensure website URL is valid
  const formatWebsiteUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `http://${url}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <div className="flex flex-col h-full">
        {/* Card Header */}
        <div className="flex items-center mb-4">
          <div className="shrink-0 w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {/* Creates initials from the user's name */}
            {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div className="ml-4 min-w-0"> {/* Added min-w-0 for truncation to work */}
            <h2 className="text-xl font-semibold text-gray-900 truncate" title={user.name}>
              {user.name}
            </h2>
            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
          </div>
        </div>

        {/* Card Body with User Details */}
        <div className="space-y-3 mt-2 grow">
          <UserDetailItem
            icon={<Mail size={16} className="text-gray-500" />}
            label="Email"
            value={user.email}
            href={`mailto:${user.email}`}
          />
          <UserDetailItem
            icon={<Building size={16} className="text-gray-500" />}
            label="Company"
            value={user.company.name}
          />
          <UserDetailItem
            icon={<Globe size={16} className="text-gray-500" />}
            label="Website"
            value={user.website}
            href={formatWebsiteUrl(user.website)}
            isLink={true}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * UserDetailItem Component
 * A reusable component for displaying a line item in the UserCard.
 */
const UserDetailItem = ({ icon, label, value, href, isLink }) => (
  <div className="flex items-start space-x-3">
    <div className="shrink-0 pt-1">{icon}</div>
    <div className="min-w-0"> {/* Added min-w-0 for truncation/wrapping */}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </h3>
      {isLink ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline break-all"
          title={value}
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-gray-700 break-all" title={value}>
          {value}
        </p>
      )}
    </div>
  </div>
);

/**
 * LoadingSpinner Component
 * Displays a simple spinner while data is loading.
 */
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
  </div>
);

/**
 * ErrorMessage Component
 * Displays an error message if the API fetch fails.
 */
const ErrorMessage = ({ message }) => (
  <div className="text-center py-20">
    <h2 className="text-xl font-semibold text-red-600">
      Oops! Something went wrong.
    </h2>
    <p className="text-gray-600 mt-2">
      Failed to load user data: {message}
    </p>
    <p className="text-gray-500 mt-4">Please try refreshing the page.</p>
  </div>
);