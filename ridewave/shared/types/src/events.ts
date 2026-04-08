export type RideRequestedEvent = {
  rideId: string;
  riderId: string;
  pickup: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  vehicleType: string;
  estimatedFare: number;
  timestamp: string;
};

export type RideAcceptedEvent = {
  rideId: string;
  riderId: string;
  driverId: string;
  driver: { name: string; phone: string; vehicle: string; plate: string; lat: number; lng: number };
  etaMinutes: number;
  timestamp: string;
};

export type RideCompletedEvent = {
  rideId: string;
  riderId: string;
  driverId: string;
  fare: { base: number; surge: number; tip?: number; total: number };
  distanceKm: number;
  durationMin: number;
  timestamp: string;
};

export type LocationUpdateEvent = {
  driverId: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: string;
};
