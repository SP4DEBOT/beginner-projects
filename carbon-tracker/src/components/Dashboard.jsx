import React, { useState } from 'react';
import { Leaf, Award, Trophy, Users, ShieldCheck, Zap, Flame, Compass, ChevronRight, Check } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import OasisGarden from './OasisGarden';
import { COMPARISON_BASELINES } from '../utils/calculatorEngine';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function Dashboard({ state, onNavigate, onUpdateState }) {
  const { footprint, commitments, history, xp = 150, level = 1, streak = 3, habits = { transit: false, thermostat: true, diet: false, compost: true } } = state;
  const committedCount = commitments.length;

  const ACTIONS_DB = [
    { id: 'ev_upgrade', savings: 2400 },
    { id: 'public_transit', savings: 800 },
    { id: 'solar_home', savings: 1500 },
    { id: 'smart_thermostat', savings: 400 },
    { id: 'green_energy', savings: 600 },
    { id: 'plant_based', savings: 800 },
    { id: 'local_food', savings: 150 },
    { id: 'recycle_all', savings: 150 },
    { id: 'zero_waste', savings: 300 }
  ];

  const totalCommittedSavingsKg = commitments.reduce((acc, currentId) => {
    const act = ACTIONS_DB.find(a => a.id === currentId);
    return acc + (act ? act.savings : 0);
  }, 0);

  const footprintAfterCommitmentsTons = Math.max(0.1, parseFloat((footprint.totalTons - (totalCommittedSavingsKg / 1000)).toFixed(2)));

  const xpThreshold = level * 200;
  const xpPercent = Math.min(100, Math.round((xp / xpThreshold) * 100));

  const breakdownData = {
    labels: ['Transportation', 'Home Energy', 'Diet & Food', 'Shopping & Consumption'],
    datasets: [
      {
        data: [
          footprint.breakdown.transport,
          footprint.breakdown.energy,
          footprint.breakdown.diet,
          footprint.breakdown.consumption,
        ],
        backgroundColor: [
          '#00f2fe',
          '#f02fc2',
          '#4facfe',
          '#7f00ff',
        ],
        borderColor: '#ffffff',
        borderWidth: 1,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Outfit', size: 11 },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw || 0;
            return ` ${context.label}: ${value.toLocaleString()} kg CO2e/yr`;
          },
        },
      },
    },
    cutout: '65%',
  };

  const lineChartData = {
    labels: history.map(h => new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Carbon Footprint Trend (Tons CO2e)',
        data: history.map(h => h.totalTons),
        borderColor: '#00f2fe',
        backgroundColor: 'rgba(0, 242, 254, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#f02fc2',
        pointBorderColor: '#ffffff',
        pointHoverRadius: 7,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Footprint: ${ctx.raw} tons CO2e/yr`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#475569', font: { family: 'Outfit' } }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#475569', font: { family: 'Outfit' } },
        suggestedMin: 0
      }
    }
  };

  const getRating = (tons) => {
    if (tons <= COMPARISON_BASELINES.targetGoal) return { label: 'Climate Hero', color: 'var(--text-primary)' };
    if (tons <= 5.0) return { label: 'Eco Conscious', color: 'var(--text-light)' };
    if (tons <= 10.0) return { label: 'Moderate Footprint', color: 'var(--text-secondary)' };
    return { label: 'High Carbon Output', color: 'var(--accent-red)' };
  };

  const rating = getRating(footprint.totalTons);

  const [popups, setPopups] = useState([]);

  const handleToggleHabit = (habitId, event) => {
    const updatedHabits = { ...habits, [habitId]: !habits[habitId] };
    const checkedNow = updatedHabits[habitId];
    
    if (checkedNow) {
      let clickX = 100;
      let clickY = 15;
      if (event) {
        const rect = event.currentTarget.getBoundingClientRect();
        clickX = event.clientX - rect.left;
        clickY = event.clientY - rect.top;
      }
      const newPopup = {
        id: Date.now() + Math.random(),
        habitId,
        x: clickX,
        y: clickY
      };
      setPopups(prev => [...prev, newPopup]);
      setTimeout(() => {
        setPopups(prev => prev.filter(p => p.id !== newPopup.id));
      }, 1000);
    }
    
    let xpGain = checkedNow ? 20 : -20;
    let newXp = Math.max(0, xp + xpGain);
    let newLevel = level;
    let currentThreshold = newLevel * 200;

    if (newXp >= currentThreshold) {
      newXp -= currentThreshold;
      newLevel += 1;
    }

    const allChecked = Object.values(updatedHabits).every(v => v === true);
    let newStreak = streak;
    if (allChecked && !Object.values(habits).every(v => v === true)) {
      newStreak += 1;
    }

    const updatedState = {
      ...state,
      habits: updatedHabits,
      xp: newXp,
      level: newLevel,
      streak: newStreak
    };

    onUpdateState(updatedState);
  };

  const availableAchievements = [
    { id: 'first_calc', title: 'Initiate', desc: 'Calculate footprint.', unlocked: true, icon: <Leaf size={16} /> },
    { id: 'streak_3', title: 'Consistent', desc: 'Reach 3d streak.', unlocked: streak >= 3, icon: <Flame size={16} /> },
    { id: 'zero_waste', title: 'Zero Waste', desc: 'Pledge recycling.', unlocked: commitments.includes('zero_waste') || commitments.includes('recycle_all'), icon: <Trophy size={16} /> },
    { id: 'solar', title: 'Solar Pioneer', desc: 'Opt in to solar.', unlocked: commitments.includes('solar_home') || commitments.includes('green_energy') || state.inputs.energy.renewablePercentage > 30, icon: <Zap size={16} /> },
    { id: 'hero', title: 'Eco Hero', desc: 'Under 3.0 tons.', unlocked: footprintAfterCommitmentsTons <= 3.0, icon: <Award size={16} /> }
  ];

  const getPersonalizedInsights = () => {
    const list = [];
    const inp = state.inputs;
    if (inp.transport.vehicleType !== 'none' && inp.transport.drivingDistance > 80) {
      const savings = Math.round(inp.transport.drivingDistance * 52 * 0.15);
      list.push({
        id: 'ev',
        title: 'Electrify Your Drive',
        desc: `Swapping your standard vehicle for a hybrid or EV would save around ${savings} kg CO2e/year based on your driving profile.`
      });
    }
    if (inp.diet.dietType === 'heavyMeat' || inp.diet.dietType === 'mediumMeat') {
      list.push({
        id: 'diet',
        title: 'Plant-Based Shifts',
        desc: 'Replacing meat products with vegetarian choices just 3 days a week cuts food footprints by up to 400 kg CO2e/year.'
      });
    }
    if (inp.energy.electricityKwh > 250 && inp.energy.renewablePercentage < 50) {
      const solarSavings = Math.round(inp.energy.electricityKwh * 12 * 0.38 * 0.7);
      list.push({
        id: 'solar',
        title: 'Harness Clean Grid',
        desc: `Switching utility mixes or solar offsets for your ${inp.energy.electricityKwh} kWh monthly usage can cut ${solarSavings} kg CO2e.`
      });
    }
    if (list.length === 0) {
      list.push({
        id: 'default',
        title: 'Doing Great!',
        desc: 'You maintain highly efficient lifestyle patterns. Offset residual emissions in offsets page.'
      });
    }
    return list;
  };

  const insights = getPersonalizedInsights();

  const leaderboard = [
    { rank: 1, name: 'EcoWarriors Munich', value: 1.1, you: false },
    { rank: 2, name: `${state.userName || 'You'} (EcoOasis)`, value: footprintAfterCommitmentsTons, you: true },
    { rank: 3, name: 'Cascade Carbon Team', value: 3.4, you: false },
    { rank: 4, name: 'London Green Club', value: 5.6, you: false }
  ].sort((a, b) => a.value - b.value);

  return (
    <div className="dashboard-grid">
      <div className="flex-col" style={{ gap: '2rem' }}>
        
        <div className="glass-panel p-3" style={{ borderLeft: '5px solid var(--accent-cream)' }}>
          <div className="flex-space" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Eco Level {level}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cream)' }}>{xp} / {xpThreshold} XP</span>
          </div>
          <div style={{ height: '10px', background: 'rgba(0, 0, 0, 0.06)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #00b4d8 0%, #0077b6 100%)', width: `${xpPercent}%`, borderRadius: '5px', transition: 'width 0.5s ease' }} />
          </div>
          <div className="flex-space" style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>🔥 Streak: {streak} Days Active</span>
            <span>Unlocks dynamic additions to your 3D Oasis</span>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card glass-panel">
            <div className="stat-header">
              <span>Annual Footprint</span>
              <div className="stat-icon-wrapper">
                <Leaf size={18} />
              </div>
            </div>
            <div className="stat-value">{footprint.totalTons}</div>
            <div className="stat-unit">Tons CO2e / year</div>
            <div className="stat-footer" style={{ color: rating.color, fontWeight: 700 }}>
              <ShieldCheck size={14} />
              {rating.label}
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-header">
              <span>Committed Actions</span>
              <div className="stat-icon-wrapper">
                <Zap size={18} />
              </div>
            </div>
            <div className="stat-value">{committedCount}</div>
            <div className="stat-unit">Active Commits</div>
            <div className="stat-footer" style={{ color: 'var(--text-secondary)' }}>
              <span>Saved: </span>
              <strong style={{ color: 'var(--accent-cream)' }}>
                {(totalCommittedSavingsKg / 1000).toFixed(2)}t
              </strong>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-header">
              <span>Adjusted Footprint</span>
              <div className="stat-icon-wrapper">
                <Compass size={18} />
              </div>
            </div>
            <div className="stat-value">{footprintAfterCommitmentsTons}</div>
            <div className="stat-unit">Tons (with commits)</div>
            <div className="stat-footer">
              <span>Goal: </span>
              <strong style={{ color: 'var(--accent-cream)' }}>{COMPARISON_BASELINES.targetGoal} tons</strong>
            </div>
          </div>
        </div>

        <OasisGarden 
          footprintTons={footprint.totalTons} 
          commitments={commitments}
          renewablePercentage={state.inputs.energy.renewablePercentage}
          level={level}
        />

        <div className="glass-panel p-3">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-light)' }}>Daily Green Habits</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Complete tasks daily to maintain streaks and gain +20 XP per action.</p>
          <div className="flex-col">
            {[
              { id: 'transit', label: 'Commute via Public Transit or Walk', xp: 20 },
              { id: 'thermostat', label: 'Use ECO Thermostat Schedule', xp: 20 },
              { id: 'diet', label: 'Eat fully vegetarian or vegan meals', xp: 20 },
              { id: 'compost', label: 'Compost organic wastes & recycle', xp: 20 }
            ].map(item => (
              <div 
                key={item.id}
                className={`habit-row ${habits[item.id] ? 'checked' : ''}`}
                onClick={(e) => handleToggleHabit(item.id, e)}
                style={{ position: 'relative', overflow: 'visible' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    borderRadius: '4px', 
                    border: '2px solid var(--accent-cream)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: habits[item.id] ? 'var(--accent-cream)' : 'transparent',
                    transition: 'var(--transition-smooth)'
                  }}>
                    {habits[item.id] && <Check size={14} stroke="#ffffff" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: habits[item.id] ? 'var(--text-light)' : 'var(--text-secondary)' }}>
                    {item.label}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>+{item.xp} XP</span>
                {popups.filter(p => p.habitId === item.id).map(popup => (
                  <span
                    key={popup.id}
                    style={{
                      position: 'absolute',
                      left: `${popup.x}px`,
                      top: `${popup.y}px`,
                      color: 'var(--accent-cream)',
                      fontWeight: 800,
                      fontSize: '1.25rem',
                      textShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
                      pointerEvents: 'none',
                      animation: 'floatUpAndFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                      zIndex: 100
                    }}
                  >
                    +20 XP!
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-3">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-light)' }}>Carbon History Progress</h3>
          <div className="chart-wrapper" style={{ height: '200px' }}>
            {history.length > 1 ? (
              <Line data={lineChartData} options={lineOptions} />
            ) : (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Log updates in the calculator to visualize your timeline.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-col" style={{ gap: '2rem' }}>
        <div className="glass-panel p-3">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-light)' }}>Achievements Unlocked</h3>
          <div className="achievements-grid">
            {availableAchievements.map(ach => (
              <div 
                key={ach.id} 
                className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{ach.icon}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-light)' }}>{ach.title}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{ach.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-3">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-light)' }}>Community Leaderboard</h3>
          <div className="flex-col">
            {leaderboard.map((user, idx) => (
              <div 
                key={idx}
                className={`community-row ${user.you ? 'user' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, width: '20px' }}>#{idx + 1}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: user.you ? 700 : 500 }}>{user.name}</span>
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-cream)' }}>{user.value} t CO2e</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '1.25rem', paddingTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            🌍 Macro impact: Ecosystem community saved <strong>1,248,590 kg CO2e</strong>.
          </div>
        </div>

        <div className="glass-panel p-3">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-light)' }}>Personalized Insights</h3>
          <div className="flex-col" style={{ gap: '1rem' }}>
            {insights.map(item => (
              <div 
                key={item.id} 
                style={{ 
                  background: 'rgba(0, 242, 254, 0.05)',
                  padding: '1rem',
                  borderRadius: '10px',
                  borderLeft: '4px solid var(--accent-cream)'
                }}
              >
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-cream)', marginBottom: '0.25rem' }}>{item.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.4' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-3">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-light)' }}>Category Breakdown</h3>
          <div className="chart-wrapper">
            <Doughnut data={breakdownData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
