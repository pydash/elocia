import { Outlet } from "react-router-dom";
import TopHeaderBar from "../components/teacher/TopHeaderBar";

export default function TeacherAddLessonLayout() {
  const lessonTitle = "New Lesson";

  return (
    <>
      <TopHeaderBar variant="light" />
      <div className="h-full bg-(--primary-light) p-3">
        <Outlet />
      </div>
    </>
  );
}
