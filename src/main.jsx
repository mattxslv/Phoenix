import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

/**
 * Custom modules
 */
import router from './routers/routes';

/**
 * Components
 */
import SnackbarProvider from './contexts/SnackbarContext';
import { PromptInputContext } from './contexts/PromptInputContext';

/**
 * CSS link
 */
import './index.css';

function MainApp() {
  const [promptInputValue, setPromptInputValue] = useState('');
  const promptInputRef = useRef(null);

  return (
    <SnackbarProvider>
      <PromptInputContext.Provider value={{ promptInputValue, setPromptInputValue, promptInputRef }}>
        <RouterProvider router={router} />
      </PromptInputContext.Provider>
    </SnackbarProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainApp />
  </StrictMode>,
);
