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

export const CURRICULUM: Section[] = [
  {
    id: 1,
    title: "SECTION 1",
    units: [
      {
        id: 1,
        title: "UNIT 1",
        stages: [
          {
            id: 1,
            title: "Numbers 1-10",
            description: "Let's dive into sign language using numbers 1 to 10.",
            items: [
              { globalId: 1, name: "1" },
              { globalId: 2, name: "2" },
              { globalId: 3, name: "3" },
              { globalId: 4, name: "4" },
              { globalId: 5, name: "5" },
              { globalId: 6, name: "6" },
              { globalId: 7, name: "7" },
              { globalId: 8, name: "8" },
              { globalId: 9, name: "9" },
              { globalId: 10, name: "10" },
            ]
          },
          {
            id: 2,
            title: "Numbers 11-20",
            description: "Keep counting with numbers 11 to 20.",
            items: [
              { globalId: 11, name: "11" },
              { globalId: 12, name: "12" },
              { globalId: 13, name: "13" },
              { globalId: 14, name: "14" },
              { globalId: 15, name: "15" },
              { globalId: 16, name: "16" },
              { globalId: 17, name: "17" },
              { globalId: 18, name: "18" },
              { globalId: 19, name: "19" },
              { globalId: 20, name: "20" },
            ]
          }
        ]
      },
      {
        id: 2,
        title: "UNIT 2",
        stages: [
          {
            id: 3,
            title: "Alphabet A-J",
            description: "Learn the first letters of the alphabet.",
            items: [
              { globalId: 21, name: "A" },
              { globalId: 22, name: "B" },
              { globalId: 23, name: "C" },
            ]
          }
        ]
      }
    ]
  }
];

export function getStageData(stageId: number): Stage | null {
  for (const section of CURRICULUM) {
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

