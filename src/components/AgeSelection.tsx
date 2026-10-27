import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AgeSelectionProps {
  onAgeRangeSelect: (range: 'children' | 'teenagers' | 'adults') => void;
}

const AgeSelection: React.FC<AgeSelectionProps> = ({ onAgeRangeSelect }) => {
  const [selectedRange, setSelectedRange] = useState<'children' | 'teenagers' | 'adults' | null>(null);
  const navigate = useNavigate();

  const handleAgeRangeSelect = () => {
    if (selectedRange) {
      // Simulate TPM binding
      console.log(`Binding to TPM for age range: ${selectedRange}`);
      
      // In a real implementation, we would call a native function to bind to TPM
      simulateTPMBinding(selectedRange).then(() => {
        onAgeRangeSelect(selectedRange);
        navigate('/browser');
      });
    }
  };

  // Simulate TPM binding process
  const simulateTPMBinding = async (ageRange: string): Promise<void> => {
    console.log(`Initializing TPM binding for age range: ${ageRange}`);
    
    // Simulate a delay for TPM binding
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('TPM binding successful');
        resolve();
      }, 1500);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">Welcome to AgeLock</h1>
        <p className="text-gray-700 mb-6 text-center">
          Please select your age range to customize your browsing experience with appropriate content filtering.
        </p>
        
        <div className="space-y-4 mb-8">
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedRange === 'children' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-300'
            }`}
            onClick={() => setSelectedRange('children')}
          >
            <h2 className="text-xl font-semibold mb-1">Children (5-12)</h2>
            <p className="text-sm text-gray-600">
              Safe browsing with strong content filtering and access to pre-approved educational sites.
            </p>
          </div>
          
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedRange === 'teenagers' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-300'
            }`}
            onClick={() => setSelectedRange('teenagers')}
          >
            <h2 className="text-xl font-semibold mb-1">Teenagers (13-17)</h2>
            <p className="text-sm text-gray-600">
              Moderate content filtering with access to more sites, while still blocking inappropriate content.
            </p>
          </div>
          
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedRange === 'adults' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-300'
            }`}
            onClick={() => setSelectedRange('adults')}
          >
            <h2 className="text-xl font-semibold mb-1">Adults (18+)</h2>
            <p className="text-sm text-gray-600">
              Minimal content filtering with full access to the web, while still blocking harmful content.
            </p>
          </div>
        </div>
        
        <button
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            selectedRange 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={handleAgeRangeSelect}
          disabled={!selectedRange}
        >
          Continue
        </button>
        
        <p className="mt-4 text-xs text-gray-500 text-center">
          AgeLock uses TPM 2.0/Secure Enclave-backed encryption to ensure your age selection cannot be tampered with.
          All content filtering is done on-device with no browsing history or telemetry collected.
        </p>
      </div>
    </div>
  );
};

export default AgeSelection;
