// Beta features gate — off by default for all current users.
// Flip NEXT_PUBLIC_ENABLE_BETA_FEATURES=true in the environment to evaluate them.
export const ENABLE_BETA_FEATURES = process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES === "true";
