import styles from './App.module.css';

import { memo } from 'react';

import logo from './logo.svg';

export default memo(function App() {
  return (
    <div className={styles.main}>
      <img className={styles.logo} src={logo} alt="webpack" />
      <p className={styles.text}>hello koa-webpack-dev-server + react!</p>
    </div>
  );
});
