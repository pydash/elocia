interface StageItem {
  globalId: number;
  name: string;
}

interface Stage {
  id: number;
  title: string;
  description: string;
  items: StageItem[];
}

interface Unit {
  id: number;
  title: string;
  stages: Stage[];
}

interface Section {
  id: number;
  title: string;
  units: Unit[];
}

export interface Curriculum {
  sections: Section[];
}
