import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import './i18n';
import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from './components/ui/sonner.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <LanguageProvider>
      <App />
      <Toaster />
    </LanguageProvider>
   </ErrorBoundary>
)
