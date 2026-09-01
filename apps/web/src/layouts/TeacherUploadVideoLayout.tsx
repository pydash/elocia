import { Outlet } from "react-router-dom";
import TopHeaderBar from "../components/teacher/TopHeaderBar";

export default function TeacherUploadVideoLayout() {
  return (
    <>
      <TopHeaderBar variant="light" />
      <div className="h-full bg-(--primary-light) p-6">
        <Outlet />
      </div>
    </>
  );
}
