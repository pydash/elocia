export interface StageItem {
  globalId: number;
  name: string;
}

export interface Stage {
  id: number;
  title: string;
  description: string;
  items: StageItem[];
}

export interface Unit {
  id: number;
  title: string;
  stages: Stage[];
}

export interface Section {
  id: number;
  title: string;
  units: Unit[];
}

// Dynamic curriculum cache (starts empty for fresh start until teacher publishes lessons)
export const CURRICULUM: Section[] = [];

export function getStageData(stageId: number, dynamicCurriculum?: Section[] | null): Stage | null {
  const source = (dynamicCurriculum && dynamicCurriculum.length > 0) ? dynamicCurriculum : CURRICULUM;
  for (const section of source) {
    for (const unit of section.units) {
      for (const stage of unit.stages) {
        if (stage.id === stageId) {
          return stage;
        }
      }
    }
  }
  return null;
}
