import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import { App } from './App';

import * as Sentry from '@sentry/browser';
  
// ========================================

if (process.env.NODE_ENV === 'production') {
  Sentry.init({dsn: "https://b83ed38c06174168aec6b0a8be2563fe@sentry.io/1486840"});
}
  
ReactDOM.render(
  <App />,
  document.getElementById('root')
);
  