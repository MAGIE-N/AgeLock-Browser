import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export = React;
export as namespace React;

declare module 'react' {
  export = React;
  export as namespace React;
}
