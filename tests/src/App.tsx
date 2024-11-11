import styles from './css/App.module.css';

import { memo } from 'react';

import logo from './images/react.svg';
import github from './videos/github.mp4';

export default memo(function App() {
  return (
    <div className={styles.main}>
      <img className={styles.logo} src={logo} alt="webpack" />
      <p className={styles.text}>hello webpack-dev-service + react!aa</p>
      <video muted controls autoPlay className={styles.video}>
        <source src={github} type="video/mp4" />
      </video>
    </div>
  );
});
