import { onCLS, onINP, onLCP, onTTFB, onFCP, Metric } from 'web-vitals';
import { api } from './lib/api';

let isInitialized = false;

declare global {
  interface Window {
    gtag?: (command: string, target: string, params?: Record<string, any>) => void;
  }
}

export interface PerformanceMetric extends Metric {
  page: string;
  pathname: string;
  userAgent: string;
  timestamp: number;
  url: string;
}

// Send to Google Analytics 4
export const sendToGA4 = (metric: Metric) => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId || !window.gtag) return;

  window.gtag('event', 'web_vitals', {
    event_category: 'Web Vitals',
    event_label: metric.name,
    value: Math.round(metric.value),
    non_interaction: true,
    page_path: window.location.pathname,
  });
};

// Send to Backend (with safe error handling)
export const sendToBackend = async (metric: Metric) => {
  try {
    const payload: PerformanceMetric = {
      ...metric,
      page: document.title,
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      url: window.location.href,
    };

    await api('/api/performance', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,           // Important for sending before page unload
    });
  } catch (err) {
    // Silent fail in development or if backend is down
    if (import.meta.env.DEV) {
      console.debug('Performance metric send failed (expected in dev):', err);
    }
  }
};

// Main function
export function reportWebVitals() {
  if (isInitialized) return;
  isInitialized = true;

  const handler = (metric: Metric) => {
    const value = Math.round(metric.value);
    const color = 
      metric.rating === 'good' ? '#22c55e' : 
      metric.rating === 'needs-improvement' ? '#eab308' : '#ef4444';

    console.groupCollapsed(`%c[Performance] ${metric.name}: ${value}ms`, 
      `color: ${color}; font-weight: bold; font-size: 12px;`);
    console.log(metric);
    console.groupEnd();

    // Send to analytics
    sendToGA4(metric);

    // Send to backend (non-blocking)
    sendToBackend(metric);
  };

  // Register all metrics
  onCLS(handler);
  onINP(handler);
  onLCP(handler);
  onTTFB(handler);
  onFCP(handler);
}