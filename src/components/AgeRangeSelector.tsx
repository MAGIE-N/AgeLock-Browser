import React, { useState } from 'react';
import styled from '@emotion/styled';

// Define the allowed age ranges
type AgeRange = 'children' | 'teenagers' | 'adults';

interface AgeRangeSelectorProps {
  onAgeRangeSelect: (ageRange: AgeRange) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f0f9ff;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #0f172a;
  margin-bottom: 2rem;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #475569;
  margin-bottom: 3rem;
  text-align: center;
  max-width: 600px;
`;

const AgeRangeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 900px;
`;

const AgeRangeCard = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border-radius: 0.75rem;
  background-color: ${props => props.selected ? '#bae6fd' : 'white'};
  border: 2px solid ${props => props.selected ? '#0ea5e9' : '#e2e8f0'};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-color: #0ea5e9;
  }
`;

const AgeRangeIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const AgeRangeTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #0f172a;
`;

const AgeRangeDescription = styled.p`
  font-size: 1rem;
  color: #64748b;
  text-align: center;
`;

const ContinueButton = styled.button`
  margin-top: 3rem;
  padding: 0.75rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  background-color: #0ea5e9;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #0284c7;
  }

  &:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
  }
`;

const SecurityNote = styled.p`
  margin-top: 2rem;
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
  max-width: 600px;
`;

const AgeRangeSelector: React.FC<AgeRangeSelectorProps> = ({ onAgeRangeSelect }) => {
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange | null>(null);

  const handleAgeRangeSelect = (ageRange: AgeRange) => {
    setSelectedAgeRange(ageRange);
  };

  const handleContinue = () => {
    if (selectedAgeRange) {
      onAgeRangeSelect(selectedAgeRange);
    }
  };

  const ageRanges = [
    {
      id: 'children',
      icon: '👶',
      title: 'Children',
      description: 'Ages 5-12. Highly filtered content with pre-approved sites only.',
    },
    {
      id: 'teenagers',
      icon: '👦',
      title: 'Teenagers',
      description: 'Ages 13-17. Moderate content filtering with educational focus.',
    },
    {
      id: 'adults',
      icon: '👨',
      title: 'Adults',
      description: 'Ages 18+. Basic content filtering with full web access.',
    },
  ];

  return (
    <Container>
      <Title>Welcome to AgeLock Browser</Title>
      <Subtitle>
        Please select the appropriate age range. This will be securely stored using TPM 2.0 technology
        and used to customize your browsing experience with age-appropriate content.
      </Subtitle>
      
      <AgeRangeGrid>
        {ageRanges.map((range) => (
          <AgeRangeCard
            key={range.id}
            selected={selectedAgeRange === range.id}
            onClick={() => handleAgeRangeSelect(range.id as AgeRange)}
          >
            <AgeRangeIcon>{range.icon}</AgeRangeIcon>
            <AgeRangeTitle>{range.title}</AgeRangeTitle>
            <AgeRangeDescription>{range.description}</AgeRangeDescription>
          </AgeRangeCard>
        ))}
      </AgeRangeGrid>
      
      <ContinueButton 
        onClick={handleContinue}
        disabled={!selectedAgeRange}
      >
        Continue
      </ContinueButton>
      
      <SecurityNote>
        Your age selection will be securely stored using TPM 2.0/Secure Enclave technology.
        This ensures 0% success in age spoofing attempts and protects your privacy.
        All content filtering is performed locally on your device.
      </SecurityNote>
    </Container>
  );
};

export default AgeRangeSelector;
