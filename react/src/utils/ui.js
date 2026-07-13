// Reused wherever a scrollable box needs to hide its scrollbar
// (still scrolls with mouse/trackpad, just doesn't show the bar).
export const HIDE_SCROLLBAR = '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';