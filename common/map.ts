export const MAP_BOUNDARIES = {
  top: -400,
  left: -450,
  bottom: 1450,
  right: 550,
};

export const MAP_WIDTH = MAP_BOUNDARIES.right - MAP_BOUNDARIES.left;
export const MAP_HEIGHT = MAP_BOUNDARIES.bottom - MAP_BOUNDARIES.top;

// Tile is 104x105
export const MAP = [
  // Top base
  {
    x: -156,
    y: -156,
    width: 52,
    height: 312,
  },
  {
    x: -156,
    y: -156,
    width: 468,
    height: 52,
  },
  {
    x: 260,
    y: -156,
    width: 52,
    height: 312,
  },

  // Blockades
  {
    x: -104,
    y: 780,
    width: 104,
    height: 52,
  },
  {
    x: 104,
    y: 624,
    width: 104,
    height: 52,
  },
  {
    x: -104,
    y: 468,
    width: 104,
    height: 52,
  },
  {
    x: 104,
    y: 312,
    width: 104,
    height: 52,
  },

  // Bottom base
  {
    x: -156,
    y: 936,
    width: 52,
    height: 312,
  },
  {
    x: -156,
    y: 1196,
    width: 468,
    height: 52,
  },
  {
    x: 260,
    y: 936,
    width: 52,
    height: 312,
  },
];
