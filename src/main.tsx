import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { BrowserRouter } from 'react-router-dom'
import 'normalize.css';
import { globalStyles } from './styles/global.css.js';

// Set basename based on environment
const basename = import.meta.env.MODE === 'production' ? '/dumbstatsprovider' : '/';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
);
