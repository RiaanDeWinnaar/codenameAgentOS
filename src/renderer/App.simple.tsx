import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className='app'>
      <header className='app-header'>
        <h1>YOLO-Browser Test</h1>
      </header>
      
      <main className='app-main'>
        <div className='status-panel'>
          <h2>System Status</h2>
          <p>Basic React app rendering test</p>
        </div>
      </main>
      
      <footer className='app-footer'>
        <p>YOLO-Browser - Test Mode</p>
      </footer>
    </div>
  );
};

export default App;
