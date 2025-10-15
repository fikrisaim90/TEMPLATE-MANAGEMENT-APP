
import React, { useState, useEffect } from 'react';
import { Template } from '../types';

interface TemplateFormProps {
  template?: Template; // Optional, for editing existing templates
  onSave: (template: Omit<Template, 'id'>) => void;
  onCancel: () => void;
  categories: string[];
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSave, onCancel, categories }) => {
  const [title, setTitle] = useState(template?.title || '');
  const [category, setCategory] = useState(template?.category || '');
  const [content, setContent] = useState(template?.content || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [paraphraseSuggestions, setParaphraseSuggestions] = useState<string[]>([]);
  const [showParaphraseSuggestions, setShowParaphraseSuggestions] = useState(false);
  const [isParaphrasing, setIsParaphrasing] = useState(false);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setCategory(template.category);
      setContent(template.content);
    } else {
      setTitle('');
      setCategory('');
      setContent('');
    }
  }, [template]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategory(value);
    if (value) {
      const filteredSuggestions = categories.filter(c =>
        c.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCategory(suggestion);
    setShowSuggestions(false);
  };

  const handleParaphrase = async () => {
    setIsParaphrasing(true);
    // Dummy paraphrasing function
    setTimeout(() => {
      setParaphraseSuggestions([
        `${content}`,
      ]);
      setIsParaphrasing(false);
      setShowParaphraseSuggestions(true);
    }, 1000);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setContent(suggestion);
    setShowParaphraseSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !content) {
      alert('Please fill in all fields.');
      return;
    }
    const newTemplate = {
      title,
      category,
      content,
    };
    onSave(newTemplate);
  };

  return (
    <div className="template-form-overlay">
      <div className="template-form-content">
        <h3>{template ? 'Edit Template' : 'Create New Template'}</h3>
        <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group category-form-group">
          <label htmlFor="category">Category</label>
          <div className="category-input-wrapper">
            <input
              type="text"
              id="category"
              value={category}
              onChange={handleCategoryChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              required
              autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map(suggestion => (
                  <li key={suggestion} onMouseDown={() => handleSuggestionClick(suggestion)}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="form-group content-form-group">
          <div className="form-group-header">
            <label htmlFor="content">Content</label>
            <button type="button" className="ai-suggestion-button" onClick={handleParaphrase} disabled={isParaphrasing}>
              &#x2728; {isParaphrasing ? 'Generating...' : 'AI Suggestion'}
            </button>
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            required
          ></textarea>
          {showParaphraseSuggestions && (
            <div className="paraphrase-suggestions">
              {template?.aiSuggestedImprovement && (
                <div className="mb-4">
                  <p className="text-sky-500">
                    <b>AI Suggested Improvement:</b>
                  </p>
                  <textarea
                    className="w-full p-2 rounded mt-1 bg-sky-50"
                    rows={4}
                    value={template?.aiSuggestedImprovement}
                    readOnly
                  ></textarea>
                </div>
              )}
              <p>{paraphraseSuggestions[0]}</p>
              <div className="suggestion-actions">
                <button type="button" onClick={() => handleUseSuggestion(paraphraseSuggestions[0])}>Use Suggestion</button>
                <button type="button" onClick={() => setShowParaphraseSuggestions(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
          <button type="submit" className="save-button">Save Template</button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default TemplateForm;
