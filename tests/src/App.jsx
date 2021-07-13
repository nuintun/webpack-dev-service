import ReactDom from 'react-dom';

function App() {
  return 'Hello React !';
}

module.hot && module.hot.accept();

ReactDom.render(<App />, document.getElementById('app'));
