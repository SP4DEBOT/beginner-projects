import React, { useState, useEffect } from 'react';
import { Leaf, BarChart2, Shield, Sparkles, Award, Clipboard } from 'lucide-react';
import { loadState, saveState, addHistoryEntry } from './utils/storage';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Sandbox from './components/Sandbox';
import ActionHub from './components/ActionHub';
import Offsets from './components/Offsets';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appState, setAppState] = useState(null);

  useEffect(() => {
    const loaded = loadState();
    setAppState(loaded);
  }, []);

  if (!appState) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0a0510', color: 'var(--text-secondary)' }}>
        <div className="flex-col" style={{ alignItems: 'center', gap: '1rem' }}>
          <Leaf className="glowing-sun" size={40} style={{ color: 'var(--accent-mint)' }} />
          <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>LOADING ECO-OASIS...</p>
        </div>
      </div>
    );
  }

  const handleCalculate = (newInputs, newFootprint) => {
    const updatedState = addHistoryEntry(appState, newInputs, newFootprint);
    
    let xpGain = 100;
    let newXp = updatedState.xp + xpGain;
    let newLevel = updatedState.level;
    const xpThreshold = newLevel * 200;
    
    if (newXp >= xpThreshold) {
      newXp -= xpThreshold;
      newLevel += 1;
    }

    const stateWithXp = {
      ...updatedState,
      xp: newXp,
      level: newLevel
    };

    setAppState(stateWithXp);
    saveState(stateWithXp);
  };

  const handleToggleCommitment = (actionId) => {
    const isAlreadyCommitted = appState.commitments.includes(actionId);
    let updatedCommitments;

    if (isAlreadyCommitted) {
      updatedCommitments = appState.commitments.filter(id => id !== actionId);
    } else {
      updatedCommitments = [...appState.commitments, actionId];
    }

    let xpGain = isAlreadyCommitted ? -50 : 75;
    let newXp = Math.max(0, appState.xp + xpGain);
    let newLevel = appState.level;
    const xpThreshold = newLevel * 200;

    if (newXp >= xpThreshold) {
      newXp -= xpThreshold;
      newLevel += 1;
    }

    const updatedState = {
      ...appState,
      commitments: updatedCommitments,
      xp: newXp,
      level: newLevel
    };

    setAppState(updatedState);
    saveState(updatedState);
  };

  const handleUpdateState = (updatedState) => {
    setAppState(updatedState);
    saveState(updatedState);
  };

  return (
    <div className="app-container">
      <header className="glass-panel p-2" style={{ padding: '0.75rem 1.5rem', marginBottom: '2rem' }}>
        <div className="logo" onClick={() => setActiveTab('dashboard')}>
          <Leaf size={28} style={{ transform: 'rotate(-10deg)' }} />
          <span>EcoOasis</span>
        </div>

        <nav className="nav-tabs">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <BarChart2 size={16} /> },
            { id: 'calculator', name: 'Calculator', icon: <Clipboard size={16} /> },
            { id: 'sandbox', name: 'What-If Sandbox', icon: <Sparkles size={16} /> },
            { id: 'actions', name: 'Action Hub', icon: <Leaf size={16} /> },
            { id: 'offsets', name: 'Offsets', icon: <Award size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span className="tab-text">{tab.name}</span>
            </button>
          ))}
        </nav>
      </header>

      <main style={{ minHeight: '60vh' }}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            state={appState} 
            onNavigate={setActiveTab} 
            onUpdateState={handleUpdateState}
          />
        )}
        {activeTab === 'calculator' && (
          <Calculator 
            currentInputs={appState.inputs} 
            onCalculate={handleCalculate} 
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'sandbox' && (
          <Sandbox 
            currentInputs={appState.inputs} 
            actualFootprint={appState.footprint} 
          />
        )}
        {activeTab === 'actions' && (
          <ActionHub 
            commitments={appState.commitments} 
            onToggleCommitment={handleToggleCommitment} 
          />
        )}
        {activeTab === 'offsets' && (
          <Offsets 
            state={appState} 
          />
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-light)', marginTop: '4rem', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>© {new Date().getFullYear()} EcoOasis Carbon Tracker. Empowering green lifestyle adjustments.</p>
        <p style={{ marginTop: '0.25rem' }}>Designed with React & Three.js.</p>
      </footer>
    </div>
  );
}
