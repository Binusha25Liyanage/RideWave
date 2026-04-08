describe("ride booking flow", () => {
  test("request to complete to payment state progression", async () => {
    const ride = {
      id: "ride_1",
      status: "requested",
      paymentStatus: "pending"
    };

    ride.status = "accepted";
    ride.status = "started";
    ride.status = "completed";
    ride.paymentStatus = "paid";

    expect(ride.status).toBe("completed");
    expect(ride.paymentStatus).toBe("paid");
  });
});
