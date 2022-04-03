import { createRoot } from 'react-dom/client';

function App() {
  const styles = {
    textAlign: 'center',
    lineHeight: '100vh'
  };

  return <div style={styles}>Hello React !</div>;
}

const root = (() => {
  if (!window.__REACT_ROOT__) {
    window.__REACT_ROOT__ = createRoot(document.getElementById('app'));
  }

  return window.__REACT_ROOT__;
})();

root.render(<App />);

module.hot && module.hot.accept();
