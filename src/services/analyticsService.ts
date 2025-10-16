export type AnalyticsEvent = {
  name: string;
  payload?: Record<string, any>;
  timestamp?: string;
};

export const analyticsService = {
  track(name: string, payload: Record<string, any> = {}) {
    const event: AnalyticsEvent = { name, payload, timestamp: new Date().toISOString() };
    try {
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({ event: name, ...payload });
      }
    } catch {}
    console.log("[analytics]", event);
    return event;
  }
};
