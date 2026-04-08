import { calculateFare, surgeFromRatio } from "../src/engine.js";

describe("pricing engine", () => {
  test("applies surge tiers correctly", () => {
    expect(surgeFromRatio(1.49)).toBe(1);
    expect(surgeFromRatio(1.5)).toBe(1.25);
    expect(surgeFromRatio(2.7)).toBe(1.5);
    expect(surgeFromRatio(5)).toBe(2);
  });

  test("calculates fare breakdown", () => {
    const fare = calculateFare({ distanceKm: 10, durationMin: 20, vehicleType: "Economy", surge: 1.25 });
    expect(fare.base).toBe(1060);
    expect(fare.total).toBe(1325);
    expect(fare.currency).toBe("LKR");
  });
});
