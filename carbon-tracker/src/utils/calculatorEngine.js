


export const EMISSION_FACTORS = {
  
  transport: {
    petrolCar: 0.24,  
    dieselCar: 0.27,  
    hybridCar: 0.12,  
    electricCar: 0.05, 
    publicTransit: 0.04, 
    flightHour: 90.0,    
  },
  
  
  energy: {
    electricityKwh: 0.38, 
    gasTherm: 5.3,        
  },

  
  diet: {
    heavyMeat: 3300,    
    mediumMeat: 2500,   
    vegetarian: 1700,   
    vegan: 1500,        
  },

  
  consumption: {
    highConsumer: 1200,  
    averageConsumer: 600, 
    lowWaste: 200,       
  }
};


export function calculateTransportEmissions({
  drivingDistance = 0, 
  vehicleType = 'petrolCar', 
  transitDistance = 0, 
  flightHours = 0, 
}) {
  const annualDrivingDistance = drivingDistance * 52;
  const annualTransitDistance = transitDistance * 52;

  let carEmissions = 0;
  if (vehicleType !== 'none' && EMISSION_FACTORS.transport[vehicleType]) {
    carEmissions = annualDrivingDistance * EMISSION_FACTORS.transport[vehicleType];
  }

  const transitEmissions = annualTransitDistance * EMISSION_FACTORS.transport.publicTransit;
  const flightEmissions = flightHours * EMISSION_FACTORS.transport.flightHour;

  return {
    car: Math.round(carEmissions),
    transit: Math.round(transitEmissions),
    flights: Math.round(flightEmissions),
    total: Math.round(carEmissions + transitEmissions + flightEmissions)
  };
}


export function calculateEnergyEmissions({
  electricityKwh = 0, 
  gasBill = 0, 
  renewablePercentage = 0, 
}) {
  const annualKwh = electricityKwh * 12;
  const annualGasTherms = gasBill * 12;

  
  let electricityEmissions = annualKwh * EMISSION_FACTORS.energy.electricityKwh;
  
  const renewableOffset = electricityEmissions * (renewablePercentage / 100);
  electricityEmissions = Math.max(0, electricityEmissions - renewableOffset);

  const gasEmissions = annualGasTherms * EMISSION_FACTORS.energy.gasTherm;

  return {
    electricity: Math.round(electricityEmissions),
    gas: Math.round(gasEmissions),
    total: Math.round(electricityEmissions + gasEmissions)
  };
}


export function calculateDietEmissions({
  dietType = 'mediumMeat', 
  localFoodRatio = 'sometimes', 
}) {
  let dietEmissions = EMISSION_FACTORS.diet[dietType] || EMISSION_FACTORS.diet.mediumMeat;

  
  let localMultiplier = 1.0;
  if (localFoodRatio === 'always') localMultiplier = 0.90; 
  else if (localFoodRatio === 'sometimes') localMultiplier = 0.97; 

  return {
    total: Math.round(dietEmissions * localMultiplier)
  };
}


export function calculateConsumptionEmissions({
  shoppingHabits = 'averageConsumer', 
  recyclingPercentage = 0, 
}) {
  const baseEmissions = EMISSION_FACTORS.consumption[shoppingHabits] || EMISSION_FACTORS.consumption.averageConsumer;
  
  
  const recyclingOffset = (recyclingPercentage / 100) * 150;
  
  return {
    total: Math.max(50, Math.round(baseEmissions - recyclingOffset))
  };
}


export function calculateFootprint(inputs) {
  const transport = calculateTransportEmissions(inputs.transport || {});
  const energy = calculateEnergyEmissions(inputs.energy || {});
  const diet = calculateDietEmissions(inputs.diet || {});
  const consumption = calculateConsumptionEmissions(inputs.consumption || {});

  const total = transport.total + energy.total + diet.total + consumption.total;

  return {
    breakdown: {
      transport: transport.total,
      energy: energy.total,
      diet: diet.total,
      consumption: consumption.total
    },
    details: {
      transport,
      energy,
      diet,
      consumption
    },
    total, 
    totalTons: parseFloat((total / 1000).toFixed(2)) 
  };
}


export const COMPARISON_BASELINES = {
  globalAverage: 4.8, 
  usAverage: 16.0,    
  targetGoal: 2.0,    
};
