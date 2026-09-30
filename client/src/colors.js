/* Colour names → swatch values, so colour dots and chips read as real leather tones. */
export const SWATCHES = {
  black: "#1c1410", brown: "#4a2f1d", "dark brown": "#3a2313", chocolate: "#4d3120",
  tan: "#b98b5e", camel: "#c19a6b", cognac: "#8a4b23", natural: "#c9a97e",
  beige: "#d8c3a5", cream: "#ece0cb", white: "#f3ece0", burgundy: "#5c1f24",
  maroon: "#5c1f24", red: "#8f2a26", green: "#3f5340", olive: "#5a5c35",
  navy: "#22304a", blue: "#2c3f5c", grey: "#6b6b6b", gray: "#6b6b6b",
  gold: "#b98d47", mustard: "#c79a3f",
};

export const swatchOf = (name) => SWATCHES[String(name || "").trim().toLowerCase()] || "#a98a63";
