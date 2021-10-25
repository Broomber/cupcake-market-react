import React from 'react';
import './App.css';
import CurrencyTable from './components/CurrencyTable';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <CurrencyTable />
      </div>
    );
  }
}

export default App;
