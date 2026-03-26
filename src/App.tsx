// src/App.tsx
import { RouterProvider } from 'react-router-dom';
import DbBootstrapper from '@src/db-bootstrapper.tsx';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorScreen from '@src/components/ErrorScreen.tsx';
import router from './Router.tsx';

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorScreen}>
      <DbBootstrapper>
        <RouterProvider router={router}/>
      </DbBootstrapper>
    </ErrorBoundary>
  );
}