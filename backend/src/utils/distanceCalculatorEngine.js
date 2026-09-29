const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_MILES = 3958.8;

const toRad = (deg) => (deg * Math.PI) / 180;

export const calculateHaversineDistance = (lat1, lon1, lat2, lon2, unit = 'km') => {
  const p1Lat = Number(lat1);
  const p1Lon = Number(lon1);
  const p2Lat = Number(lat2);
  const p2Lon = Number(lon2);

  if (isNaN(p1Lat) || isNaN(p1Lon) || isNaN(p2Lat) || isNaN(p2Lon)) {
    return 0;
  }

  
  if (p1Lat === p2Lat && p1Lon === p2Lon) {
    return 0;
  }

  const dLat = toRad(p2Lat - p1Lat);
  const dLon = toRad(p2Lon - p1Lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1Lat)) * Math.cos(toRad(p2Lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const radius = unit === 'miles' ? EARTH_RADIUS_MILES : EARTH_RADIUS_KM;

  const distance = radius * c;
  return Number(distance.toFixed(2));
};

export const calculateTravelTimeMinutes = (distanceKm, mode = 'emergency') => {
  const d = Math.max(0, Number(distanceKm) || 0);
  if (d === 0) return 1;

  
  let avgSpeed = 40; 
  let baseFriction = 3; 

  if (mode === 'emergency') {
    avgSpeed = 55; 
    baseFriction = 1;
  } else if (mode === 'transit') {
    avgSpeed = 25; 
    baseFriction = 8;
  }

  const travelMinutes = (d / avgSpeed) * 60 + baseFriction;
  return Math.max(1, Math.round(travelMinutes));
};

export const isWithinRadius = (lat1, lon1, lat2, lon2, radiusKm) => {
  const dist = calculateHaversineDistance(lat1, lon1, lat2, lon2, 'km');
  return dist <= radiusKm;
};

export const getBoundingBox = (centerLat, centerLon, radiusKm) => {
  const latDelta = radiusKm / 111; 
  const lonDelta = radiusKm / (111 * Math.cos(toRad(centerLat)));

  return {
    minLat: centerLat - latDelta,
    maxLat: centerLat + latDelta,
    minLon: centerLon - lonDelta,
    maxLon: centerLon + lonDelta,
  };
};
