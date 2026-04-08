function toRad(value) {
  return (value * Math.PI) / 180;
}

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function matchNearestDriver(pickup, drivers) {
  if (!drivers.length) return null;
  const sorted = [...drivers].sort((d1, d2) => haversineKm(pickup, d1) - haversineKm(pickup, d2));
  return sorted[0];
}
