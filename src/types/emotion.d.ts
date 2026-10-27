/// <reference types="react" />

declare module '@emotion/styled' {
  import { CreateStyled } from '@emotion/styled/types';
  const styled: CreateStyled;
  export default styled;
}

declare module '@emotion/react' {
  import { EmotionCache } from '@emotion/cache';
  export const CacheProvider: React.FC<{ value: EmotionCache; children: React.ReactNode }>;
  export const ThemeProvider: React.FC<{ theme: any; children: React.ReactNode }>;
  export const css: any;
  export const Global: any;
  export const keyframes: any;
}

declare module '@emotion/react' {
  export interface JSX {
    [elemName: string]: any;
  }
}

declare module '@emotion/styled' {
  export interface JSX {
    [elemName: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export interface JSX {
    [elemName: string]: any;
  }
}
