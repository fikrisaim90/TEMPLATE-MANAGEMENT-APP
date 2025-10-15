import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Template } from '../types';
import TemplateForm from './TemplateForm';
import TemplateList from './TemplateList';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = 'http://localhost:5000/api/templates';

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(undefined);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const fetchTemplates = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Template[] = await response.json();
      setTemplates(data);
      const uniqueCategories = Array.from(new Set(data.map(t => t.category)));
      setCategories(['All', ...uniqueCategories]);

      const counts: Record<string, number> = { 'All': data.length };
      data.forEach(template => {
        counts[template.category] = (counts[template.category] || 0) + 1;
      });
      setCategoryCounts(counts);

    } catch (error) {
      console.error("Error fetching templates:", error);
      showNotification('Failed to load templates.', 'error');
    }
  };


  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleNewTemplateClick = () => {
    setEditingTemplate(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleSaveTemplate = async (templateToSave: Omit<Template, 'id'>) => {
    try {
      let response;
      if (editingTemplate) {
        // Update existing template
        response = await fetch(`${API_BASE_URL}/${editingTemplate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateToSave),
        });
        showNotification('Template updated successfully!', 'success');
      } else {
        // Create new template
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateToSave),
        });
        showNotification('Template saved successfully!', 'success');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchTemplates(); // Refresh the list
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving template:", error);
      showNotification('Failed to save template.', 'error');
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchTemplates(); // Refresh the list
        showNotification('Template deleted successfully!', 'success');
      } catch (error) {
        console.error("Error deleting template:", error);
        showNotification('Failed to delete template.', 'error');
      }
    }
  };



  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    showNotification('Copied to clipboard!', 'success');
  };

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory === 'All') return true;
    return template.category === selectedCategory;
  });



  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Template Management</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="modal-nav">
            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} <span className="category-count-badge">{categoryCounts[category] || 0}</span>
                </button>
              ))}
            </div>
            <div className="action-bar">
              <button className="new-template-button" onClick={handleNewTemplateClick}>+ New Template</button>
            </div>
          </div>
          <TemplateList
            templates={filteredTemplates}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onCopy={handleCopyToClipboard}
          />
        </div>
      </div>
      {isFormOpen && (
        <TemplateForm
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={handleFormClose}
          categories={categories.filter(c => c !== 'All')}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default TemplateModal;