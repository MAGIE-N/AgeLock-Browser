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
