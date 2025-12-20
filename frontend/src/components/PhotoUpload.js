import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

// PhotoUpload component allows users to upload an image file or provide an image URL
const PhotoUpload = ({ onPhotoChange, currentPhoto }) => {
  const [mode, setMode] = useState('upload'); // 'upload' or 'url'
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', ''); // http://localhost:5000

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const token = user?.token;
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      // Also add admin email if needed by your auth middleware
      if (user?.email) {
        headers['x-admin-email'] = user.email;
      }

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Construct full URL
      const fullUrl = `${BASE_URL}${data.url}`;
      onPhotoChange(fullUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput) {
      onPhotoChange(urlInput);
      setUrlInput('');
    }
  };

  const handleRemovePhoto = () => {
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            mode === 'upload' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload File</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
            mode === 'url' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <span>Image URL</span>
          </div>
        </button>
      </div>

      {/* Input Area */}
      <div className="border-2 border-dashed border-border rounded-xl p-6 bg-muted/30 hover:bg-muted/50 transition-colors">
        {currentPhoto ? (
          <div className="relative group">
            <img 
              src={currentPhoto} 
              alt="Preview" 
              className="h-48 w-full object-cover rounded-lg shadow-sm"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemovePhoto}
              >
                <X className="h-4 w-4 mr-2" /> Remove Photo
              </Button>
            </div>
          </div>
        ) : (
          <>
            {mode === 'upload' ? (
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="photo-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploading ? (
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  ) : (
                    <div className="bg-background p-4 rounded-full shadow-sm">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {uploading ? 'Uploading...' : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SVG, PNG, JPG or GIF (max. 5MB)
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
                <Button 
                  type="button" 
                  onClick={handleUrlSubmit}
                  disabled={!urlInput}
                >
                  Add
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
