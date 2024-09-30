import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <Routes>
        {/* Маршрут главной страницы */}
        {/* Маршрут для WebSocket страницы */}
        <Route path="/websocket" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
