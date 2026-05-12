/**
 * Design tokens for the handwriting app — mirrors DESIGN.md (Airbnb).
 * Scope: just this app. flickman.co's main site keeps its own look.
 *
 * Source: ./DESIGN.md
 */

export const tokens = {
  color: {
    primary: "#ff385c",
    primaryActive: "#e00b41",
    primaryDisabled: "#ffd1da",
    ink: "#222222",
    body: "#3f3f3f",
    muted: "#6a6a6a",
    mutedSoft: "#929292",
    hairline: "#dddddd",
    hairlineSoft: "#ebebeb",
    canvas: "#ffffff",
    surfaceSoft: "#f7f7f7",
    surfaceStrong: "#f2f2f2",
    onPrimary: "#ffffff",
    errorText: "#c13515",
  },
  radius: {
    none: "0px",
    xs: "4px",
    sm: "8px",
    md: "14px",
    lg: "20px",
    xl: "32px",
    full: "9999px",
  },
  space: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    section: 64,
  },
  /** Single shadow tier from DESIGN.md — used on dropdowns + hovered cards. */
  shadowSoft:
    "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 4px 8px 0",
  /** Font stack — Inter is the documented open-source fallback for Cereal VF. */
  fontFamily:
    "'Airbnb Cereal VF', Circular, Inter, -apple-system, system-ui, Roboto, 'Helvetica Neue', sans-serif",
};

/** Pre-baked text styles for the most common type tokens. */
export const type = {
  displayXl: { fontSize: 28, fontWeight: 700, lineHeight: 1.18, letterSpacing: 0 },
  displayLg: { fontSize: 22, fontWeight: 500, lineHeight: 1.18, letterSpacing: -0.44 },
  displaySm: { fontSize: 20, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.18 },
  titleMd: { fontSize: 16, fontWeight: 600, lineHeight: 1.25 },
  bodyMd: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
  bodySm: { fontSize: 14, fontWeight: 400, lineHeight: 1.43 },
  caption: { fontSize: 14, fontWeight: 500, lineHeight: 1.29 },
  captionSm: { fontSize: 13, fontWeight: 400, lineHeight: 1.23 },
  badge: { fontSize: 11, fontWeight: 600, lineHeight: 1.18 },
  uppercaseTag: {
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: 0.4,
    textTransform: "uppercase" as const,
  },
  buttonMd: { fontSize: 16, fontWeight: 500, lineHeight: 1.25 },
} as const;
