import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import SightingPage from './pages/SightingPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import MatchesPage from './pages/MatchesPage';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">🔍 FindMe AI</NavLink>
      <ul className="navbar-links">
        <li><NavLink to="/">Басты бет</NavLink></li>
        <li><NavLink to="/cases">Кейстер</NavLink></li>
        <li><NavLink to="/report">Хабарлау</NavLink></li>
        <li><NavLink to="/sighting">Байқалды</NavLink></li>
        <li><NavLink to="/matches">Сәйкестіктер</NavLink></li>
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/sighting" element={<SightingPage />} />
        <Route path="/matches" element={<MatchesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
