import React, { useState, useEffect } from 'react';
import { Link2, Copy, BarChart3, ExternalLink, Trash2, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function App() {
  const [urls, setUrls] = useState([]);
  const [originalUrl, setOriginalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Fetch all URLs on mount
  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch(`${API_URL}/api/urls`);
      const data = await response.json();
      setUrls(data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    }
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!originalUrl.trim()) {
    alert('Please enter a URL');
    return;
  }

  if (!isValidUrl(originalUrl)) {
    alert('Please enter a valid URL (including http:// or https://)');
    return;
  }

  setLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/api/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ originalUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to shorten URL');
    }

    const data = await response.json();
    
    // Check if URL already existed
    if (data.message === 'URL already shortened') {
      alert('⚠️ This URL has already been shortened! Using existing short code.');
      // Remove the old entry from list and add to top
      setUrls([data, ...urls.filter(u => u._id !== data._id)]);
    } else {
      // New URL created
      setUrls([data, ...urls]);
    }
    
    setOriginalUrl('');
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to shorten URL. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleCopy = (shortCode, id) => {
    const shortUrl = `${API_URL}/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this URL?')) {
      try {
        await fetch(`${API_URL}/api/urls/${id}`, {
          method: 'DELETE',
        });
        setUrls(urls.filter(url => url._id !== id));
      } catch (error) {
        console.error('Error deleting URL:', error);
        alert('Failed to delete URL');
      }
    }
  };

  const handleRedirect = (shortCode) => {
    window.open(`${API_URL}/${shortCode}`, '_blank');
    // Refresh to update click count
    setTimeout(fetchUrls, 500);
  };

  const filteredUrls = urls.filter(url => 
    url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Link2 className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">URL Shortener</h1>
          </div>
          <p className="text-gray-600">Create short, shareable links with analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total URLs</p>
                <p className="text-3xl font-bold text-indigo-600">{urls.length}</p>
              </div>
              <Link2 className="w-12 h-12 text-indigo-200" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Clicks</p>
                <p className="text-3xl font-bold text-green-600">{totalClicks}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-200" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Clicks</p>
                <p className="text-3xl font-bold text-purple-600">
                  {urls.length > 0 ? Math.round(totalClicks / urls.length) : 0}
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* URL Shortener Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Shorten a URL</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
              placeholder="Enter your long URL here (e.g., https://example.com/...)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search URLs or short codes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* URLs List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Shortened URLs</h2>
          </div>
          
          {filteredUrls.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Link2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">
                {searchTerm ? 'No URLs found matching your search' : 'No shortened URLs yet. Create your first one above!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUrls.map((url) => (
                <div key={url._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-mono font-semibold">
                          {url.shortCode}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 truncate">
                        {url.originalUrl}
                      </p>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700 font-medium">{url.clicks} clicks</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(url.shortCode, url._id)}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Copy short URL"
                      >
                        {copiedId === url._id ? (
                          <span className="text-xs text-green-600 font-medium">Copied!</span>
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleRedirect(url.shortCode)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Visit URL"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(url._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete URL"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Built with MongoDB, Express.js, React.js (Vite), Node.js, and Nanoid</p>
        </div>
      </div>
    </div>
  );
}

export default App;