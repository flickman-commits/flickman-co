/**
 * Pre-computed world geography for the dual-time mini map.
 *
 * Source: Natural Earth via the `world-atlas` package (110m countries).
 * Renders once at module-load with d3-geo, producing two SVG path strings:
 *
 *   • LAND_PATH    — single combined path of every country, used for fill
 *                    (continents read as solid landmasses)
 *   • BORDER_PATH  — hair-thin country borders between neighbors, used as
 *                    a subtle stroke on top of the fill for realism
 *
 * Projection: equirectangular into a 360 × 180 viewBox, so the SVG matches
 * the equivalent project(lat, lng) used to place pins (lib/geo.ts).
 */
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
// world-atlas ships JSON without TS types — import then cast at the topojson
// boundary. Next/TS treats JSON modules as `any` which is fine here.
import countries110m from "world-atlas/countries-110m.json";

/* eslint-disable @typescript-eslint/no-explicit-any */
const topology = countries110m as any;
const countriesGeo = topology.objects.countries;

const projection = geoEquirectangular()
  // Center the projection so lng=0,lat=0 → viewBox center (180, 90)
  .translate([180, 90])
  // Scale so 1° ≈ 1 unit (full world fills 360 × 180)
  .scale(180 / Math.PI);

const path = geoPath(projection);

const countriesFeature = feature(topology, countriesGeo) as any;
const bordersGeom = mesh(topology, countriesGeo, (a: any, b: any) => a !== b);

export const LAND_PATH = path(countriesFeature) ?? "";
export const BORDER_PATH = path(bordersGeom) ?? "";
/* eslint-enable @typescript-eslint/no-explicit-any */
