import type {
  Curriculum,
  Section,
  Stage,
  Unit,
} from "@/interfaces/curriculum.interface";

const API_BASE_URL = "http://localhost:8000";

export async function fetchCurriculums(): Promise<Curriculum[]> {
  const response: Response = await fetch(`${API_BASE_URL}/curriculums`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error: { detail?: string } | null = await response
      .json()
      .catch(() => null);

    throw new Error(error?.detail ?? "Failed to fetch curriculums");
  }

  const data: Curriculum[] = await response.json();

  return data;
}

export async function createCurriculum(
  curriculum: Omit<Curriculum, "id" | "created_at" | "updated_at">,
): Promise<Curriculum> {
  const response: Response = await fetch(`${API_BASE_URL}/curriculums`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(curriculum),
  });

  if (!response.ok) {
    const error: { detail?: string } | null = await response
      .json()
      .catch(() => null);

    throw new Error(error?.detail ?? "Failed to create curriculum");
  }

  const data: Curriculum = await response.json();

  return data;
}

export async function fetchSectionsByCurriculumId(
  curriculumId: string,
): Promise<Section[]> {
  const response: Response = await fetch(
    `${API_BASE_URL}/curriculums/${curriculumId}/sections`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const error: { detail?: string } | null = await response
      .json()
      .catch(() => null);

    throw new Error(error?.detail ?? "Failed to fetch sections");
  }

  const data: Section[] = await response.json();

  return data;
}

export async function createSection(
  curriculumId: string,
  section: Omit<Section, "id" | "curriculum_id" | "created_at" | "updated_at">,
): Promise<Section> {
  const response: Response = await fetch(
    `${API_BASE_URL}/curriculums/${curriculumId}/sections`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(section),
    },
  );

  if (!response.ok) {
    const error: { detail?: string } | null = await response
      .json()
      .catch(() => null);

    throw new Error(error?.detail ?? "Failed to create section");
  }

  const data: Section = await response.json();

  return data;
}

export async function fetchUnitsBySectionId(
  sectionId: string,
): Promise<Unit[]> {
  const response: Response = await fetch(
    `${API_BASE_URL}/curriculum-sections/${sectionId}/units`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const error: { detail?: string } | null = await response
      .json()
      .catch(() => null);

    throw new Error(error?.detail ?? "Failed to fetch units");
  }

  const data: Unit[] = await response.json();

  return data;
}

export async function createUnit(
  sectionId: string,
  unit: Omit<Unit, "id" | "section_id" | "created_at" | "updated_at">,
): Promise<Unit> {
  const response: Response = await fetch(
    `${API_BASE_URL}/curriculum-sections/${sectionId}/units`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(unit),
    },
  );

  if (!response.ok) {
    const error: { detail?: string } | null = await response
      .json()
      .catch(() => null);

    throw new Error(error?.detail ?? "Failed to create unit");
  }

  const data: Unit = await response.json();

  return data;
}

export async function fetchStagesByUnitId(unitId: string): Promise<Stage[]> {
  const response: Response = await fetch(
    `${API_BASE_URL}/curriculum-units/${unitId}/stages`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const error: { detail?: string } | null = await response
      .json()
      .catch(() => null);

    throw new Error(error?.detail ?? "Failed to fetch stages");
  }

  const data: Stage[] = await response.json();

  return data;
}

export async function createStage(
  unitId: string,
  stage: {
    stage_number: number;
    title: string;
    description?: string;
  },
): Promise<Stage> {
  const response: Response = await fetch(
    `${API_BASE_URL}/curriculum-units/${unitId}/stages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(stage),
    },
  );

  if (!response.ok) {
    const error: { detail?: string } | null = await response
      .json()
      .catch(() => null);

    throw new Error(error?.detail ?? "Failed to create stage");
  }

  const data: Stage = await response.json();

  return data;
}

export async function uploadStageBaseline(
  stageId: number,
  signName: string,
  video: File,
  gradeLevel: number,
  description?: string,
): Promise<void> {
  const formData = new FormData();
  formData.append("video", video);
  formData.append("sign_name", signName);
  formData.append("stage_id_new", String(stageId));
  formData.append("grade_level", String(gradeLevel));
  if (description) {
    formData.append("description", description);
  }

  const response = await fetch(`${API_BASE_URL}/baselines/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error: { detail?: string } | null = await response
      .json()
      .catch(() => null);

    throw new Error(error?.detail ?? "Failed to upload stage video");
  }
}
