/// <reference types="react" />

import React from 'react';

// Declare the JSX namespace for React
namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Declare the JSX namespace for Emotion
declare module '@emotion/react' {
  export interface JSX {
    [elemName: string]: any;
  }
}

// Declare the JSX namespace for React DOM
declare module 'react/jsx-runtime' {
  export interface JSX {
    [elemName: string]: any;
  }
}

// Declare the JSX namespace for React DOM server
declare module 'react-dom/server' {
  export interface JSX {
    [elemName: string]: any;
  }
}

// Declare the JSX namespace for React DOM client
declare module 'react-dom/client' {
  export interface JSX {
    [elemName: string]: any;
  }
}
