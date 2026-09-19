export interface EducationalVideo {
  id: string;
  title: string;
  description?: string;
  subject: string;
  gradeLevel: number;
  durationMinutes?: number;
  videoUrl: string;
  thumbnailUrl?: string;
  createdBy?: string;
  createdAt: Date;
}
