import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Initialize application with Event Streaming Service
 */
// import { eventStreamingService } from './services/event-streaming';

console.log('Initializing BigfootLive Event Streaming Service...');

// TODO: Use eventStreamingService for initialization
// const eventStreamService = eventStreamingService.getInstance();

// Example: start a new event automatically
// Uncomment to auto-start for demo purposes
// const exampleConfig = {
//   eventId: 'auto-demo-event-001',
//   eventName: 'Demo Event'
// };
// eventStreamService.startEvent(exampleConfig).then(response => {
//   console.log('Streaming event started:', response);
// }).catch(error => {
//   console.error('Failed to start event:', error);
// });
import { ErrorBoundary } from './components/ErrorBoundary'

console.log('BigfootLive: Starting app...');
console.log('Environment:', {
  API_URL: import.meta.env.VITE_API_URL,
  USE_MOCK: import.meta.env.VITE_USE_MOCK_API,
  COGNITO_POOL: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  MODE: import.meta.env.MODE
});

try {
  const root = document.getElementById('root');
  console.log('Root element:', root);
  
  if (!root) {
    throw new Error('Root element not found');
  }
  
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
  console.log('BigfootLive: App rendered successfully');
} catch (error) { void error;
  console.error('BigfootLive: Failed to start app:', error);
  document.body.innerHTML = `<div style="color: red; padding: 20px;">Failed to start app: ${error instanceof Error ? error.message : "Unknown error"}</div>`;
}