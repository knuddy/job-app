import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './main.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';

// Register PWA Service Worker
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (window.crossOriginIsolated || window.location.hostname === 'localhost') {
      window.sessionStorage.removeItem("attempted-isolation-reload");
      return;
    }

    const reload = (reason: string) => {
      if (window.sessionStorage.getItem("attempted-isolation-reload") !== reason) {
        window.sessionStorage.setItem("attempted-isolation-reload", reason);
        window.location.reload();
      } else {
        console.log(`Reload cancelled for duplicated reason ${reason}`);
      }
    };

    if (registration) {
      // If the worker is active but doesn't have control yet
      if (registration.active && !navigator.serviceWorker.controller) {
        reload("not-controlling");
      }

      // If a new worker is found, it will need a reload to take over
      registration.addEventListener("updatefound", () => reload("update-found"));
    }
  },
});


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);