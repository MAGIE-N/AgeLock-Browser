import React from 'react';
import styled from '@emotion/styled';

const AgeRangeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #1976d2, #2196f3);
`;

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 2rem;
  max-width: 42rem;
  width: 100%;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  text-align: center;
  color: #1976d2;
  margin-bottom: 2rem;
`;

const AgeRangeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const AgeRangeButton = styled.button`
  padding: 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
  text-align: center;
  background: ${props => getBackgroundColor(props.range)};
  border: 2px solid ${props => getBorderColor(props.range)};
  color: ${props => getTextColor(props.range)};

  &:hover {
    transform: translateY(-0.25rem);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ButtonTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ButtonDescription = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const FeatureList = styled.ul`
  text-align: left;
  list-style-type: disc;
  padding-left: 1rem;
  font-size: 0.875rem;
`;

const getBackgroundColor = (range) => {
  switch (range) {
    case '5-12': return '#E8F5E9';
    case '13-17': return '#FFF3E0';
    case '18+': return '#E3F2FD';
    default: return '#E3F2FD';
  }
};

const getBorderColor = (range) => {
  switch (range) {
    case '5-12': return '#81C784';
    case '13-17': return '#FFB74D';
    case '18+': return '#64B5F6';
    default: return '#64B5F6';
  }
};

const getTextColor = (range) => {
  switch (range) {
    case '5-12': return '#1B5E20';
    case '13-17': return '#E65100';
    case '18+': return '#0D47A1';
    default: return '#0D47A1';
  }
};

const ageRanges = [
  {
    range: '5-12',
    title: 'Kids',
    description: 'Safe browsing with educational content',
    features: ['Educational websites', 'Strict content filtering', 'Parent-approved sites only']
  },
  {
    range: '13-17',
    title: 'Teens',
    description: 'Balanced access with safety features',
    features: ['Moderate content filtering', 'Educational priority', 'Limited social media']
  },
  {
    range: '18+',
    title: 'Adults',
    description: 'Full access with content awareness',
    features: ['Basic safety filters', 'All appropriate content', 'Privacy protection']
  }
];

const AgeRangeSelection = ({ onAgeRangeSelect }) => {
  const handleSelection = (range) => {
    onAgeRangeSelect(range);
  };

  return (
    <AgeRangeContainer>
      <Card>
        <Title>Select Your Age Range</Title>
        <AgeRangeGrid>
          {ageRanges.map(({ range, title, description, features }) => (
            <AgeRangeButton
              key={range}
              range={range}
              onClick={() => handleSelection(range)}
            >
              <ButtonTitle>{title}</ButtonTitle>
              <ButtonDescription>{description}</ButtonDescription>
              <FeatureList>
                {features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </FeatureList>
            </AgeRangeButton>
          ))}
        </AgeRangeGrid>
      </Card>
    </AgeRangeContainer>
  );
};

export default AgeRangeSelection; 