export interface PuzzleConfig {
  id: string;
  title: string;
  description: string;
  imageFolder: string; // e.g. "/Symbols"
  imageFiles: string[]; // e.g. ["cf1.avif", "cf2.avif", ...]
  correctOrder: string[]; // e.g. ["cf1", "cf2", ..., "cf8"] (order of fragment ids matching correct sequence)
  gridCols: number; // e.g. 4
  gridRows: number; // e.g. 2
}

export interface SortableItem {
  id: string; // e.g. "cf1"
  fileName: string; // e.g. "cf1.avif"
  url: string; // e.g. "/Symbols/cf1.avif"
}
