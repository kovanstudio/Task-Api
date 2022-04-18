import randomstring from "randomstring";

export const waitFor = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const randomData = (count: number) => {
  const bikes = [];

  const is_reserved = [true, false, 1, 0, 0, 0];

  for (let i = 0; i < count; i++) {
    const point = generateRandomPoint({ lat: 39.925533, lng: 32.866287 }, 200);

    const bike_id = randomstring.generate({
      length: 5,
      capitalization: "uppercase",
    });

    const element = {
      bike_id,
      lat: point.lat,
      lon: point.lng,
      is_reserved: is_reserved[Math.floor(Math.random() * is_reserved.length)],
      is_disabled: is_reserved[Math.floor(Math.random() * is_reserved.length)],
      vehicle_type: Math.floor(Math.random() * 3) > 1 ? "bike" : "scooter",
      total_bookings:
        Math.floor(Math.random() * 3) > 1
          ? Math.floor(Math.random() * 13).toString()
          : Math.floor(Math.random() * 13),
      android: "https://deeplink.helbiz.com/startRide?code=" + bike_id,
      ios: "https://deeplink.helbiz.com/startRide?code=" + bike_id,
    };

    bikes.push(element);
  }

  return {
    last_updated: Date.now(),
    ttl: Math.floor(Math.random() * 41) + 20,
    data: { bikes },
  };
};

function generateRandomPoint(
  center: { lat: number; lng: number },
  radius: number
) {
  var x0 = center.lng;
  var y0 = center.lat;
  // Convert Radius from meters to degrees.
  var rd = radius / 111300;

  var u = Math.random();
  var v = Math.random();

  var w = rd * Math.sqrt(u);
  var t = 2 * Math.PI * v;
  var x = w * Math.cos(t);
  var y = w * Math.sin(t);

  var xp = x / Math.cos(y0);

  // Resulting point.
  return { lat: y + y0, lng: xp + x0 };
}
