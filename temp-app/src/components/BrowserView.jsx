import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${props => props.theme.background};
`;

const NavigationBar = styled.div`
  display: flex;
  padding: 10px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  gap: 10px;
  border-bottom: 3px solid ${props => props.theme.primary};
`;

const AddressBar = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid ${props => props.theme.secondary};
  border-radius: 4px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background: #ccc;
  }
  &:hover:not(:disabled) {
    background: ${props => props.theme.secondary};
  }
`;

const WebViewContainer = styled.div`
  flex: 1;
  position: relative;
  background: white;
`;

const BlockedContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  border: 2px solid ${props => props.theme.primary};
  color: ${props => props.theme.text};
`;

const AgeIndicator = styled.div`
  position: fixed;
  bottom: 16px;
  right: 16px;
  padding: 8px 16px;
  background: ${props => props.theme.primary};
  color: white;
  border-radius: 20px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const getAgeRangeSettings = (ageRange) => {
  switch (ageRange) {
    case '5-12':
      return {
        searchPlaceholder: 'What would you like to learn about?',
        defaultHomepage: 'https://www.kiddle.co/',
        contentFiltering: 'strict'
      };
    case '13-17':
      return {
        searchPlaceholder: 'Search with safe browsing enabled',
        defaultHomepage: 'https://www.brainpop.com/',
        contentFiltering: 'moderate'
      };
    case '18+':
      return {
        searchPlaceholder: 'Enter URL or search',
        defaultHomepage: 'https://www.google.com',
        contentFiltering: 'basic'
      };
    default:
      return {
        searchPlaceholder: 'Enter URL or search',
        defaultHomepage: 'https://www.google.com',
        contentFiltering: 'basic'
      };
  }
};

const BrowserView = ({ ageRange, theme }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [blockedInfo, setBlockedInfo] = useState(null);
  const webviewRef = useRef(null);
  const settings = getAgeRangeSettings(ageRange);

  useEffect(() => {
    window.ageLock.onBlockedContent((data) => {
      setBlockedInfo(data);
    });

    if (webviewRef.current) {
      webviewRef.current.src = settings.defaultHomepage;
    }

    return () => {
      window.ageLock.removeBlockedContentListener();
    };
  }, [settings.defaultHomepage]);

  const handleNavigate = async () => {
    if (!url) return;

    setIsLoading(true);
    try {
      webviewRef.current.src = url.startsWith('http') ? url : `https://${url}`;
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BrowserContainer theme={theme}>
      <NavigationBar theme={theme}>
        <Button
          theme={theme}
          onClick={() => webviewRef.current?.goBack()}
          disabled={!webviewRef.current?.canGoBack()}
        >
          ←
        </Button>
        <Button
          theme={theme}
          onClick={() => webviewRef.current?.goForward()}
          disabled={!webviewRef.current?.canGoForward()}
        >
          →
        </Button>
        <Button
          theme={theme}
          onClick={() => webviewRef.current?.reload()}
          disabled={isLoading}
        >
          ↻
        </Button>
        <AddressBar
          theme={theme}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
          placeholder={settings.searchPlaceholder}
        />
        <Button theme={theme} onClick={handleNavigate} disabled={isLoading}>
          Go
        </Button>
      </NavigationBar>

      <WebViewContainer>
        <webview
          ref={webviewRef}
          src={settings.defaultHomepage}
          style={{ width: '100%', height: '100%' }}
        />
        {blockedInfo && (
          <BlockedContent theme={theme}>
            <h3>Content Blocked</h3>
            <p>{blockedInfo.reason}</p>
            <Button theme={theme} onClick={() => setBlockedInfo(null)}>
              Close
            </Button>
          </BlockedContent>
        )}
      </WebViewContainer>

      <AgeIndicator theme={theme}>
        Age Range: {ageRange}
      </AgeIndicator>
    </BrowserContainer>
  );
};

export default BrowserView; 