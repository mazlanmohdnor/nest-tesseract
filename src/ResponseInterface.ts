export interface XMLResponse {
  annotation: Annotation;
}

export interface Annotation {
  folder: string[];
  filename: string[];
  path: string[];
  source: Source[];
  size: Size[];
  segmented: string[];
  object: ObjectBox[];
}

export interface ObjectBox {
  name: string[];
  pose: string[];
  truncated: string[];
  difficult: string[];
  bndbox: Bndbox[];
}

export interface Bndbox {
  xmin: string[];
  ymin: string[];
  xmax: string[];
  ymax: string[];
}

export interface Size {
  width: string[];
  height: string[];
  depth: string[];
}

export interface Source {
  database: string[];
}
