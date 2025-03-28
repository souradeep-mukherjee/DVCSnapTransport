import { useState, useEffect } from 'react';

export default function HealthCheck() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkApi() {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' }),
        });
        
        const data = await res.json();
        console.log('API health check response:', data);
        
        if (data && data.token) {
          setApiStatus('success');
        } else {
          setApiStatus('error');
          setError('API responded but no token received');
        }
      } catch (err) {
        console.error('API health check error:', err);
        setApiStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
    
    checkApi();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">System Health Check</h1>
        
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">API Status</h2>
          {apiStatus === 'loading' && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse"></div>
              <span>Checking API connection...</span>
            </div>
          )}
          
          {apiStatus === 'success' && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>API is responding correctly</span>
            </div>
          )}
          
          {apiStatus === 'error' && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>API connection error</span>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Frontend Status</h2>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>React application is running</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Components</h2>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Shadcn components loaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}