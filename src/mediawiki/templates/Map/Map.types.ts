export type Coordinate = {
  x: number;
  y: number;
  plane?: number;
};

export interface MapParams {
  name?: string;
  // Supports three coordinate formats:
  // 1. Single coordinate object: { x: 1234, y: 5678, plane: 0 }
  // 2. Array of coordinates: [{ x: 1234, y: 5678 }, { x: 6789, y: 1123 }]
  coordinates?: Coordinate | Coordinate[];
  // Legacy support for single x/y/plane
  x?: number;
  y?: number;
  plane?: number;
  mapID?: number;
  mtype?: string;
  width?: number;
  height?: number;
  zoom?: number;
  label?: string;
  link?: string;
  description?: string;
}
