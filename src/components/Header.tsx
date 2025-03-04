import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-green-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Thryve Nutrition Tracker</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/history" className="hover:underline">History</Link></li>
            <li><Link to="/camera" className="hover:underline">Add Food</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 