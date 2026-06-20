import React, { useState } from 'react';
import { Car, Flame, Apple, Leaf, Check, Award, ArrowRight, ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { calculateFootprint, COMPARISON_BASELINES } from '../utils/calculatorEngine';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Calculator({ currentInputs, onCalculate, onNavigate }) {
  const [formData, setFormData] = useState({
    transport: { ...currentInputs.transport },
    energy: { ...currentInputs.energy },
    diet: { ...currentInputs.diet },
    consumption: { ...currentInputs.consumption },
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [calculatedResult, setCalculatedResult] = useState(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsAiAnalyzing(true);
    const finalFootprint = calculateFootprint(formData);
    
    setTimeout(() => {
      onCalculate(formData, finalFootprint);
      setCalculatedResult(finalFootprint);
      setIsAiAnalyzing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1800);
  };

  const getAiSummary = () => {
    let transportSummary = "";
    if (formData.transport.vehicleType === 'none') {
      transportSummary = "your choice to commute without a private combustion vehicle keeps transit pollution minimal";
    } else {
      transportSummary = `your weekly driving of ${formData.transport.drivingDistance}km in a ${formData.transport.vehicleType.replace('Car', ' car')} represents your primary emissions node`;
    }

    let energySummary = "";
    if (formData.energy.renewablePercentage > 70) {
      energySummary = "your high share of clean grid electricity keeps utility emissions low";
    } else {
      energySummary = `your ${formData.energy.electricityKwh} kWh monthly power consumption is heavily reliant on fossil-fuel utility grids`;
    }

    let dietSummary = "";
    if (formData.diet.dietType === 'vegan' || formData.diet.dietType === 'vegetarian') {
      dietSummary = "your plant-based diet significantly reduces ecological pressure";
    } else {
      dietSummary = `your food choices (${formData.diet.dietType === 'heavyMeat' ? 'heavy meat consumption' : 'moderate meat consumption'}) indicate a high livestock farming impact`;
    }

    let wasteSummary = "";
    if (formData.consumption.recyclingPercentage > 60) {
      wasteSummary = "and your high recycling rate reduces organic landfill methane.";
    } else {
      wasteSummary = "and low waste recovery rates are contributing to secondary landfill output.";
    }

    return `EcoAI has synthesized your lifestyle metrics. We have detected that ${transportSummary}. At home, ${energySummary}. On the food front, ${dietSummary}, ${wasteSummary} Below is your optimized carbon mitigation roadmap.`;
  };

  const getAiSavingsForecast = () => {
    let savings = 0;
    if (formData.transport.vehicleType !== 'electricCar' && formData.transport.vehicleType !== 'none') {
      savings += (formData.transport.drivingDistance * 52 * 0.18) / 1000;
    }
    if (formData.energy.renewablePercentage < 80) {
      savings += (formData.energy.electricityKwh * 12 * 0.38 * 0.6) / 1000;
    }
    if (formData.diet.dietType === 'heavyMeat' || formData.diet.dietType === 'mediumMeat') {
      savings += 0.5;
    }
    if (formData.consumption.recyclingPercentage < 70) {
      savings += 0.15;
    }
    return Math.max(0.2, parseFloat(savings.toFixed(2)));
  };

  const getSuggestions = () => {
    const list = [];
    
    if (formData.transport.vehicleType !== 'none' && formData.transport.vehicleType !== 'electricCar') {
      if (formData.transport.drivingDistance > 50) {
        list.push({
          category: 'Transportation',
          icon: <Car size={16} />,
          color: '#10b981',
          title: 'Upgrade to Electric/Hybrid or Drive Less',
          desc: 'Switching your standard vehicle for a hybrid or EV, or reducing weekly driving distance, is one of the most effective carbon reduction strategies.'
        });
      }
    }
    if (formData.transport.flightHours > 5) {
      list.push({
        category: 'Transportation',
        icon: <Car size={16} />,
        color: '#10b981',
        title: 'Reduce Air Travel',
        desc: 'You have flying emissions. Try replacing domestic or short-haul flights with rail alternatives where available.'
      });
    }

    if (formData.energy.electricityKwh > 300) {
      if (formData.energy.renewablePercentage < 50) {
        list.push({
          category: 'Home Energy',
          icon: <Flame size={16} />,
          color: '#f59e0b',
          title: 'Switch to a Renewable Energy Mix',
          desc: 'Requesting your electricity provider to supply from 100% wind or solar sources can offset a large portion of your home emissions.'
        });
      }
    }
    if (formData.energy.gasBill > 15) {
      list.push({
        category: 'Home Energy',
        icon: <Flame size={16} />,
        color: '#f59e0b',
        title: 'Optimize Heating & Cooling',
        desc: 'Reduce gas use by insulating windows and doors, or using a smart thermostat schedule to dial back heating when away.'
      });
    }

    if (formData.diet.dietType === 'heavyMeat' || formData.diet.dietType === 'mediumMeat') {
      list.push({
        category: 'Diet & Food',
        icon: <Apple size={16} />,
        color: '#34d399',
        title: 'Introduce Plant-Based Meals',
        desc: 'Replacing beef/pork with vegan or vegetarian meals just 3 days a week cuts food footprints by up to 300 kg CO2e annually.'
      });
    }

    if (formData.consumption.shoppingHabits === 'highConsumer') {
      list.push({
        category: 'Shopping & Waste',
        icon: <Leaf size={16} />,
        color: '#6ee7b7',
        title: 'Practice Minimalist Shopping',
        desc: 'Buy second-hand gadgets and clothing when possible, and opt-out of packaging-heavy convenience purchases.'
      });
    }
    if (formData.consumption.recyclingPercentage < 60) {
      list.push({
        category: 'Shopping & Waste',
        icon: <Leaf size={16} />,
        color: '#6ee7b7',
        title: 'Improve Composting & Recycling',
        desc: 'Sort plastics, paper, and glass, and start a small kitchen compost container. This prevents organic material from creating methane in landfills.'
      });
    }

    if (list.length === 0) {
      list.push({
        category: 'Sustainability',
        icon: <ShieldCheck size={16} />,
        color: '#10b981',
        title: 'Keep Up the Excellent Work!',
        desc: 'You maintain highly efficient lifestyle patterns. Consider spreading green awareness to friends and family!'
      });
    }

    return list;
  };

  let totalTons = 0;
  let breakdownData = null;
  let doughnutOptions = null;
  let barChartData = null;
  let barOptions = null;
  let suggestions = [];
  let aiSummaryText = "";
  let aiSavingsVal = 0;

  if (calculatedResult) {
    totalTons = calculatedResult.totalTons;
    
    breakdownData = {
      labels: ['Transportation', 'Home Energy', 'Diet & Food', 'Shopping & Waste'],
      datasets: [
        {
          data: [
            calculatedResult.breakdown.transport,
            calculatedResult.breakdown.energy,
            calculatedResult.breakdown.diet,
            calculatedResult.breakdown.consumption,
          ],
          backgroundColor: [
            '#10b981',
            '#34d399',
            '#f59e0b',
            '#6ee7b7',
          ],
          borderColor: 'rgba(13, 22, 19, 0.8)',
          borderWidth: 1.5,
          hoverOffset: 8,
        },
      ],
    };

    doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: { family: 'Outfit', size: 11 },
            padding: 10,
          },
        },
      },
      cutout: '60%',
    };

    barChartData = {
      labels: ['You', 'Sustainable Target', 'Global Average', 'US Average'],
      datasets: [
        {
          data: [
            totalTons,
            COMPARISON_BASELINES.targetGoal,
            COMPARISON_BASELINES.globalAverage,
            COMPARISON_BASELINES.usAverage
          ],
          backgroundColor: [
            '#10b981',
            '#34d399',
            '#f59e0b',
            '#ef4444'
          ],
          borderRadius: 6,
          borderWidth: 0,
        }
      ]
    };

    barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } }
        }
      }
    };

    suggestions = getSuggestions();
    aiSummaryText = getAiSummary();
    aiSavingsVal = getAiSavingsForecast();
  }

  return (
    <div className="flex-col" style={{ gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel p-3">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Carbon Calculator</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Log your lifestyle habits to compute your annual carbon footprint.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2col" style={{ gap: '2rem' }}>
            
            <div className="flex-col" style={{ gap: '2rem' }}>
              
              <div className="glass-panel p-3" style={{ background: 'var(--bg-card)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--accent-cream)' }}>
                  <Car size={20} /> Transportation
                </h3>
                
                <div className="form-group">
                  <label className="form-label">Primary Vehicle Type</label>
                  <select 
                    className="form-select" 
                    value={formData.transport.vehicleType}
                    onChange={(e) => handleNestedChange('transport', 'vehicleType', e.target.value)}
                  >
                    <option value="petrolCar">Petrol Car</option>
                    <option value="dieselCar">Diesel Car</option>
                    <option value="hybridCar">Hybrid Car</option>
                    <option value="electricCar">Electric Car (EV)</option>
                    <option value="none">No Private Car</option>
                  </select>
                </div>

                {formData.transport.vehicleType !== 'none' && (
                  <div className="form-group slider-container">
                    <div className="slider-info">
                      <label className="form-label">Weekly Driving Distance</label>
                      <span className="slider-value">{formData.transport.drivingDistance} km</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="600" 
                      step="10"
                      className="range-slider"
                      value={formData.transport.drivingDistance}
                      onChange={(e) => handleNestedChange('transport', 'drivingDistance', parseInt(e.target.value))}
                    />
                  </div>
                )}

                <div className="form-group slider-container">
                  <div className="slider-info">
                    <label className="form-label">Weekly Public Transit Distance</label>
                    <span className="slider-value">{formData.transport.transitDistance} km</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="300" 
                    step="5"
                    className="range-slider"
                    value={formData.transport.transitDistance}
                    onChange={(e) => handleNestedChange('transport', 'transitDistance', parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group slider-container" style={{ marginBottom: 0 }}>
                  <div className="slider-info">
                    <label className="form-label">Annual Flight Hours</label>
                    <span className="slider-value">{formData.transport.flightHours} hours</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="80" 
                    step="1"
                    className="range-slider"
                    value={formData.transport.flightHours}
                    onChange={(e) => handleNestedChange('transport', 'flightHours', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="glass-panel p-3" style={{ background: 'var(--bg-card)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--accent-cream)' }}>
                  <Flame size={20} /> Home Energy
                </h3>

                <div className="form-group slider-container">
                  <div className="slider-info">
                    <label className="form-label">Monthly Electricity</label>
                    <span className="slider-value">{formData.energy.electricityKwh} kWh</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1000" 
                    step="25"
                    className="range-slider"
                    value={formData.energy.electricityKwh}
                    onChange={(e) => handleNestedChange('energy', 'electricityKwh', parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group slider-container">
                  <div className="slider-info">
                    <label className="form-label">Monthly Natural Gas</label>
                    <span className="slider-value">{formData.energy.gasBill} therms</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="120" 
                    step="5"
                    className="range-slider"
                    value={formData.energy.gasBill}
                    onChange={(e) => handleNestedChange('energy', 'gasBill', parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group slider-container" style={{ marginBottom: 0 }}>
                  <div className="slider-info">
                    <label className="form-label">Renewable Grid Energy Share</label>
                    <span className="slider-value">{formData.energy.renewablePercentage}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    className="range-slider"
                    value={formData.energy.renewablePercentage}
                    onChange={(e) => handleNestedChange('energy', 'renewablePercentage', parseInt(e.target.value))}
                  />
                </div>
              </div>

            </div>

            <div className="flex-col" style={{ gap: '2rem' }}>
              
              <div className="glass-panel p-3" style={{ background: 'var(--bg-card)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--accent-cream)' }}>
                  <Apple size={20} /> Diet & Food
                </h3>

                <div className="form-group">
                  <label className="form-label">Dietary Profile</label>
                  <div className="card-selector-grid">
                    {[
                      { id: 'heavyMeat', title: 'Heavy Meat', desc: 'Daily meat, beef/lamb.' },
                      { id: 'mediumMeat', title: 'Moderate', desc: 'Limited red meat.' },
                      { id: 'vegetarian', title: 'Vegetarian', desc: 'Eggs & dairy, no meat.' },
                      { id: 'vegan', title: 'Vegan', desc: 'Strictly plants.' }
                    ].map(opt => (
                      <div 
                        key={opt.id}
                        className={`select-card ${formData.diet.dietType === opt.id ? 'selected' : ''}`}
                        onClick={() => handleNestedChange('diet', 'dietType', opt.id)}
                        style={{ padding: '1rem', minHeight: '85px' }}
                      >
                        <span className="select-card-title" style={{ fontSize: '0.95rem' }}>{opt.title}</span>
                        <span className="select-card-desc" style={{ fontSize: '0.75rem' }}>{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Local & Seasonal Food Share</label>
                  <select 
                    className="form-select" 
                    value={formData.diet.localFoodRatio}
                    onChange={(e) => handleNestedChange('diet', 'localFoodRatio', e.target.value)}
                  >
                    <option value="always">Always (Local markets)</option>
                    <option value="sometimes">Sometimes (Supermarket + occasional local)</option>
                    <option value="rarely">Rarely (Mostly imported & packaged)</option>
                  </select>
                </div>
              </div>

              <div className="glass-panel p-3" style={{ background: 'var(--bg-card)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--accent-cream)' }}>
                  <Leaf size={20} /> Shopping & Waste
                </h3>

                <div className="form-group">
                  <label className="form-label">Shopping Behavior</label>
                  <div className="card-selector-grid">
                    {[
                      { id: 'highConsumer', title: 'High Consumer', desc: 'Buy new gadgets/clothes often.' },
                      { id: 'averageConsumer', title: 'Average', desc: 'Buy items as needed.' },
                      { id: 'lowWaste', title: 'Low Waste', desc: 'Minimalist, second-hand.' }
                    ].map(opt => (
                      <div 
                        key={opt.id}
                        className={`select-card ${formData.consumption.shoppingHabits === opt.id ? 'selected' : ''}`}
                        onClick={() => handleNestedChange('consumption', 'shoppingHabits', opt.id)}
                        style={{ padding: '1rem', minHeight: '85px' }}
                      >
                        <span className="select-card-title" style={{ fontSize: '0.95rem' }}>{opt.title}</span>
                        <span className="select-card-desc" style={{ fontSize: '0.75rem' }}>{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group slider-container" style={{ marginBottom: 0 }}>
                  <div className="slider-info">
                    <label className="form-label">Recycled or Composted Waste Share</label>
                    <span className="slider-value">{formData.consumption.recyclingPercentage}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    className="range-slider"
                    value={formData.consumption.recyclingPercentage}
                    onChange={(e) => handleNestedChange('consumption', 'recyclingPercentage', parseInt(e.target.value))}
                  />
                </div>
              </div>

            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', borderTop: '1px solid var(--border-light)', paddingTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.05rem', minWidth: '280px' }}>
              Calculate Carbon Footprint
            </button>
          </div>
        </form>
      </div>

      {isAiAnalyzing && (
        <div className="glass-panel p-3" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
            <div className="certificate-seal glowing-sun" style={{ margin: 0, width: '100px', height: '100px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)' }}>
              <Cpu size={50} style={{ stroke: '#ffffff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>EcoAI Analysis</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Analyzing carbon inputs...
              </p>
            </div>
            <div className="flex-col" style={{ gap: '0.5rem', width: '100%', maxWidth: '350px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> <span style={{ color: 'var(--text-light)' }}>Parsing category habits data</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#10b981' }}>✓</span> <span style={{ color: 'var(--text-light)' }}>Querying EPA & DEFRA standards</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent-cream)' }}>●</span> <span style={{ color: 'var(--text-light)' }}>Synthesizing footprint optimization matrix</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {calculatedResult && (
        <div className="glass-panel p-3">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div className="certificate-seal" style={{ margin: 0, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)' }}>
                <Award size={40} style={{ stroke: '#ffffff' }} />
              </div>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Your Carbon Footprint</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Your annual carbon footprint summary is computed.
            </p>
          </div>

          {showSuccess && (
            <div 
              className="glass-panel-glow" 
              style={{ 
                background: 'rgba(16, 185, 129, 0.08)', 
                border: '1px solid var(--accent-cream)', 
                padding: '1.25rem', 
                borderRadius: 'var(--radius-sm)',
                marginBottom: '2rem',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: 'var(--accent-cream)',
                fontWeight: 600
              }}
            >
              <Check size={20} /> Saved to history entry!
            </div>
          )}

          <div className="flex-col" style={{ gap: '2.5rem' }}>
            
            <div 
              style={{ 
                background: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                Your Annual Carbon Footprint
              </span>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-cream)', margin: '0.5rem 0 0.25rem' }}>
                {totalTons} <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tons CO2e</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Equivalent to generating {(totalTons * 1000).toLocaleString()} kg of greenhouse gases per year.
              </p>
            </div>

            <div className="grid-2col" style={{ gap: '2rem' }}>
              <div className="glass-panel p-3" style={{ background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', height: '300px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '1rem', textAlign: 'center' }}>Breakdown by Category</h4>
                <div style={{ flexGrow: 1, position: 'relative' }}>
                  <Doughnut data={breakdownData} options={doughnutOptions} />
                </div>
              </div>

              <div className="glass-panel p-3" style={{ background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', height: '300px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-light)', marginBottom: '1rem', textAlign: 'center' }}>Benchmark Comparisons (Tons)</h4>
                <div style={{ flexGrow: 1, position: 'relative' }}>
                  <Bar data={barChartData} options={barOptions} />
                </div>
              </div>
            </div>


            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => onNavigate && onNavigate('dashboard')}
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
