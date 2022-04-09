import { memo } from 'react';

import { on } from '../../client';

on('ok', (message, options) => {
  console.log(message, options);
});

export default memo(function App() {
  const styles = {
    textAlign: 'center',
    lineHeight: '100vh'
  };

  return <div style={styles}>Hello React !</div>;
});
