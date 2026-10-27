interface WebViewElement extends HTMLElement {
  // Add the webview methods that we use
  loadURL(url: string): void;
  reload(): void;
  canGoBack(): boolean;
  goBack(): void;
  canGoForward(): boolean;
  goForward(): void;
  getURL(): string;
  
  // Event listeners
  addEventListener(
    event: 'did-navigate',
    listener: (event: { url: string }) => void
  ): void;
  addEventListener(
    event: 'did-start-loading',
    listener: () => void
  ): void;
  addEventListener(
    event: 'did-stop-loading',
    listener: () => void
  ): void;
}

declare namespace JSX {
  interface IntrinsicElements {
    'webview': React.DetailedHTMLProps<
      React.WebViewHTMLAttributes<WebViewElement> & {
        src: string;
        onDidNavigate?: (event: { url: string }) => void;
        onDidStartLoading?: () => void;
        onDidStopLoading?: () => void;
      },
      WebViewElement
    >;
  }
}
