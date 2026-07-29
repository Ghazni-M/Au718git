import { onCLS, onINP, onLCP, onTTFB, onFCP, Metric } from 'web-vitals';
import {api} from './lib/api'

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

// Safe GA4
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

// Safe Backend Call
export const sendToBackend = async (metric: Metric) => {
  try {
    const response = await api('/api/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true,
    });
    // Don't throw on 4xx/5xx for performance metrics
    if (!response.ok) console.warn('Performance API returned non-OK status');
  } catch (err) {
    // Silent fail - backend might not be running yet
    console.debug('Performance metric send failed (normal in dev)');
  }
};

export function reportWebVitals() {
  if (isInitialized) return;
  isInitialized = true;

  const handler = (metric: Metric) => {
    const value = Math.round(metric.value);

    console.groupCollapsed(`%c[Performance] ${metric.name}: ${value}ms`, 
      `color: ${metric.rating === 'good' ? '#22c55e' : metric.rating === 'needs-improvement' ? '#eab308' : '#ef4444'}; font-weight: bold`);
    console.log(metric);
    console.groupEnd();

    sendToGA4(metric);
    sendToBackend(metric);   // Safe now
  };

  onCLS(handler);
  onINP(handler);
  onLCP(handler);
  onTTFB(handler);
  onFCP(handler);
}