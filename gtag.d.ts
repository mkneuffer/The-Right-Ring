// Minimal GA4 type declarations for window.gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      params?: Record<string, unknown>
    ) => void;
  }
}

export {};
