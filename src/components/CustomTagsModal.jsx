import React, { useState, useEffect } from 'react';
import Select from 'react-select/creatable';
import { userAPI, articleManagementAPI } from '../services/api';

const CustomTagsModal = ({ 
  show, 
  onClose, 
  article, 
  onSave, 
  isAuthenticated 
}) => {
  const [availableCustomTags, setAvailableCustomTags] = useState([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  useEffect(() => {
    if (show && isAuthenticated) {
      loadCustomTags();
      setSelectedCustomTags(article?.custom_tags || []);
    }
  }, [show, article, isAuthenticated]);

  const loadCustomTags = async () => {
    try {
      const response = await userAPI.getCustomTags();
      if (response.success) {
        setAvailableCustomTags(response.custom_tags || []);
      }
    } catch (err) {
      console.error('Error loading custom tags:', err);
    }
  };

  const createNewTag = async (inputValue) => {
    if (!inputValue.trim()) return;
    
    try {
      setIsCreatingTag(true);
      const response = await userAPI.createCustomTag(inputValue.trim());
      
      if (response.success) {
        const newTag = response.tag;
        setAvailableCustomTags(prev => [...prev, newTag]);
        
        // Add the new tag to selection
        const newTagName = newTag.tag_name;
        if (!selectedCustomTags.includes(newTagName)) {
          setSelectedCustomTags(prev => [...prev, newTagName]);
        }
        
        return {
          value: newTagName,
          label: `${newTagName} (1 use)`,
          isNew: true
        };
      }
    } catch (err) {
      console.error('Error creating tag:', err);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await articleManagementAPI.addCustomTagsToArticle(
        article.id, 
        selectedCustomTags
      );

      if (response.success) {
        onSave(selectedCustomTags);
        onClose();
      }
    } catch (err) {
      console.error('Error saving custom tags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Transform available tags for react-select
  const tagOptions = availableCustomTags.map(tag => ({
    value: tag.tag_name,
    label: `${tag.tag_name} (${tag.usage_count} use${tag.usage_count !== 1 ? 's' : ''})`
  }));

  // Transform selected tags for react-select
  const selectedOptions = selectedCustomTags.map(tagName => ({
    value: tagName,
    label: tagName
  }));

  const handleSelectChange = (selectedOptions) => {
    const tagNames = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedCustomTags(tagNames);
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      padding: '0.25rem',
      fontSize: '0.875rem',
      borderColor: state.isFocused ? '#1a8917' : '#e9ecef',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(26, 137, 23, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#1a8917'
      }
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e9ecef'
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '0.875rem',
      padding: '0.625rem 1rem',
      backgroundColor: state.isSelected 
        ? '#e8f5e8' 
        : state.isFocused 
        ? '#f0f9f0' 
        : 'white',
      color: state.isSelected || state.isFocused ? '#1a8917' : '#495057',
      cursor: 'pointer'
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#1a8917',
      borderRadius: '14px',
      fontSize: '0.8rem'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
      padding: '0.25rem 0.5rem'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        color: 'white'
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#adb5bd',
      fontStyle: 'italic'
    })
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog custom-tags-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-tags me-2"></i>
              Manage Custom Tags
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Article Info */}
            <div className="article-info-compact">
              <div className="article-info-title">
                {article?.title || 'Article'}
              </div>
            </div>

            {/* Tag Selection */}
            <div className="tag-dropdown-section">
              <label className="dropdown-label">
                <i className="fas fa-search me-2"></i>
                Search and select tags
              </label>
              
              <Select
                isMulti
                value={selectedOptions}
                onChange={handleSelectChange}
                options={tagOptions}
                onCreateOption={createNewTag}
                isCreatable={true}
                isLoading={isCreatingTag}
                placeholder="Type to search or create new tags..."
                noOptionsMessage={() => "No tags found. Type to create a new one!"}
                formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                styles={customStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable={true}
                isClearable={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={{
                  DropdownIndicator: () => (
                    <div style={{ padding: '0 8px' }}>
                      <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', color: '#6c757d' }}></i>
                    </div>
                  )
                }}
              />
              
              <div className="mt-2">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Type to search existing tags or create new ones. Selected: {selectedCustomTags.length}
                </small>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Save Tags
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTagsModal;
