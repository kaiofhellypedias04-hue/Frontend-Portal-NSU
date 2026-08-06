import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './app/router';
import { queryClient } from './app/query-client';
import { OperatorProvider } from './hooks/useOperator';
import './styles.css';
import { AppErrorBoundary } from './components/ui/AppErrorBoundary';
import { AuthProvider } from './hooks/useAuth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary><QueryClientProvider client={queryClient}>
      <AuthProvider><OperatorProvider>
        <RouterProvider router={router} />
      </OperatorProvider></AuthProvider>
    </QueryClientProvider></AppErrorBoundary>
  </React.StrictMode>,
);
