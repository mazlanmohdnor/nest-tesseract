export class XMLResponse {
  annotation: Annotation;
  constructor() {
    this.annotation = new Annotation();
  }
}

export class Annotation {
  folder: string[];
  filename: string[];
  path: string[];
  source: Source[];
  size: Size[];
  segmented: string[];
  object: ObjectBox[];
  constructor() {
    this.folder = [];
    this.filename = [];
    this.path = [];
    this.source = [new Source()];
    this.size = [new Size()];
    this.segmented = [];
    this.object = [new ObjectBox()];
  }
}

export class ObjectBox {
  name: string[];
  pose: string[];
  truncated: string[];
  difficult: string[];
  bndbox: Bndbox[];
  constructor() {
    this.name = [];
    this.pose = [];
    this.truncated = [];
    this.difficult = [];
    this.bndbox = [new Bndbox()];
  }
}

export class Bndbox {
  xmin: string[];
  ymin: string[];
  xmax: string[];
  ymax: string[];

  constructor() {
    this.xmin = [];
    this.ymin = [];
    this.xmax = [];
    this.ymax = [];
  }
}

export class Size {
  width: string[];
  height: string[];
  depth: string[];
  constructor() {
    this.width = [];
    this.height = [];
    this.depth = [];
  }
}

export class Source {
  database: string[];

  constructor() {
    this.database = [];
  }
}
