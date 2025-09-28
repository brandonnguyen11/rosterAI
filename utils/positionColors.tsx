// utils/positionColors.ts

// Predefined neon palette
const positionColors: { [key: string]: string } = {
  QB: "#6dff01", // neon green
  RB: "#ff006e", // neon pink/red
  WR: "#00f0ff", // electric cyan
  TE: "#ff9d00", // neon orange
  K:  "#ffe600", // neon yellow
  DEF: "#8000ff", // neon purple
  FLEX: "#00ff85", // neon mint
  COACH: "#ff3cff", // neon magenta
};

// fallback for unknown positions
const defaultColor = "#20FC8F";

// helper function to get a color for any position
export const getPositionColor = (position: string): string => {
  if (!position) return defaultColor;
  const key = position.toUpperCase();
  return positionColors[key] || defaultColor;
};
