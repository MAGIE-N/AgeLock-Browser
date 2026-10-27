import React, { useState } from 'react';
import styled from '@emotion/styled';

const VerificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #1976d2, #2196f3);
  color: white;
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  color: #333;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1976d2;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  &:disabled {
    background: #ccc;
  }
  &:hover:not(:disabled) {
    background: #1976d2;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  margin-bottom: 1rem;
  text-align: center;
`;

const AgeVerification = ({ onVerified }) => {
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 5 || ageNum > 100) {
        throw new Error('Please enter a valid age between 5 and 100');
      }

      const result = await window.ageLock.verifyAge({
        age: ageNum,
        timestamp: Date.now()
      });

      if (result.success) {
        onVerified(ageNum);
      } else {
        setError(result.error || 'Age verification failed');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <VerificationContainer>
      <Form onSubmit={handleSubmit}>
        <Title>Age Verification</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="number"
          min="5"
          max="100"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Enter your age"
          required
        />
        <Button type="submit" disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Verify Age'}
        </Button>
      </Form>
    </VerificationContainer>
  );
};

export default AgeVerification; 