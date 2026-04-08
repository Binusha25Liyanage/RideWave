import { haversineKm, matchNearestDriver } from "../src/lib/matching.js";

describe("driver matching", () => {
  test("returns nearest driver", () => {
    const pickup = { lat: 6.9271, lng: 79.8612 };
    const drivers = [
      { id: "d1", lat: 6.95, lng: 79.86 },
      { id: "d2", lat: 6.9272, lng: 79.8613 },
      { id: "d3", lat: 6.88, lng: 79.82 }
    ];

    const nearest = matchNearestDriver(pickup, drivers);
    expect(nearest.id).toBe("d2");
  });

  test("distance is positive", () => {
    const km = haversineKm({ lat: 6.9, lng: 79.8 }, { lat: 7.0, lng: 79.9 });
    expect(km).toBeGreaterThan(0);
  });
});
