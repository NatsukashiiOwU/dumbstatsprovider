import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ReactQueryDevtools } from 'react-query-devtools';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import 'normalize.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
      <BrowserRouter>
        <App />
        <ReactQueryDevtools initialIsOpen={false} /> {/* Or set to true to open by default */}
      </BrowserRouter>
  </React.StrictMode>
)
