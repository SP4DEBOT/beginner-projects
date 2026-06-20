import React, { useState } from 'react';
import { ShieldCheck, Plus, Check, Leaf, Zap, HelpCircle } from 'lucide-react';

export const ACTIONS_DATABASE = [
  {
    id: 'ev_upgrade',
    category: 'transport',
    title: 'Switch to an Electric Vehicle',
    description: 'Replace your primary internal combustion engine car with an electric vehicle.',
    savings: 2400,
    difficulty: 'hard'
  },
  {
    id: 'public_transit',
    category: 'transport',
    title: 'Commute via Public Transit',
    description: 'Switch from driving to public transit (bus, train, subway) for your work commute.',
    savings: 800,
    difficulty: 'medium'
  },
  {
    id: 'solar_home',
    category: 'energy',
    title: 'Install Rooftop Solar Panels',
    description: 'Generate your own clean electricity to power your home appliances and heating.',
    savings: 1500,
    difficulty: 'hard'
  },
  {
    id: 'smart_thermostat',
    category: 'energy',
    title: 'Install a Smart Thermostat',
    description: 'Optimize heating and cooling schedules to reduce energy wastage when away.',
    savings: 400,
    difficulty: 'easy'
  },
  {
    id: 'green_energy',
    category: 'energy',
    title: 'Opt-in to Green Power Programs',
    description: 'Request utility supplier to source electricity from 100% wind/solar grids.',
    savings: 600,
    difficulty: 'easy'
  },
  {
    id: 'plant_based',
    category: 'diet',
    title: 'Transition to a Plant-Based Diet',
    description: 'Eliminate or drastically reduce beef, lamb, dairy, and pork from your dietary routine.',
    savings: 800,
    difficulty: 'medium'
  },
  {
    id: 'local_food',
    category: 'diet',
    title: 'Source Local & Seasonal Produce',
    description: 'Purchase organic food from local farmers to minimize shipping emissions.',
    savings: 150,
    difficulty: 'easy'
  },
  {
    id: 'recycle_all',
    category: 'consumption',
    title: 'Universal Recycling & Composting',
    description: 'Separate organic compost, plastics, cardboard, and glass to minimize landfill waste.',
    savings: 150,
    difficulty: 'easy'
  },
  {
    id: 'zero_waste',
    category: 'consumption',
    title: 'Adopt Minimalist Zero-Waste Living',
    description: 'Avoid single-use plastics, buy bulk, buy second-hand, and reuse items.',
    savings: 300,
    difficulty: 'medium'
  }
];

export default function ActionHub({ commitments = [], onToggleCommitment }) {
  const [filter, setFilter] = useState('all');

  const filteredActions = filter === 'all' 
    ? ACTIONS_DATABASE 
    : ACTIONS_DATABASE.filter(act => act.category === filter);

  const totalPotentialSavings = commitments.reduce((acc, actionId) => {
    const act = ACTIONS_DATABASE.find(a => a.id === actionId);
    return acc + (act ? act.savings : 0);
  }, 0);

  return (
    <div className="flex-col" style={{ gap: '1.5rem' }}>
      
      <div className="glass-panel p-3 glass-panel-glow flex-space" style={{ flexWrap: 'wrap', gap: '1rem', borderLeft: '5px solid var(--accent-cream)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cream)' }}>Commitment Planner</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Choose actions to pledge. Your committed savings will dynamically update your dashboard metrics.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pledged Reduction</div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cream)' }}>
            {(totalPotentialSavings / 1000).toFixed(2)} Tons
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}> / year</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', name: 'All Actions' },
          { id: 'transport', name: 'Transportation' },
          { id: 'energy', name: 'Home Energy' },
          { id: 'diet', name: 'Diet & Food' },
          { id: 'consumption', name: 'Consumption' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`btn btn-secondary nav-tab ${filter === tab.id ? 'active' : ''}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredActions.map(action => {
          const isCommitted = commitments.includes(action.id);
          
          return (
            <div 
              key={action.id} 
              className={`action-card glass-panel ${isCommitted ? 'glass-panel-glow' : ''}`}
              style={{ 
                borderLeft: isCommitted ? '4px solid var(--accent-cream)' : '1px solid var(--border-light)',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div className="action-info">
                <span className={`action-badge badge-${action.difficulty}`}>
                  {action.difficulty.toUpperCase()}
                </span>
                
                <h4 className="action-title">
                  {action.title}
                </h4>
                <p className="action-desc">{action.description}</p>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.5rem', 
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  flexShrink: 0
                }}
              >
                <div className="action-savings">
                  <Leaf size={14} />
                  <span>{action.savings} kg</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/yr</span>
                </div>

                <button
                  onClick={() => onToggleCommitment(action.id)}
                  className={`btn ${isCommitted ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    fontSize: '0.85rem',
                    minWidth: '110px'
                  }}
                >
                  {isCommitted ? (
                    <>
                      <Check size={14} /> Pledged
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Pledge
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>
      
    </div>
  );
}
