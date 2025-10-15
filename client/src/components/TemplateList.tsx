
import React from 'react';
import { Template } from '../types';

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ templates, onEdit, onDelete, onCopy }) => {
  return (
    <div className="template-list">
      {templates.length === 0 ? (
        <div className="empty-state">
          <p>No templates yet.</p>
          <span>Create your first one to get started!</span>
        </div>
      ) : (
        templates.map((template) => (
          <div key={template.id} className="template-item">
            <div className="template-item-content">
              <div className="template-item-header">
                <h4 className="template-title">{template.title}</h4>
              </div>
              {/* Category badge will be absolutely positioned */}
              <span className="template-category">{template.category}</span>
              <p className="template-content">{template.content}</p>
            </div>
            <div className="template-item-actions">
              <button className="btn-secondary" onClick={() => onEdit(template)}>Edit</button>
              <button className="btn-secondary" onClick={() => onDelete(template.id)}>Delete</button>
              <button className="btn-copy" onClick={() => onCopy(template.content)}>Copy</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TemplateList;
