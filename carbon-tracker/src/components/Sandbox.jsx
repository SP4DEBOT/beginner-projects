import React, { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { calculateFootprint } from '../utils/calculatorEngine';

export default function Sandbox({ currentInputs, actualFootprint }) {
  const [sandboxInputs, setSandboxInputs] = useState({
    transport: { ...currentInputs.transport },
    energy: { ...currentInputs.energy },
    diet: { ...currentInputs.diet },
    consumption: { ...currentInputs.consumption },
  });

  const [simulatedFootprint, setSimulatedFootprint] = useState(actualFootprint);

  useEffect(() => {
    const res = calculateFootprint(sandboxInputs);
    setSimulatedFootprint(res);
  }, [
    sandboxInputs.transport.drivingDistance,
    sandboxInputs.transport.vehicleType,
    sandboxInputs.energy.renewablePercentage,
    sandboxInputs.diet.dietType,
    sandboxInputs.consumption.recyclingPercentage
  ]);

  const handleNestedChange = (category, field, value) => {
    setSandboxInputs((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const difference = actualFootprint.totalTons - simulatedFootprint.totalTons;
  const isSaving = difference > 0;
  const percentageChange = actualFootprint.total ? Math.round((Math.abs(difference * 1000) / actualFootprint.total) * 100) : 0;
  const treesEquivalent = Math.round(Math.abs(difference * 1000) / 22);

  return (
    <div className="dashboard-grid">
      <div className="glass-panel p-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Sparkles size={22} style={{ color: 'var(--accent-cream)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Scenario Planner (Sandbox Mode)</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Adjust the parameters below to preview the hypothetical carbon impact of changing your daily routines.
        </p>

        <div className="flex-col" style={{ gap: '1.5rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-cream)' }}>Transportation Simulation</h4>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Vehicle Type</label>
              <select
                className="form-select"
                value={sandboxInputs.transport.vehicleType}
                onChange={(e) => handleNestedChange('transport', 'vehicleType', e.target.value)}
              >
                <option value="petrolCar">Petrol Car</option>
                <option value="dieselCar">Diesel Car</option>
                <option value="hybridCar">Hybrid Car</option>
                <option value="electricCar">Electric Car (EV)</option>
                <option value="none">No Private Vehicle</option>
              </select>
            </div>

            {sandboxInputs.transport.vehicleType !== 'none' && (
              <div className="form-group slider-container">
                <div className="slider-info">
                  <label className="form-label">Weekly Driving Distance</label>
                  <span className="slider-value">{sandboxInputs.transport.drivingDistance} km</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  step="10"
                  className="range-slider"
                  value={sandboxInputs.transport.drivingDistance}
                  onChange={(e) => handleNestedChange('transport', 'drivingDistance', parseInt(e.target.value))}
                />
              </div>
            )}
          </div>

          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-cream)' }}>Clean Energy Simulation</h4>
            <div className="form-group slider-container">
              <div className="slider-info">
                <label className="form-label">Renewable Grid Energy Share</label>
                <span className="slider-value" style={{ color: 'var(--accent-cream)' }}>{sandboxInputs.energy.renewablePercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                className="range-slider"
                value={sandboxInputs.energy.renewablePercentage}
                onChange={(e) => handleNestedChange('energy', 'renewablePercentage', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-cream)' }}>Diet Profile Simulation</h4>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label className="form-label">Diet Pattern</label>
              <div className="card-selector-grid">
                {[
                  { id: 'heavyMeat', name: 'Heavy Meat' },
                  { id: 'mediumMeat', name: 'Medium' },
                  { id: 'vegetarian', name: 'Vegetarian' },
                  { id: 'vegan', name: 'Vegan' }
                ].map(opt => (
                  <div
                    key={opt.id}
                    className={`select-card ${sandboxInputs.diet.dietType === opt.id ? 'selected' : ''}`}
                    onClick={() => handleNestedChange('diet', 'dietType', opt.id)}
                    style={{ padding: '0.75rem', textAlign: 'center' }}
                  >
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{opt.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-cream)' }}>Recycling Simulation</h4>
            <div className="form-group slider-container">
              <div className="slider-info">
                <label className="form-label">Recycling & Composting rate</label>
                <span className="slider-value">{sandboxInputs.consumption.recyclingPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                className="range-slider"
                value={sandboxInputs.consumption.recyclingPercentage}
                onChange={(e) => handleNestedChange('consumption', 'recyclingPercentage', parseInt(e.target.value))}
              />
            </div>
          </div>

        </div>
      </div>

      <div className="flex-col" style={{ gap: '1.5rem' }}>
        
        <div className="glass-panel p-3 glass-panel-glow">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>Simulation Summary</h3>
          
          <div className="flex-col" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="slider-container">
              <div className="slider-info">
                <span>Current Actual Footprint</span>
                <span style={{ fontWeight: 700 }}>{actualFootprint.totalTons} tons CO2e</span>
              </div>
              <div style={{ height: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '5px' }}>
                <div style={{ height: '100%', background: 'var(--accent-purple)', width: '70%', borderRadius: '5px' }} />
              </div>
            </div>

            <div className="slider-container">
              <div className="slider-info">
                <span>Simulated Carbon Footprint</span>
                <span style={{ fontWeight: 850, color: 'var(--accent-cream)' }}>{simulatedFootprint.totalTons} tons CO2e</span>
              </div>
              <div style={{ height: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '5px' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cream))', 
                    width: `${Math.min(100, (simulatedFootprint.totalTons / Math.max(1, actualFootprint.totalTons)) * 70)}%`, 
                    borderRadius: '5px',
                    transition: 'width 0.4s ease'
                  }} 
                />
              </div>
            </div>
          </div>

          {difference !== 0 ? (
            <div 
              style={{ 
                background: isSaving ? 'rgba(0, 242, 254, 0.05)' : 'rgba(255, 0, 127, 0.05)',
                border: `1px dashed ${isSaving ? 'var(--accent-cream)' : 'var(--accent-red)'}`,
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                textAlign: 'center'
              }}
            >
              {isSaving ? (
                <>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cream)' }}>
                    -{Math.abs(difference).toFixed(2)} Tons CO2e / Year
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Implementing these simulated settings reduces your carbon footprint by{' '}
                    <strong style={{ color: 'var(--text-light)' }}>{percentageChange}%</strong>!
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <ShieldCheck size={14} /> Equivalent to planting{' '}
                    <strong>{treesEquivalent}</strong> mature trees annually.
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                    +{Math.abs(difference).toFixed(2)} Tons CO2e / Year
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    This configuration raises your footprint by{' '}
                    <strong style={{ color: 'var(--text-light)' }}>{percentageChange}%</strong> compared to your current lifestyle.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Move the sliders to see simulated changes in real-time.
            </div>
          )}
        </div>

        <div className="glass-panel p-3">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Simulated Recommendations</h3>
          <div className="flex-col" style={{ gap: '0.75rem' }}>
            
            {sandboxInputs.transport.vehicleType === 'electricCar' && sandboxInputs.transport.drivingDistance > 0 && (
              <div style={{ fontSize: '0.85rem', background: 'rgba(0, 242, 254, 0.05)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-cream)' }}>
                <strong>EV Advantage:</strong> Driving an electric car generates ~80% fewer emissions compared to gasoline, assuming average grid charging.
              </div>
            )}

            {sandboxInputs.diet.dietType === 'vegan' && (
              <div style={{ fontSize: '0.85rem', background: 'rgba(0, 242, 254, 0.08)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-emerald)' }}>
                <strong>Plant Power:</strong> Committing to a vegan lifestyle is one of the most effective personal actions to reduce food-related emissions.
              </div>
            )}

            {sandboxInputs.energy.renewablePercentage > 75 && (
              <div style={{ fontSize: '0.85rem', background: 'rgba(0, 242, 254, 0.05)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-cream)' }}>
                <strong>Solar Glow:</strong> Sourcing energy from local green programs or rooftop panels nearly zeros out home electricity emissions.
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <HelpCircle size={12} /> These figures are estimations based on global climate models.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
