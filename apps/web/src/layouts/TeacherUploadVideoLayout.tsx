import { useState } from "react";
import { Outlet } from "react-router-dom";
import TopHeaderBar from "../components/teacher/TopHeaderBar";
import type { CreateEducationalVideoPayload } from "@/services/educational-videos";

const initialVideo: CreateEducationalVideoPayload = {
  title: "",
  description: "",
  subject: "Sign Language",
  grade_level: 1,
  duration_minutes: 5,
  video_url: "",
  thumbnail_url: "",
};

export type TeacherUploadVideoContext = {
  video: CreateEducationalVideoPayload;
  setVideo: React.Dispatch<React.SetStateAction<CreateEducationalVideoPayload>>;
  videoFile: File | null;
  setVideoFile: React.Dispatch<React.SetStateAction<File | null>>;
};

export default function TeacherUploadVideoLayout() {
  const [video, setVideo] = useState<CreateEducationalVideoPayload>(initialVideo);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  return (
    <>
      <TopHeaderBar variant="light" />
      <div className="h-full bg-(--primary-light) p-6">
        <Outlet context={{ video, setVideo, videoFile, setVideoFile }} />
      </div>
    </>
  );
}
