import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import AgeRangeSelector from './components/AgeRangeSelector';
import Browser from './components/Browser';
import ContentFilterService from './services/ContentFilterService';

declare global {
  interface Window {
    electron: {
      tpmService: {
        initialize: () => Promise<boolean>;
        storeAge: (ageRange: string) => Promise<boolean>;
        verifyAge: (ageRange: string) => Promise<boolean>;
        wipeSession: () => Promise<void>;
        getStoredAge: () => Promise<{ageRange: string | null}>;
      };
      contentFilter: {
        filterText: (text: string, ageRange: string) => Promise<{blocked: boolean, reason: string, explanation: string}>;
        filterImage: (imageUrl: string, ageRange: string) => Promise<{blocked: boolean, score: number, category: string}>;
      };
    };
  }
}

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f3f4f6;
`;

// Define the allowed age ranges
type AgeRange = 'children' | 'teenagers' | 'adults';

// Wrapper component to use hooks
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);

  // Initialize age range from TPM
  useEffect(() => {
    const initializeAge = async () => {
      try {
        console.log('Initializing TPM service...');
        // First initialize the TPM service
        const initialized = await window.electron.tpmService.initialize();
        if (initialized) {
          console.log('TPM service initialized successfully');
          // Try to get stored age from TPM
          const result = await window.electron.tpmService.getStoredAge();
          console.log('Retrieved stored age result:', result);
          if (result && result.ageRange) {
            // Type assertion to ensure it's a valid AgeRange
            const storedAgeRange = result.ageRange as AgeRange;
            console.log('Setting age range to:', storedAgeRange);
            setAgeRange(storedAgeRange);
            ContentFilterService.setAgeRange(storedAgeRange);
          } else {
            console.log('No age range stored, redirecting to selection screen');
            // If no age range is stored, navigate to the age selection screen
            if (window.location.pathname !== '/age-range') {
              navigate('/age-range');
            }
          }
        } else {
          console.warn('TPM initialization failed - running in fallback mode');
        }
      } catch (error) {
        console.error('Error initializing age:', error);
      }
    };
    initializeAge();
  }, [navigate]);

  const handleAgeRangeSelect = async (newRange: AgeRange) => {
    try {
      // Store the age range in TPM
      const success = await window.electron.tpmService.storeAge(newRange);
      if (success) {
        setAgeRange(newRange);
        ContentFilterService.setAgeRange(newRange);
        console.log(`Age range set to ${newRange} and securely stored in TPM`);
      } else {
        console.error('Failed to store age range in TPM');
      }
    } catch (error) {
      console.error('Error storing age range:', error);
    }
  };

  return (
    <AppContainer>
      <Routes>
        <Route path="/" element={!ageRange ? <AgeRangeSelector onAgeRangeSelect={handleAgeRangeSelect} /> : <Browser ageRange={ageRange} onAgeRangeChange={handleAgeRangeSelect} />} />
        <Route path="/browser" element={ageRange ? <Browser ageRange={ageRange} onAgeRangeChange={handleAgeRangeSelect} /> : <AgeRangeSelector onAgeRangeSelect={handleAgeRangeSelect} />} />
        <Route path="/age-range" element={<AgeRangeSelector onAgeRangeSelect={handleAgeRangeSelect} />} />
      </Routes>
    </AppContainer>
  );
};

// Main App component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;

// If the AgeRangeSelector component doesn't exist yet, create a simple one
if (typeof AgeRangeSelector === 'undefined') {
  const AgeRangeSelector = ({ onAgeRangeSelect }: { onAgeRangeSelect: (range: AgeRange) => void }) => {
    return (
      <div className="age-selector-container">
        <h1>Select Your Age Range</h1>
        <div className="age-options">
          <button onClick={() => onAgeRangeSelect('children')}>Children (5-12)</button>
          <button onClick={() => onAgeRangeSelect('teenagers')}>Teenagers (13-17)</button>
          <button onClick={() => onAgeRangeSelect('adults')}>Adults (18+)</button>
        </div>
      </div>
    );
  };
}