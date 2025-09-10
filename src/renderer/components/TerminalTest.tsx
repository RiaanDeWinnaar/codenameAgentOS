import React from 'react';
import './Terminal.css';

interface TerminalProps {
  className?: string;
  onTerminalReady?: (terminalApi: any) => void;
}

const TerminalComponent: React.FC<TerminalProps> = ({ className, onTerminalReady }) => {
  return (
    <div className={`terminal-wrapper ${className}`}>
      <div className="terminal-container">
        <p>Terminal Component - Test</p>
      </div>
    </div>
  );
};

export default TerminalComponent;
