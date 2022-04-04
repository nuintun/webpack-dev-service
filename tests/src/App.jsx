import { memo } from 'react';

export default memo(function App() {
  const styles = {
    textAlign: 'center',
    lineHeight: '100vh'
  };

  return <div style={styles}>Hello React !</div>;
});
