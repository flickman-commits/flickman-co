/**
 * Geo helpers for the dual-timezone mini map.
 *
 * Coords are [lat, lng]. SVG viewBox is 360×180 — equirectangular
 * projection, so x = lng + 180 and y = 90 - lat.
 */

export const TZ_COORDS: Record<string, [number, number]> = {
  "America/New_York": [40.71, -74.01],
  "America/Chicago": [41.88, -87.63],
  "America/Denver": [39.74, -104.99],
  "America/Los_Angeles": [34.05, -118.24],
  "America/Anchorage": [61.22, -149.9],
  "America/Honolulu": [21.31, -157.86],
  "America/Toronto": [43.65, -79.38],
  "America/Vancouver": [49.28, -123.12],
  "America/Mexico_City": [19.43, -99.13],
  "America/Sao_Paulo": [-23.55, -46.63],
  "Europe/London": [51.51, -0.13],
  "Europe/Paris": [48.85, 2.35],
  "Europe/Berlin": [52.52, 13.41],
  "Europe/Madrid": [40.42, -3.7],
  "Europe/Amsterdam": [52.37, 4.9],
  "Europe/Stockholm": [59.33, 18.07],
  "Europe/Athens": [37.98, 23.73],
  "Africa/Cairo": [30.04, 31.24],
  "Africa/Johannesburg": [-26.2, 28.05],
  "Asia/Dubai": [25.2, 55.27],
  "Asia/Karachi": [24.86, 67.01],
  "Asia/Kolkata": [22.57, 88.36],
  "Asia/Bangkok": [13.76, 100.5],
  "Asia/Shanghai": [31.23, 121.47],
  "Asia/Hong_Kong": [22.32, 114.17],
  "Asia/Singapore": [1.35, 103.82],
  "Asia/Tokyo": [35.68, 139.65],
  "Asia/Seoul": [37.57, 126.98],
  "Australia/Sydney": [-33.87, 151.21],
  "Pacific/Auckland": [-36.85, 174.76],
};

export function coordsFor(tz: string): [number, number] {
  return TZ_COORDS[tz] ?? [0, 0];
}

export function project(lat: number, lng: number): { x: number; y: number } {
  return { x: lng + 180, y: 90 - lat };
}

/**
 * Stylized continent silhouettes — hand-coded polygons in [lng, lat] pairs.
 * Not geographically precise; tuned to be recognizable at small sizes and
 * to read well against Clay's cream canvas.
 */
const CONTINENTS: Array<{ name: string; points: Array<[number, number]> }> = [
  {
    name: "NorthAmerica",
    points: [
      [-168, 65], [-150, 71], [-128, 73], [-100, 73], [-80, 72],
      [-62, 60], [-55, 48], [-68, 44], [-78, 36], [-82, 28],
      [-92, 19], [-105, 18], [-114, 27], [-125, 38], [-135, 50],
      [-155, 55], [-170, 60],
    ],
  },
  {
    name: "SouthAmerica",
    points: [
      [-78, 12], [-66, 10], [-52, 4], [-40, -2], [-35, -12],
      [-39, -25], [-50, -38], [-64, -52], [-71, -54], [-72, -42],
      [-76, -28], [-80, -10], [-80, 0],
    ],
  },
  {
    name: "Europe",
    points: [
      [-10, 58], [-2, 64], [12, 68], [25, 70], [38, 64],
      [40, 56], [32, 46], [18, 40], [4, 38], [-8, 42], [-12, 50],
    ],
  },
  {
    name: "Africa",
    points: [
      [-15, 32], [-2, 30], [12, 32], [28, 32], [40, 18],
      [50, 12], [52, 0], [44, -18], [32, -32], [22, -34],
      [12, -22], [4, -10], [-8, 4], [-16, 14], [-18, 24],
    ],
  },
  {
    name: "Asia",
    points: [
      [30, 70], [60, 73], [95, 75], [140, 72], [165, 65],
      [170, 55], [148, 40], [132, 22], [120, 8], [108, 12],
      [98, 25], [82, 28], [70, 25], [58, 38], [44, 42],
      [32, 50], [28, 60],
    ],
  },
  {
    name: "India",
    points: [
      [70, 32], [82, 32], [90, 26], [88, 18], [80, 10],
      [72, 16], [69, 24],
    ],
  },
  {
    name: "SE-Asia",
    points: [
      [98, 18], [108, 16], [114, 6], [108, -2], [100, 0], [96, 8],
    ],
  },
  {
    name: "Australia",
    points: [
      [115, -15], [128, -12], [145, -14], [154, -22], [149, -34],
      [138, -38], [122, -36], [115, -28],
    ],
  },
  // Decorative small islands to add density.
  {
    name: "UK",
    points: [
      [-6, 55], [-1, 58], [2, 54], [-2, 50], [-6, 52],
    ],
  },
  {
    name: "Japan",
    points: [
      [136, 38], [141, 38], [143, 32], [138, 32], [136, 36],
    ],
  },
  {
    name: "Madagascar",
    points: [
      [44, -14], [49, -16], [50, -22], [46, -25], [43, -20],
    ],
  },
  {
    name: "NewZealand",
    points: [
      [170, -36], [175, -38], [176, -44], [171, -45], [169, -41],
    ],
  },
  {
    name: "Indonesia",
    points: [
      [98, -2], [108, 0], [118, -2], [122, -6], [114, -8],
      [104, -6], [98, -4],
    ],
  },
];

export function continentPathStrings(): string[] {
  return CONTINENTS.map((c) => {
    const cmds = c.points.map(([lng, lat], i) => {
      const { x, y } = project(lat, lng);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return cmds.join(" ") + " Z";
  });
}
