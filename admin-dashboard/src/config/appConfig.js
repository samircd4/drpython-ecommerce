const normalizeUrl = (value, fallback) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (!trimmed) return fallback;
    return trimmed.replace(/\/$/, '');
};

const getEnvValue = (key, fallback = '') => {
    const value = import.meta.env?.[key];
    return typeof value === 'string' ? value : fallback;
};

export const appConfig = {
    apiBaseUrl: normalizeUrl(getEnvValue('VITE_API_BASE_URL', 'http://localhost:8000'), 'http://localhost:8000'),
    wsUrl: normalizeUrl(getEnvValue('VITE_WS_URL', 'ws://localhost:8001/ws'), 'ws://localhost:8001/ws'),
    trackingWsUrl: normalizeUrl(getEnvValue('VITE_TRACKING_WS_URL', 'ws://localhost:8001/ws/live-insights/'), 'ws://localhost:8001/ws/live-insights/'),
    frontendUrl: normalizeUrl(getEnvValue('VITE_FRONTEND_URL', 'http://localhost:5173'), 'http://localhost:5173'),
    googleClientId: getEnvValue('VITE_GOOGLE_CLIENT_ID', ''),
};



export const getDefaultEmailDomain = () => {
    try {
        return new URL(appConfig.frontendUrl).hostname || 'example.com';
    } catch {
        return 'example.com';
    }
};
