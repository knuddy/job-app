import { setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './app.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import { RouterProvider } from 'react-router-dom';
import DbBootstrapper from '@src/db-bootstrapper.tsx';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorScreen from '@src/components/ErrorScreen.tsx';
import router from './Router.tsx';
import { IonApp } from '@ionic/react';

setupIonicReact({
  mode: 'md',
  animated: true
});

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

export default function App() {
  return (
    <IonApp>
      <ErrorBoundary FallbackComponent={ErrorScreen}>
        <DbBootstrapper>
          <RouterProvider router={router}/>
        </DbBootstrapper>
      </ErrorBoundary>
    </IonApp>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);