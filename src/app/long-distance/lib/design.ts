/**
 * Design tokens for the long-distance app — mirrors DESIGN.md (Clay).
 * Scope: just this app. flickman.co's main site and other apps keep their
 * own design systems.
 *
 * Source: ./DESIGN.md
 */

export const tokens = {
  color: {
    /* surfaces */
    canvas: "#fffaf0",
    surfaceSoft: "#faf5e8",
    surfaceCard: "#f5f0e0",
    surfaceStrong: "#ebe6d6",
    /* ink */
    ink: "#0a0a0a",
    body: "#3a3a3a",
    bodyStrong: "#1a1a1a",
    muted: "#6a6a6a",
    mutedSoft: "#9a9a9a",
    hairline: "#e5e5e5",
    hairlineSoft: "#f0f0f0",
    /* primary CTA */
    primary: "#0a0a0a",
    primaryActive: "#1f1f1f",
    primaryDisabled: "#e5e5e5",
    onPrimary: "#ffffff",
    onDark: "#ffffff",
    /* saturated feature-card palette */
    brandPink: "#ff4d8b",
    brandTeal: "#1a3a3a",
    brandLavender: "#b8a4ed",
    brandPeach: "#ffb084",
    // Softened from the original Clay ochre (#e8b94a) — too mustard. This is a
    // gentler pale-gold that still reads as "saturated card" without feeling
    // dingy on the flight tracker card.
    brandOchre: "#F5DD8A",
    brandMint: "#a4d4c5",
    brandCoral: "#ff6b5a",
  },
  radius: {
    xs: "6px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    pill: "9999px",
  },
  space: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    section: 96,
  },
  // Plain Black is licensed to Clay; Inter weight 500 + negative letter-spacing
  // is the documented open substitute.
  fontFamily:
    "Inter, var(--font-body), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

/** Pre-baked text styles from DESIGN.md. */
export const type = {
  displayXl: {
    fontSize: 72,
    fontWeight: 500 as const,
    lineHeight: 1,
    letterSpacing: -2.5,
  },
  displayLg: {
    fontSize: 56,
    fontWeight: 500 as const,
    lineHeight: 1.05,
    letterSpacing: -2,
  },
  displayMd: {
    fontSize: 40,
    fontWeight: 500 as const,
    lineHeight: 1.1,
    letterSpacing: -1,
  },
  displaySm: {
    fontSize: 32,
    fontWeight: 500 as const,
    lineHeight: 1.15,
    letterSpacing: -0.5,
  },
  titleLg: {
    fontSize: 24,
    fontWeight: 600 as const,
    lineHeight: 1.3,
    letterSpacing: -0.3,
  },
  titleMd: { fontSize: 18, fontWeight: 600 as const, lineHeight: 1.4 },
  titleSm: { fontSize: 16, fontWeight: 600 as const, lineHeight: 1.4 },
  bodyMd: { fontSize: 16, fontWeight: 400 as const, lineHeight: 1.55 },
  bodySm: { fontSize: 14, fontWeight: 400 as const, lineHeight: 1.55 },
  caption: { fontSize: 13, fontWeight: 500 as const, lineHeight: 1.4 },
  captionUppercase: {
    fontSize: 12,
    fontWeight: 600 as const,
    lineHeight: 1.4,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
  },
  button: { fontSize: 14, fontWeight: 600 as const, lineHeight: 1 },
};
