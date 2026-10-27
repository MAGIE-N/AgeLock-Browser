/// <reference types="react" />

declare module 'react' {
  export interface FC<P = {}> {
    (props: P): React.ReactElement | null;
  }

  export type ReactElement = any;
  export type ReactNode = ReactElement | string | number | boolean | null | undefined;

  export function createElement(
    type: any,
    props?: any,
    ...children: ReactNode[]
  ): ReactElement;

  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useRef<T>(initialValue: T): { current: T };
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  
  export interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: T & EventTarget;
  }
  
  export interface SyntheticEvent<T = Element> {
    currentTarget: T;
    target: EventTarget;
    preventDefault(): void;
    stopPropagation(): void;
  }
  
  export const Fragment: React.FC<{ children?: ReactNode }>;
  
  export const StrictMode: React.FC<{ children?: ReactNode }>;
}
