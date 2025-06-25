
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DebugPanel: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-100 border-b-2 border-red-300 p-4 text-sm">
      <div className="max-w-4xl mx-auto">
        <h3 className="font-bold text-red-800 mb-2">🐛 DEBUG PANEL (Temporary)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <strong>User:</strong>
            <br />
            {user ? (
              <>
                Email: {user.email}
                <br />
                ID: {user.id?.slice(0, 8)}...
              </>
            ) : (
              'Not authenticated'
            )}
          </div>
          <div>
            <strong>Profile:</strong>
            <br />
            {profile ? (
              <>
                Role: {profile.role}
                <br />
                Name: {profile.full_name || 'N/A'}
              </>
            ) : user ? (
              'Loading profile...'
            ) : (
              'No profile (not logged in)'
            )}
          </div>
          <div>
            <strong>JWT Tests:</strong>
            <br />
            <button 
              onClick={() => (window as any).testJWTRefresh?.()}
              className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded mr-1"
            >
              Refresh JWT
            </button>
            <button 
              onClick={() => (window as any).checkJWTExpiry?.()}
              className="mt-1 px-2 py-1 bg-green-500 text-white text-xs rounded"
            >
              Check Expiry
            </button>
          </div>
          <div>
            <strong>Query Tests:</strong>
            <br />
            <button 
              onClick={() => (window as any).testQueryWithRetry?.()}
              className="mt-1 px-2 py-1 bg-purple-500 text-white text-xs rounded mr-1"
            >
              Test Retry
            </button>
            <button 
              onClick={() => (window as any).testForceReauth?.()}
              className="mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded"
            >
              Force Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
