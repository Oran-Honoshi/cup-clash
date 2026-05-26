// Shared accessibility primitives.
// Single source of truth for focus styling so every interactive element
// in the product surface (buttons, links, clickable rows, tab triggers,
// drawer close affordances) shows the same keyboard-focus halo against
// the stadium-dark body color.

/**
 * Standard focus ring for interactive elements that have room around them
 * (buttons, links, full-width cards). Visible only on keyboard focus.
 */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C16]";

/**
 * Inset variant for elements flush against a panel edge (list rows inside a
 * card, tabs in a strip). The ring sits inside the element's box instead of
 * extending past it.
 */
export const FOCUS_RING_INSET =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan/60";
