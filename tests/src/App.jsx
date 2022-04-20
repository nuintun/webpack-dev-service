import './App.css';

import { memo } from 'react';

import logo from './logo.svg';

export default memo(function App() {
  return (
    <div className="main">
      <img className="logo" src={logo} alt="webpack" />
      <p className="text">hello koa-webpack-dev-server + react!</p>
    </div>
  );
});
