from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# ── Stage Schemas ─────────────────────────────────────────────────────────────
class StageBase(BaseModel):
    stage_number: int
    title: str
    description: Optional[str] = None

class StageCreate(StageBase):
    unit_id: Optional[UUID] = None

class StageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    stage_number: Optional[int] = None
    is_active: Optional[bool] = None

class StageResponse(StageBase):
    id: int
    unit_id: Optional[UUID] = None
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ── Unit Schemas ──────────────────────────────────────────────────────────────
class UnitBase(BaseModel):
    unit_number: int
    title: str

class UnitCreate(UnitBase):
    section_id: Optional[UUID] = None

class UnitUpdate(BaseModel):
    title: Optional[str] = None
    unit_number: Optional[int] = None

class UnitResponse(UnitBase):
    id: UUID
    section_id: UUID
    created_at: Optional[datetime] = None
    stages: Optional[List[StageResponse]] = []

    class Config:
        from_attributes = True

# ── Section Schemas ───────────────────────────────────────────────────────────
class SectionBase(BaseModel):
    section_number: int
    title: str

class SectionCreate(SectionBase):
    curriculum_id: Optional[UUID] = None

class SectionUpdate(BaseModel):
    title: Optional[str] = None
    section_number: Optional[int] = None

class SectionResponse(SectionBase):
    id: UUID
    curriculum_id: UUID
    created_at: Optional[datetime] = None
    units: Optional[List[UnitResponse]] = []

    class Config:
        from_attributes = True

# ── Curriculum Schemas ────────────────────────────────────────────────────────
class CurriculumBase(BaseModel):
    grade_level: int = 1
    title: str
    description: Optional[str] = None

class CurriculumCreate(CurriculumBase):
    pass

class CurriculumUpdate(BaseModel):
    title: Optional[str] = None
    grade_level: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class CurriculumResponse(CurriculumBase):
    id: UUID
    is_active: bool
    created_at: Optional[datetime] = None
    sections: Optional[List[SectionResponse]] = []

    class Config:
        from_attributes = True

