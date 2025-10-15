import React, { useState } from 'react';
import './App.css';
import TemplateModal from './components/TemplateModal';

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <a className="navbar-brand" href="#">UPBOX</a>
          <div className="navbar-actions">
            <button className="new-template-button" onClick={() => setShowModal(true)}>
              Manage Templates
            </button>
            <div className="user-avatar"></div> {/* User Avatar Placeholder */}
          </div>
        </div>
      </nav>
      <div className="container mt-5">
        <div className="text-center">
          <h1 className="display-4">Welcome to CX Dashboard</h1>
          <p className="lead text-secondary">5-star result, 5-star service. Manage your customers here.</p>
        </div>
      </div>
      <TemplateModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

export default App;