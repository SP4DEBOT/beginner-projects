import React, { useState } from 'react';
import { Award, Leaf, Zap, ShieldCheck, Heart, Printer, RefreshCw } from 'lucide-react';
import { ACTIONS_DATABASE } from './ActionHub';

export default function Offsets({ state }) {
  const { footprint, commitments } = state;
  const [userName, setUserName] = useState(state.userName || '');
  const [certificateGenerated, setCertificateGenerated] = useState(false);
  const [offsetRatio, setOffsetRatio] = useState(50);
  const [activeProject, setActiveProject] = useState('reforestation');

  const totalCommittedSavingsKg = commitments.reduce((acc, currentId) => {
    const act = ACTIONS_DATABASE.find(a => a.id === currentId);
    return acc + (act ? act.savings : 0);
  }, 0);

  const netFootprintTons = Math.max(0, parseFloat((footprint.totalTons - (totalCommittedSavingsKg / 1000)).toFixed(2)));

  const treesToPlant = Math.ceil((netFootprintTons * 1000) / 22);
  const solarKwhNeeded = Math.round((netFootprintTons * 1000) / 0.38);

  const simulatedOffsetTons = parseFloat(((netFootprintTons * offsetRatio) / 100).toFixed(2));

  const offsetProjects = [
    {
      id: 'reforestation',
      title: 'Amazon Basin Reforestation',
      location: 'Brazil',
      desc: 'Restoring degraded native forest lands to support wildlife corridors and capture greenhouse gases.',
      costPerTon: 15,
    },
    {
      id: 'cookstoves',
      title: 'Efficient Clean Cookstoves',
      location: 'Kenya',
      desc: 'Replacing traditional firewood stoves with clean-burning cookstoves, reducing deforestation and improving health.',
      costPerTon: 12,
    },
    {
      id: 'windfarm',
      title: 'Community Wind Energy Grid',
      location: 'Rajasthan, India',
      desc: 'Displacing coal-heavy electricity grids with certified community wind turbines.',
      costPerTon: 18,
    }
  ];

  const currentProject = offsetProjects.find(p => p.id === activeProject);
  const estimatedProjectCost = Math.round(simulatedOffsetTons * (currentProject?.costPerTon || 15));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-grid">
      <div className="flex-col" style={{ gap: '1.5rem' }}>
        
        <div className="glass-panel p-3">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Neutralization Calculator</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Determine the physical resources required to offset your remaining annual carbon footprint.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Footprint</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-red)' }}>{netFootprintTons} t</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CO2e / year</div>
            </div>
            <div style={{ background: 'rgba(0, 242, 254, 0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-cream)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Equivalent Trees</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cream)' }}>{treesToPlant}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Planted & Grown / year</div>
            </div>
          </div>

          <div className="slider-container" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <div className="slider-info">
              <span>Simulation: Offset Proportion</span>
              <span className="slider-value" style={{ color: 'var(--accent-cream)' }}>{offsetRatio}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              className="range-slider"
              value={offsetRatio}
              onChange={(e) => setOffsetRatio(parseInt(e.target.value))}
            />
            <div className="flex-space" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <span>Offsetting: {simulatedOffsetTons} tons</span>
              <span>Grid Solar equivalent: {Math.round(solarKwhNeeded * (offsetRatio / 100))} kWh</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-3">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Certified Offset Projects</h3>
          <div className="flex-col" style={{ gap: '0.75rem' }}>
            {offsetProjects.map(proj => (
              <div
                key={proj.id}
                onClick={() => setActiveProject(proj.id)}
                className={`select-card ${activeProject === proj.id ? 'selected' : ''}`}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1rem' }}
              >
                <div className="flex-space">
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-light)' }}>{proj.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cream)', fontWeight: 700 }}>
                    {proj.location}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{proj.desc}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Standard Credit Pricing: ${proj.costPerTon} / ton CO2e offset
                </span>
              </div>
            ))}
          </div>

          <div 
            style={{ 
              marginTop: '1.25rem', 
              background: 'rgba(0, 242, 254, 0.05)', 
              padding: '1rem', 
              borderRadius: '8px', 
              border: '1px solid rgba(0, 242, 254, 0.2)',
              textAlign: 'center' 
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estimated Project Investment: </span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>${estimatedProjectCost}</strong>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Based on offsetting {simulatedOffsetTons} tons CO2e via {currentProject?.title}.
            </div>
          </div>
        </div>

      </div>

      <div className="flex-col" style={{ gap: '1.5rem' }}>
        
        <div className="glass-panel p-3">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Eco Pledge Certificate</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Enter your name to generate a downloadable carbon-neutral pledge certification based on your commitments.
          </p>

          {!certificateGenerated ? (
            <div className="flex-col" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                disabled={!userName.trim()}
                onClick={() => setCertificateGenerated(true)}
              >
                Generate Pledge Certificate
              </button>
            </div>
          ) : (
            <div className="flex-col" style={{ gap: '1.25rem' }}>
              
              <div className="certificate-preview" id="printable-certificate">
                <div className="certificate-seal">
                  <Award size={40} style={{ stroke: 'var(--accent-cream)' }} />
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cream)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                  Certificate of Commitment
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                  Carbon Neutrality Pledge
                </p>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>This certifies that</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--text-light)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'inline-block', minWidth: '150px' }}>
                  {userName}
                </h3>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', margin: '1rem auto' }}>
                  has pledged to reduce environmental impact by executing <strong>{commitments.length} key green actions</strong>, targeting an adjusted carbon footprint of:
                </p>

                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-cream)', margin: '0.75rem 0' }}>
                  {netFootprintTons} Tons CO2e
                </div>
                
                <div className="flex-space" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '1.5rem' }}>
                  <span>Verified: {new Date().toLocaleDateString()}</span>
                  <span>Eco-Oasis System</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => setCertificateGenerated(false)}>
                  <RefreshCw size={14} /> Re-enter Name
                </button>
                <button className="btn btn-primary" style={{ flexGrow: 1 }} onClick={handlePrint}>
                  <Printer size={14} /> Print Certificate
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.25rem', justifyContent: 'center', alignItems: 'center' }}>
                <ShieldCheck size={12} style={{ color: 'var(--accent-cream)' }} /> Certified via standard EPA & DEFRA calculations.
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
