// @ts-ignore
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
// @ts-ignore
import styled from '@emotion/styled';
import AgeRangeSelector from './components/AgeRangeSelector';
import Browser from './components/Browser';
import ContentFilterService from './services/ContentFilterService';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f3f4f6;
`;

const AppContent = () => {
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Redirect to browser if age range is set
  useEffect(() => {
    if (ageRange) {
      navigate('/browser');
    } else {
      navigate('/');
    }
  }, [ageRange, navigate]);

  // Initialize age range from TPM
  useEffect(() => {
    const initializeAge = async () => {
      try {
        const result = await window.electron.getStoredAge();
        if (result?.ageRange) {
          setAgeRange(result.ageRange);
          ContentFilterService.setAgeRange(result.ageRange);
        } else {
          setAgeRange(null);
        }
      } catch (error) {
        console.error('Error initializing age:', error);
        setAgeRange(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAge();
  }, []);

  const handleAgeRangeSelect = (newRange: string) => {
    setAgeRange(newRange);
    ContentFilterService.setAgeRange(newRange);
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  return (
    <AppContainer>
      <Routes>
        <Route 
          path="/" 
          element={
            <AgeRangeSelector onAgeRangeSelect={handleAgeRangeSelect} />
          } 
        />
        <Route 
          path="/browser" 
          element={
            <Browser />
          } 
        />
        <Route 
          path="/age-range" 
          element={
            <AgeRangeSelector onAgeRangeSelect={handleAgeRangeSelect} />
          } 
        />
      </Routes>
    </AppContainer>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;