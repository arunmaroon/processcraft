import React, { useState, useEffect } from 'react';
import { FolderOpen, Download, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink: string;
}

interface GoogleDriveAuthProps {
  onTrainingDataImported?: (data: string, fileName: string) => void;
}

const GoogleDriveAuth: React.FC<GoogleDriveAuthProps> = ({ onTrainingDataImported }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Google OAuth 2.0 configuration
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || '';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

  useEffect(() => {
    initializeGoogleAPI();
  }, []);

  const initializeGoogleAPI = async () => {
    try {
      // Load Google API script
      if (!window.gapi) {
        await loadGoogleAPIScript();
      }

      await new Promise((resolve) => {
        window.gapi.load('auth2:client', resolve);
      });

      await window.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES
      });

      const authInstance = window.gapi.auth2.getAuthInstance();
      setIsAuthenticated(authInstance.isSignedIn.get());
      
      if (authInstance.isSignedIn.get()) {
        const user = authInstance.currentUser.get();
        const authResponse = user.getAuthResponse();
        setAccessToken(authResponse.access_token);
      }
    } catch (err) {
      console.error('Error initializing Google API:', err);
      setError('Failed to initialize Google API');
    }
  };

  const loadGoogleAPIScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-api-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-api-script';
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      const authResponse = user.getAuthResponse();
      
      setAccessToken(authResponse.access_token);
      setIsAuthenticated(true);
      await loadDriveFiles();
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setIsAuthenticated(false);
      setAccessToken(null);
      setFiles([]);
    } catch (err) {
      console.error('Sign-out error:', err);
      setError('Failed to sign out');
    }
  };

  const loadDriveFiles = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const response = await window.gapi.client.drive.files.list({
        pageSize: 50,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink)',
        q: "mimeType='application/vnd.google-apps.document' or mimeType='text/plain' or mimeType='application/pdf' or name contains 'training' or name contains 'data' or name contains 'transcript'"
      });

      setFiles(response.result.files || []);
    } catch (err) {
      console.error('Error loading Drive files:', err);
      setError('Failed to load Google Drive files');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async (file: GoogleDriveFile) => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      let content = '';
      
      if (file.mimeType === 'application/vnd.google-apps.document') {
        // Export Google Doc as plain text
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=text/plain`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        content = await response.text();
      } else if (file.mimeType === 'text/plain') {
        // Download plain text file
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        content = await response.text();
      }

      if (content && onTrainingDataImported) {
        onTrainingDataImported(content, file.name);
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(`Failed to download ${file.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: string | undefined): string => {
    if (!bytes) return 'Unknown size';
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!CLIENT_ID || !API_KEY) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-yellow-800">Google API Configuration Required</h3>
            <p className="text-yellow-700 mt-1">
              Please set up Google OAuth credentials in your environment variables:
            </p>
            <ul className="list-disc list-inside text-sm text-yellow-600 mt-2">
              <li>REACT_APP_GOOGLE_CLIENT_ID</li>
              <li>REACT_APP_GOOGLE_API_KEY</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authentication Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Google Drive Access</h3>
              <p className="text-sm text-gray-600">
                {isAuthenticated ? 'Connected and ready to import training data' : 'Sign in to access your Google Drive files'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            )}
            
            <button
              onClick={isAuthenticated ? handleSignOut : handleSignIn}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isAuthenticated
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isAuthenticated ? 'Sign Out' : 'Sign In with Gmail'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Files List */}
      {isAuthenticated && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Training Data Files</h4>
              <button
                onClick={loadDriveFiles}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Refresh
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {files.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No training data files found</p>
                <p className="text-sm mt-1">
                  Looking for documents, text files, or files containing 'training', 'data', or 'transcript'
                </p>
              </div>
            ) : (
              files.map((file) => (
                <div key={file.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <h5 className="font-medium text-gray-900">{file.name}</h5>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>Modified {formatDate(file.modifiedTime)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        View
                      </a>
                      <button
                        onClick={() => downloadFile(file)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-sm bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Import
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Extend window object for Google API
declare global {
  interface Window {
    gapi: any;
  }
}

export default GoogleDriveAuth;
