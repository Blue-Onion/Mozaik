import helmet from 'helmet';

/**
 * Helmet security middleware configuration
 * Sets various HTTP headers to help protect your app from well-known web vulnerabilities
 */
const helmetMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Set to false for development, enable in production if needed
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // DNS Prefetch Control
  dnsPrefetchControl: true,
  // Expect CT
  expectCt: false, // Can be configured if needed
  // Frameguard (prevents clickjacking)
  frameguard: { action: 'deny' },
  // Hide Powered-By header
  hidePoweredBy: true,
  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  // IE No Open
  ieNoOpen: true,
  // Don't Sniff Mimetype
  noSniff: true,
  // Origin Agent Cluster
  originAgentCluster: true,
  // Permissions Policy
  permissionsPolicy: {
    features: {
      accelerometer: [],
      ambientLightSensor: [],
      autoplay: [],
      battery: [],
      camera: [],
      crossOriginIsolated: [],
      displayCapture: [],
      documentDomain: [],
      encryptedMedia: [],
      executionWhileNotRendered: [],
      executionWhileOutOfViewport: [],
      fullscreen: [],
      geolocation: [],
      gyroscope: [],
      keyboardMap: [],
      magnetometer: [],
      microphone: [],
      midi: [],
      navigationOverride: [],
      payment: [],
      pictureInPicture: [],
      publickeyCredentials: [],
      screenWakeLock: [],
      syncXhr: [],
      usb: [],
      webShare: [],
      xrSpatialTracking: [],
    },
  },
  // Referrer Policy
  referrerPolicy: { policy: 'no-referrer' },
  // XSS Filter
  xssFilter: true,
});

export default helmetMiddleware;


