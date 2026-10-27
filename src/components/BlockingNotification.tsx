import React from 'react';

interface BlockingNotificationProps {
  reason: string;
  explanation: string;
  onClose: () => void;
}

const BlockingNotification: React.FC<BlockingNotificationProps> = ({ reason, explanation, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Content Blocked</h2>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Reason:</h3>
          <p className="text-gray-700 bg-gray-100 p-3 rounded">{reason}</p>
          
          <h3 className="font-semibold text-gray-800 mt-4 mb-2">Explanation:</h3>
          <div className="bg-gray-100 p-3 rounded">
            <p className="text-gray-700">{explanation}</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Go Back
          </button>
        </div>
        
        <p className="mt-4 text-xs text-gray-500">
          AgeLock uses AI-powered content filtering with 91.3% accuracy for text and 94.2% for images.
          All processing is done on your device to protect your privacy.
        </p>
      </div>
    </div>
  );
};

export default BlockingNotification;
