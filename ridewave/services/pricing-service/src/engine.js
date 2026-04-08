export function surgeFromRatio(ratio) {
  if (ratio < 1.5) return 1;
  if (ratio < 2.5) return 1.25;
  if (ratio < 4) return 1.5;
  return 2;
}

export function calculateFare({ distanceKm, durationMin, vehicleType, surge }) {
  const baseFareByVehicle = {
    Economy: 120,
    Comfort: 180,
    XL: 260
  };

  const baseRate = baseFareByVehicle[vehicleType] || baseFareByVehicle.Economy;
  const base = baseRate + distanceKm * 70 + durationMin * 12;
  const total = Number((base * surge).toFixed(2));

  return {
    base: Number(base.toFixed(2)),
    surge,
    total,
    currency: "LKR"
  };
}
