import React from 'react';
import ReactDom from 'react-dom';

function App() {
  return 'Hello React !';
}

ReactDom.render(<App />, document.getElementById('app'));
