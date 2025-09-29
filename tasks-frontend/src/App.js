import logo from './logo.svg';
import './App.css';
import React from 'react';
import TaskList from './components/TaskList';
import CSVUpload from './components/CSVUpload';

function App() {
  return (
    <div className="App">
      <TaskList />
      <hr />
      <CSVUpload />
    </div>
  );
}

export default App;