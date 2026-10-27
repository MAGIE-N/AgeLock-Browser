/// <reference types="react" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

declare module 'react-router-dom' {
  import { ComponentType, ReactNode } from 'react';

  export interface JSX {
    [elemName: string]: any;
  }

  export interface RouteProps {
    path?: string;
    exact?: boolean;
    element?: ReactNode;
    children?: ReactNode;
  }

  export interface RouteComponentProps<T = {}> {
    match: Match<T>;
    location: Location;
    history: History;
  }

  export interface Match<T = {}> {
    params: T;
    isExact: boolean;
    path: string;
    url: string;
  }

  export interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: any;
  }

  export interface History {
    length: number;
    action: string;
    location: Location;
    push: (path: string, state?: any) => void;
    replace: (path: string, state?: any) => void;
    go: (n: number) => void;
    goBack: () => void;
    goForward: () => void;
    block: (prompt?: string | boolean | ((location: Location) => string | boolean)) => void;
    listen: (listener: (location: Location, action: string) => void) => () => void;
  }

  export function useNavigate(): (path: string) => void;
  export function useLocation(): Location;
  export function useParams<T = {}>(): T;
  export function useHistory(): History;

  export interface BrowserRouterProps {
    basename?: string;
    forceRefresh?: boolean;
    getUserConfirmation?: (message: string, callback: (ok: boolean) => void) => void;
    keyLength?: number;
    children?: ReactNode;
  }

  export interface RoutesProps {
    children?: ReactNode;
  }

  export interface NavigateProps {
    to: string;
    replace?: boolean;
    state?: any;
  }

  export const BrowserRouter: React.FC<BrowserRouterProps>;
  export const Routes: React.FC<RoutesProps>;
  export const Route: React.FC<RouteProps>;
  export const Navigate: React.FC<NavigateProps>;
  export const Link: React.ComponentType<any>;
  export const NavLink: React.ComponentType<any>;
  export const Redirect: React.ComponentType<any>;
  export const withRouter: <P extends object>(
    component: React.ComponentType<P>
  ) => React.ComponentType<Omit<P, keyof RouteComponentProps>>;
}
