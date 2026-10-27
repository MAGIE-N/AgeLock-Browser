// @ts-ignore
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentFilterService from '../services/ContentFilterService';

type FormEvent = React.FormEvent<HTMLFormElement>;
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
type InputKeyboardEvent = React.KeyboardEvent<HTMLInputElement>;

declare global {
  interface Window {
    electron: {
      onBlockedContent: (callback: (data: BlockedContent) => void) => void;
      removeBlockedContentListener: () => void;
      getStoredAge: () => Promise<{ ageRange?: string }>;
    };
  }
}

interface Prediction {
    score: number;
    probability: number;
}

interface FilterExplanation {
    prediction: Prediction;
    shapValues: number | number[];
    features?: string[];
    values?: number[];
}

interface BlockedContent {
    url: string;
    reason: string;
    explanation?: FilterExplanation;
}

const Browser = () => {
    const [url, setUrl] = useState<string>('');
    const [blockedContent, setBlockedContent] = useState<BlockedContent | null>(null);
    const navigate = useNavigate();
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useEffect(() => {
        // Listen for blocked content notifications
        const handleBlockedContent = (data: BlockedContent): void => {
            setBlockedContent(data);
        };

        window.electron.onBlockedContent(handleBlockedContent);

        // Clean up listener on unmount
        return () => {
            window.electron.removeBlockedContentListener();
        };
    }, []);

    const handleNavigate = async (newUrl: string): Promise<void> => {
        try {
            // First check if URL is allowed
            const filterResult = await ContentFilterService.filterContent(newUrl, '');
            
            if (filterResult.blocked) {
                setBlockedContent({
                    url: newUrl,
                    reason: filterResult.reason,
                    explanation: filterResult.explanation as FilterExplanation
                });
                return;
            }

            // Navigate if URL is allowed
            if (iframeRef.current) {
                iframeRef.current.src = newUrl;
                setUrl(newUrl);
            }
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    const handleContentLoad = async (event: React.SyntheticEvent<HTMLIFrameElement>) => {
        try {
            // Get content from iframe
            const iframe = event.currentTarget;
            const content = iframe.contentDocument?.body.textContent || '';
            
            // Filter content
            const filterResult = await ContentFilterService.filterContent(url, content);
            
            if (filterResult.blocked) {
                setBlockedContent({
                    url,
                    reason: filterResult.reason,
                    explanation: filterResult.explanation as FilterExplanation
                });
            }
        } catch (error) {
            console.error('Content filtering error:', error);
        }
    };

    const handleImageLoad = async (event: React.SyntheticEvent<HTMLImageElement>) => {
        try {
            const image = event.currentTarget;
            const filterResult = await ContentFilterService.filterContent(url, image);
            
            if (filterResult.blocked) {
                image.src = '/blocked-image-placeholder.png';
                setBlockedContent({
                    url,
                    reason: filterResult.reason,
                    explanation: filterResult.explanation as FilterExplanation
                });
            }
        } catch (error) {
            console.error('Image filtering error:', error);
        }
    };

    const renderExplanation = (explanation: FilterExplanation | undefined) => {
        if (!explanation) return null;

        const safeFeatures = explanation.features || [];
        const safeValues = explanation.values || [];
        
        return (
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Why was this content blocked?</h3>
                <p className="mt-2 text-sm text-gray-600">
                    This content was blocked because it contains elements that may not be appropriate for the selected age range.
                </p>
                {safeFeatures.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Content Analysis:</h4>
                        <ul className="mt-2 space-y-2">
                            {safeFeatures.map((feature: string, index: number) => (
                                <li key={index} className="flex items-center">
                                    <span className="text-sm text-gray-600">{feature}:</span>
                                    <span className="ml-2 text-sm font-medium">
                                        {safeValues[index] !== undefined 
                                            ? safeValues[index].toFixed(2) 
                                            : 'N/A'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const [isLoading, setIsLoading] = useState(false);
    const [inputUrl, setInputUrl] = useState('');

    const handleUrlSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!inputUrl.trim()) return;
        
        // Add https:// if no protocol is specified
        let urlToLoad = inputUrl.trim();
        if (!urlToLoad.match(/^https?:\/\//)) {
            urlToLoad = 'https://' + urlToLoad;
        }
        
        setUrl(urlToLoad);
        handleNavigate(urlToLoad);
    };

    const handleKeyDown = (e: InputKeyboardEvent) => {
        if (e.key === 'Enter') {
            handleUrlSubmit(e as unknown as FormEvent);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-bold text-gray-900">AgeLock Browser</h1>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    (iframeRef.current?.contentWindow as Window)?.history.back();
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700"
                                title="Go back"
                            >
                                ←
                            </button>
                            <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    (iframeRef.current?.contentWindow as Window)?.history.forward();
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700"
                                title="Go forward"
                            >
                                →
                            </button>
                            <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    (iframeRef.current?.contentWindow as Window)?.location.reload();
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700"
                                title="Refresh"
                            >
                                ↻
                            </button>
                            <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    navigate('/age-range');
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                            >
                                Change Age Range
                            </button>
                        </div>
                    </div>
                    <div className="pb-4">
                        <form onSubmit={handleUrlSubmit} className="flex rounded-md shadow-sm">
                            <input
                                type="text"
                                value={inputUrl}
                                onChange={(e: InputChangeEvent) => setInputUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter a URL"
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Go'}
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-full">
                                <p className="text-sm text-gray-500 mb-1">Current URL: {url || 'None'}</p>
                            </div>
                        </div>

                        {blockedContent && (
                            <div className="mt-4 p-6 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="text-lg font-medium text-red-800 mb-2">
                                    Content Blocked
                                </h3>
                                <p className="text-red-700 mb-4">{blockedContent.reason}</p>
                                {renderExplanation(blockedContent.explanation)}
                            </div>
                        )}

                        {!blockedContent && (
                            <iframe
                                ref={iframeRef}
                                src={url || 'about:blank'}
                                className="w-full h-[600px] mt-4 border rounded-lg"
                                onLoad={handleContentLoad}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Browser;
