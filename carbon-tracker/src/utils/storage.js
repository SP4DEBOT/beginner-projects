import { calculateFootprint } from './calculatorEngine';

export const DEFAULT_INPUTS = {
  transport: {
    drivingDistance: 150,
    vehicleType: 'petrolCar',
    transitDistance: 40,
    flightHours: 12,
  },
  energy: {
    electricityKwh: 350,
    gasBill: 30,
    renewablePercentage: 15,
  },
  diet: {
    dietType: 'mediumMeat',
    localFoodRatio: 'sometimes',
  },
  consumption: {
    shoppingHabits: 'averageConsumer',
    recyclingPercentage: 40,
  }
};

const STORAGE_KEY = 'carbon_tracker_state_v2';

export function loadState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const defaultFootprint = calculateFootprint(DEFAULT_INPUTS);
      const defaultState = {
        inputs: DEFAULT_INPUTS,
        footprint: defaultFootprint,
        commitments: [],
        history: [
          {
            timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
            totalTons: parseFloat((defaultFootprint.totalTons * 1.15).toFixed(2)),
            breakdown: {
              transport: Math.round(defaultFootprint.breakdown.transport * 1.15),
              energy: Math.round(defaultFootprint.breakdown.energy * 1.1),
              diet: Math.round(defaultFootprint.breakdown.diet * 1.2),
              consumption: Math.round(defaultFootprint.breakdown.consumption * 1.2)
            }
          },
          {
            timestamp: Date.now(),
            totalTons: defaultFootprint.totalTons,
            breakdown: defaultFootprint.breakdown
          }
        ],
        xp: 150,
        level: 1,
        streak: 3,
        achievements: ['first_calc'],
        habits: {
          transit: false,
          thermostat: true,
          diet: false,
          compost: true
        }
      };
      saveState(defaultState);
      return defaultState;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error(e);
    return {
      inputs: DEFAULT_INPUTS,
      footprint: calculateFootprint(DEFAULT_INPUTS),
      commitments: [],
      history: [],
      xp: 150,
      level: 1,
      streak: 3,
      achievements: ['first_calc'],
      habits: {
        transit: false,
        thermostat: true,
        diet: false,
        compost: true
      }
    };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error(e);
  }
}

export function addHistoryEntry(state, inputs, footprint) {
  const newEntry = {
    timestamp: Date.now(),
    totalTons: footprint.totalTons,
    breakdown: { ...footprint.breakdown }
  };
  
  const updatedHistory = [...state.history];
  updatedHistory.push(newEntry);

  const updatedState = {
    ...state,
    inputs,
    footprint,
    history: updatedHistory
  };

  saveState(updatedState);
  return updatedState;
}
