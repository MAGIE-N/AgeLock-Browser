declare module 'react-dom' {
  import * as React from 'react';
  
  function render(
    element: React.ReactElement,
    container: Element | DocumentFragment | null,
    callback?: () => void
  ): void;
  
  function hydrate(
    element: React.ReactElement,
    container: Element | DocumentFragment | null,
    callback?: () => void
  ): void;
  
  function createPortal(
    children: React.ReactNode,
    container: Element | DocumentFragment,
    key?: string
  ): React.ReactPortal;
  
  function unmountComponentAtNode(container: Element | DocumentFragment): boolean;
  
  function findDOMNode(
    component: React.ReactInstance | null | undefined
  ): Element | null | Text;
  
  const version: string;
  
  export {
    render,
    hydrate,
    createPortal,
    unmountComponentAtNode,
    findDOMNode,
    version
  };
  
  export default {
    render,
    hydrate,
    createPortal,
    unmountComponentAtNode,
    findDOMNode,
    version
  };
}
