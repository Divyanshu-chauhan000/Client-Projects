import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">THE MARWADI</span>
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-links">Products</Link>
          </li>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <li className="nav-item">
                  <Link to="/admin" className="nav-links">Admin Panel</Link>
                </li>
              )}
              <li className="nav-item">
                <Link to="/myenquiries" className="nav-links">My Enquiries</Link>
              </li>
              <li className="nav-item">
                <span className="nav-user-greeting">Hi, {user.name}</span>
                <button className="nav-button" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-links">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-button">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
