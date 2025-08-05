import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('TEST: Script loaded');

try {
  const root = document.getElementById('root');
  console.log('TEST: Root element:', root);
  
  if (root) {
    ReactDOM.createRoot(root).render(
      <div style={{ background: 'green', color: 'white', padding: '50px', fontSize: '24px' }}>
        <h1>BigfootLive Test - React is Working!</h1>
        <p>If you see this, React loaded successfully.</p>
      </div>
    );
    console.log('TEST: React render completed');
  } else {
    console.error('TEST: No root element found');
  }
} catch (error) { void error;
  console.error('TEST: Error rendering:', error);
  document.body.innerHTML = `<h1 style="color: red;">Error: ${error instanceof Error ? error.message : "Unknown error"}</h1>`;
}