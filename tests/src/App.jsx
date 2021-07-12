import React from 'react';
import ReactDom from 'react-dom';

function App() {
  React.useEffect(() => {
    const onMessage = message => {
      const { action, payload } = message.data || {};

      if (/^webpack-hot-/.test(action)) {
        console.log('%s: %o', action, payload);
      }
    };

    window.addEventListener('message', onMessage, false);

    return () => {
      window.removeEventListener('message', onMessage, false);
    };
  });

  return 'Hello React !';
}

module.hot && module.hot.accept();

ReactDom.render(<App />, document.getElementById('app'));
