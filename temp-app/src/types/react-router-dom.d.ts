declare module 'react-router-dom' {
  import * as React from 'react';

  export interface NavigateFunction {
    (to: string, options?: { replace?: boolean; state?: any }): void;
    (delta: number): void;
  }

  export function useNavigate(): NavigateFunction;
  export function BrowserRouter(props: { children?: React.ReactNode }): JSX.Element;
  export function Routes(props: { children?: React.ReactNode }): JSX.Element;
  export function Route(props: { path: string; element: React.ReactNode }): JSX.Element;
  export function Link(props: { to: string; children?: React.ReactNode }): JSX.Element;
}
