// The shareable demo runs without Firebase sign-in.
export const isDemo = import.meta.env.MODE === "demo";

// A Claude artifact only passes a plain #name in its address, so that build keeps navigation
// in memory. Everywhere else the address bar and the back button work as usual.
export const keepAddressBar = isDemo && import.meta.env.VITE_DEMO_TARGET === "artifact";
