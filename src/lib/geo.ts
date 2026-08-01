// Geo helpers with no external dependencies, so the scoring engine stays
// lightweight and independently testable.

function toRad(x: number) {
  return (x * Math.PI) / 180;
}

/** Great-circle distance in km between two lat/lng points. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function pilotCentre() {
  return {
    lat: Number(process.env.PILOT_CENTER_LAT ?? "53.4808"),
    lng: Number(process.env.PILOT_CENTER_LNG ?? "-2.2426"),
    radiusKm: Number(process.env.PILOT_RADIUS_KM ?? "15"),
  };
}

/** Is a coordinate inside the current pilot service area? */
export function isInPilotArea(lat?: number | null, lng?: number | null): boolean {
  if (lat == null || lng == null) return false;
  const c = pilotCentre();
  return haversineKm(lat, lng, c.lat, c.lng) <= c.radiusKm;
}
