import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App.jsx'
import Lobby from './servers/Lobby.jsx'
import Room from './servers/Room.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App/>} />
        <Route path="/:serverName" element={<Lobby/>} />
        <Route path="/:nspName/:roomName" element={<Room/>} />
      </Routes>
    </Router>
  </React.StrictMode >,
)
