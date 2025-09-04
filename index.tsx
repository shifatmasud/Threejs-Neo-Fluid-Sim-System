
import React from 'react';
import ReactDOM from 'react-dom/client';
import MergedFluidSimulation from './Flattened/NewComponent';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MergedFluidSimulation />
  </React.StrictMode>
);
