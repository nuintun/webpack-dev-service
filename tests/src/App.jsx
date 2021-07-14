import ReactDom from 'react-dom';

function App() {
  const styles = {
    textAlign: 'center',
    lineHeight: '100vh'
  };

  return <div style={styles}>Hello React !</div>;
}

module.hot && module.hot.accept();

ReactDom.render(<App />, document.getElementById('app'));
