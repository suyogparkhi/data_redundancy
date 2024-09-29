import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require('electron');

export default function App() {
  const [sourceFolder, setSourceFolder] = useState('');
  const [targetFolder, setTargetFolder] = useState('');
  const [result, setResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setResult('');
    ipcRenderer.send('scan-folders', { sourceFolder, targetFolder });
  };

  const handleOpenFolder = (folderType) => {
    ipcRenderer.send('open-folder', folderType);
  };

  useEffect(() => {
    ipcRenderer.on('scan-result', (event, data) => {
      setResult(data);
      setIsScanning(false);
    });

    ipcRenderer.on('scan-error', (event, error) => {
      setResult(`Error: ${error}`);
      setIsScanning(false);
    });

    ipcRenderer.on('folder-selected', (event, { folderType, path }) => {
      if (folderType === 'source') {
        setSourceFolder(path);
      } else if (folderType === 'target') {
        setTargetFolder(path);
      }
    });

    return () => {
      ipcRenderer.removeAllListeners('scan-result');
      ipcRenderer.removeAllListeners('scan-error');
      ipcRenderer.removeAllListeners('folder-selected');
    };
  }, []);

  return (
    <div className="container">
      <h1 className="title">Data Redundancy Remover</h1>
      <div className="form-group">
        <label htmlFor="sourceFolder">Source Folder</label>
        <div className="input-group">
          <input
            type="text"
            id="sourceFolder"
            value={sourceFolder}
            onChange={(e) => setSourceFolder(e.target.value)}
            placeholder="Enter source folder path"
          />
          <button onClick={() => handleOpenFolder('source')}>Open</button>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="targetFolder">Target Folder</label>
        <div className="input-group">
          <input
            type="text"
            id="targetFolder"
            value={targetFolder}
            onChange={(e) => setTargetFolder(e.target.value)}
            placeholder="Enter target folder path"
          />
          <button onClick={() => handleOpenFolder('target')}>Open</button>
        </div>
      </div>
      <button 
        className="scan-button" 
        onClick={handleScan} 
        disabled={isScanning || !sourceFolder || !targetFolder}
      >
        {isScanning ? 'Scanning...' : 'Scan for Redundancies'}
      </button>
      {result && (
        <div className="result">
          <h3>Scan Results:</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}