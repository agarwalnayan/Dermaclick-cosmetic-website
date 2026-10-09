import React from 'react'; import { createRoot } from 'react-dom/client'; import { BrowserRouter } from 'react-router-dom';
import App from './App'; import { initAnalytics } from './utils/analytics'; import './styles.css';
initAnalytics();
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><App /></BrowserRouter></React.StrictMode>);
