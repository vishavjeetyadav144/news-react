import React, { useState, useRef, useEffect } from 'react';
import { uploadAPI } from '../../services/api';
import { parseUploadStatus } from '../../services/dataParser';
import { useAuth } from '../../contexts/AuthContext';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();

  // Fetch recent uploads and processing status
  useEffect(() => {
    const fetchUploadStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch processing status from Django backend
        const response = await uploadAPI.getProcessingStatus();

        // Parse the response
        const uploads = parseUploadStatus(response);
        setRecentUploads(uploads);

      } catch (err) {
        console.error('Error fetching upload status:', err);
        setError(err.message);

        // Fallback to mock data on error
        setRecentUploads([
          {
            id: 1,
            fileName: 'The_Hindu_15_Jan_2024.pdf',
            uploadedAt: new Date('2024-01-15T10:30:00'),
            processed: true
          },
          {
            id: 2,
            fileName: 'Indian_Express_14_Jan_2024.pdf',
            uploadedAt: new Date('2024-01-14T09:15:00'),
            processed: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUploadStatus();

    // Poll for status updates every 5 seconds if there are processing uploads
    const interval = setInterval(() => {
      if (recentUploads.some(upload => !upload.processed)) {
        fetchUploadStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a PDF file to upload.');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      alert('File size must be less than 50MB.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Upload PDF using Django backend
      await uploadAPI.uploadPDF(selectedFile);

      // Show success message
      const notification = document.createElement('div');
      notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
      notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
      notification.innerHTML = `
        PDF upload successful! Processing has started in the background.
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 5000);

      // Reset form
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh upload status
      const response = await uploadAPI.getProcessingStatus();
      const uploads = parseUploadStatus(response);
      setRecentUploads(uploads);

    } catch (err) {
      console.error('Error uploading PDF:', err);

      // Show error message
      const notification = document.createElement('div');
      notification.className = 'alert alert-danger alert-dismissible fade show position-fixed';
      notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
      notification.innerHTML = `
        Error uploading PDF: ${err.message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 5000);

    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if date is invalid
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return dateString; // Return original string if formatting fails
    }
  };

  return (
    <div className="upload-page">
      {/* Hero Section */}
      

      {
          isAuthenticated && user.permissions.can_upload_pdfs ?
          <div className="upload-hero text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">Upload Your PDF</h1>
        <p className="lead text-muted mb-4">
          Transform newspaper PDFs into structured UPSC-relevant news articles using AI
        </p>
      </div>
          :
          <div className="upload-hero text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">AI Processed PDF</h1>
        <p className="lead text-muted mb-4">
          Newspaper PDFs into structured UPSC-relevant news articles using AI
        </p>
      </div>
      }

      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          {/* Upload Form Card */}
          {
            isAuthenticated && user.permissions.can_upload_pdfs ?

              <div className="upload-card">
                <form onSubmit={handleSubmit}>
                  {/* Upload Area */}
                  <div
                    className={`upload-area ${isDragOver ? 'dragover' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="upload-icon mb-4">
                      <i className={`fas ${selectedFile ? 'fa-file-pdf text-success' : 'fa-cloud-upload-alt text-primary'} fa-4x`}></i>
                    </div>
                    <h3 className="upload-title mb-3">
                      {selectedFile ? selectedFile.name : 'Drop your PDF here'}
                    </h3>
                    <p className={`upload-subtitle mb-4 ${selectedFile ? 'text-success' : 'text-muted'}`}>
                      {selectedFile
                        ? `${formatFileSize(selectedFile.size)} - Ready to process`
                        : 'or click to browse files'
                      }
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                    />

                    <div className="upload-info mt-4">
                      <div className="row text-center">
                        <div className="col-4">
                          <i className="fas fa-file-pdf text-danger mb-2"></i>
                          <small className="d-block text-muted">PDF Only</small>
                        </div>
                        <div className="col-4">
                          <i className="fas fa-weight-hanging text-warning mb-2"></i>
                          <small className="d-block text-muted">Max 50MB</small>
                        </div>
                        <div className="col-4">
                          <i className="fas fa-robot text-success mb-2"></i>
                          <small className="d-block text-muted">AI Powered</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Button */}
                  <div className="text-center mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg px-5 py-3"
                      disabled={isProcessing || !selectedFile}
                    >
                      {isProcessing ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-magic me-2"></i>Process PDF
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              :
              <></>
          }

          {/* Processing Status */}
          {isProcessing && (
            <div className="mt-4">
              <div className="processing-card">
                <div className="d-flex align-items-center mb-3">
                  <i className="fas fa-cog fa-spin text-primary me-3 fs-4"></i>
                  <div>
                    <h5 className="mb-1">Processing your PDF...</h5>
                    <p className="text-muted mb-0">This may take a few minutes</p>
                  </div>
                </div>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Converting pages to images...</small>
                  <small className="text-muted">{Math.round(progress)}%</small>
                </div>
              </div>
            </div>
          )}

          {/* How it Works */}
          <div className="how-it-works mt-5">
            <h3 className="text-center mb-4">How it works</h3>
            <div className="row">
              <div className="col-md-3 text-center mb-4">
                <div className="step-icon mb-3">
                  <i className="fas fa-upload fa-2x text-primary"></i>
                </div>
                <h6>1. Upload</h6>
                <small className="text-muted">Upload your newspaper PDF file</small>
              </div>
              <div className="col-md-3 text-center mb-4">
                <div className="step-icon mb-3">
                  <i className="fas fa-images fa-2x text-info"></i>
                </div>
                <h6>2. Convert</h6>
                <small className="text-muted">AI converts pages to images</small>
              </div>
              <div className="col-md-3 text-center mb-4">
                <div className="step-icon mb-3">
                  <i className="fas fa-brain fa-2x text-success"></i>
                </div>
                <h6>3. Extract</h6>
                <small className="text-muted">Extract UPSC relevant content</small>
              </div>
              <div className="col-md-3 text-center mb-4">
                <div className="step-icon mb-3">
                  <i className="fas fa-database fa-2x text-warning"></i>
                </div>
                <h6>4. Store</h6>
                <small className="text-muted">Organize in searchable database</small>
              </div>
            </div>
          </div>

          {/* Recent Uploads */}
          {recentUploads.length > 0 && (
            <div className="recent-uploads mt-5">
              <h4 className="mb-3">Recent Uploads</h4>
              {recentUploads.map((upload) => (
                <div key={upload.id} className="upload-item d-flex align-items-center justify-content-between p-3 mb-2 bg-light rounded">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-file-pdf text-danger me-3"></i>
                    <div>
                      <h6 className="mb-1">{upload.fileName}</h6>
                      <small className="text-muted">{formatDate(upload.uploadedAt)}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    {upload.processed ? (
                      <span className="badge bg-success">
                        <i className="fas fa-check me-1"></i>Processed
                      </span>
                    ) : (
                      <span className="badge bg-warning">
                        <i className="fas fa-clock me-1"></i>Processing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
