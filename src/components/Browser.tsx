import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BlockingNotification from './BlockingNotification';
import { ContentFilterService } from '../services/ContentFilterService';

interface BrowserProps {
  ageRange: 'children' | 'teenagers' | 'adults';
  onAgeRangeChange: (range: 'children' | 'teenagers' | 'adults') => void;
}

interface BrowserState {
  currentUrl: string;
  blockedContent: {
    reason: string;
    explanation: string;
  } | null;
  isLoading: boolean;
  history: string[];
  bookmarks: string[];
}

const Browser: React.FC<BrowserProps> = ({ ageRange, onAgeRangeChange }: BrowserProps) => {
  const navigate = useNavigate();
  const [state, setState] = useState<BrowserState>({
    currentUrl: '',
    blockedContent: null,
    isLoading: false,
    history: [],
    bookmarks: []
  });
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const contentFilterService = useRef(new ContentFilterService());
  
  // Initialize the content filter service with the current age range
  useEffect(() => {
    contentFilterService.current.setAgeRange(ageRange);
    console.log(`Browser initialized with age range: ${ageRange}`);
    
    // Apply different UI themes based on age range
    document.documentElement.className = `theme-${ageRange}`;
  }, [ageRange]);

  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.currentUrl) {
      setState((prev: BrowserState) => ({ ...prev, isLoading: true }));
      
      try {
        // Check if the URL is allowed for the current age range
        const filterResult = await contentFilterService.current.checkUrl(state.currentUrl);
        
        if (filterResult.blocked) {
          setState((prev: BrowserState) => ({
            ...prev,
            isLoading: false,
            blockedContent: {
              reason: filterResult.reason,
              explanation: filterResult.explanation
            }
          }));
        } else {
          // URL is allowed, add to history and navigate
          setState((prev: BrowserState) => ({
            ...prev,
            history: [...prev.history, state.currentUrl]
          }));
          navigate(state.currentUrl);
        }
      } catch (error) {
        console.error('Error checking URL:', error);
        setState((prev: BrowserState) => ({ ...prev, isLoading: false }));
      }
    }
  };

  const handleAgeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'children' | 'teenagers' | 'adults';
    onAgeRangeChange(value);
    contentFilterService.current.setAgeRange(value);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev: BrowserState) => ({ ...prev, currentUrl: e.target.value }));
  };
  
  const handleDismissBlockedContent = () => {
    setState((prev: BrowserState) => ({ ...prev, blockedContent: null }));
  };
  
  const handleAddBookmark = () => {
    if (state.currentUrl && !state.bookmarks.includes(state.currentUrl)) {
      setState((prev: BrowserState) => ({
        ...prev,
        bookmarks: [...prev.bookmarks, state.currentUrl]
      }));
    }
  };
  
  const handleGoBack = () => {
    if (state.history.length > 1) {
      const newHistory = [...state.history];
      newHistory.pop(); // Remove current URL
      const previousUrl = newHistory[newHistory.length - 1];
      
      setState((prev: BrowserState) => ({
        ...prev,
        currentUrl: previousUrl,
        history: newHistory
      }));
      
      navigate(previousUrl);
    }
  };

  // Apply different color schemes based on age range
  const getBrowserTheme = () => {
    switch (ageRange) {
      case 'children':
        return {
          primary: 'bg-blue-500',
          secondary: 'bg-yellow-400',
          text: 'text-blue-600',
          accent: 'border-blue-400'
        };
      case 'teenagers':
        return {
          primary: 'bg-purple-500',
          secondary: 'bg-indigo-400',
          text: 'text-purple-600',
          accent: 'border-purple-400'
        };
      case 'adults':
        return {
          primary: 'bg-gray-700',
          secondary: 'bg-gray-500',
          text: 'text-gray-800',
          accent: 'border-gray-500'
        };
      default:
        return {
          primary: 'bg-blue-500',
          secondary: 'bg-blue-400',
          text: 'text-blue-600',
          accent: 'border-blue-400'
        };
    }
  };
  
  const theme = getBrowserTheme();

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100">
      {/* Navigation Bar */}
      <div className={`flex items-center p-4 ${theme.primary} text-white shadow-md`}>
        <div className="flex items-center space-x-2 mr-4">
          <button 
            onClick={handleGoBack}
            className="p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            disabled={state.history.length <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={handleAddBookmark}
            className="p-2 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleUrlSubmit} className="flex-1 flex">
          <input
            type="text"
            placeholder="Enter URL..."
            value={state.currentUrl}
            onChange={handleUrlChange}
            className="flex-1 px-4 py-2 rounded-l text-gray-800 focus:outline-none"
          />
          <button 
            type="submit"
            className={`${theme.secondary} px-4 py-2 rounded-r font-medium hover:opacity-90 transition-opacity`}
          >
            Go
          </button>
        </form>
        
        <select 
          value={ageRange} 
          onChange={handleAgeRangeChange}
          className="ml-4 px-3 py-2 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="children">Children (5-12)</option>
          <option value="teenagers">Teenagers (13-17)</option>
          <option value="adults">Adults (18+)</option>
        </select>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {state.currentUrl && (
          <iframe
            ref={iframeRef}
            src={state.currentUrl}
            title="Browser Content"
            className="w-full h-full border-0"
            onLoad={() => setState((prev: BrowserState) => ({ ...prev, isLoading: false }))}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
        
        {!state.currentUrl && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className={`text-6xl mb-4 ${theme.text}`}>
              AgeLock
            </div>
            <p className="text-gray-600 max-w-md text-center mb-8">
              Secure, age-appropriate browsing with TPM-backed protection and on-device content filtering.
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-4xl">
              {state.bookmarks.length > 0 ? (
                state.bookmarks.map((bookmark, index) => (
                  <div 
                    key={index}
                    className={`p-4 ${theme.accent} border rounded-lg cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        currentUrl: bookmark,
                        isLoading: true
                      }));
                      navigate(bookmark);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${bookmark}&sz=64`} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    </div>
                    <div className="truncate text-sm">{bookmark}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-500">
                  No bookmarks yet. Add some by clicking the bookmark icon while browsing.
                </div>
              )}
            </div>
          </div>
        )}
        
        {state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
              <svg className="animate-spin h-8 w-8 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-700 font-medium">Loading...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Blocking Notification */}
      {state.blockedContent && (
        <BlockingNotification
          reason={state.blockedContent.reason}
          explanation={state.blockedContent.explanation}
          onClose={handleDismissBlockedContent}
        />
      )}
    </div>
  );
};

export default Browser;
