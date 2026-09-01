import { Link } from "react-router-dom";
import TopNavbar from "../../components/teacher/TopHeaderBar";
import LessonCard from "../../components/teacher/LessonCard";
import Input from "../../components/Input ";
import Dropdown from "../../components/Dropdown";
import Button from "../../components/Button";
import { Search, SquareLibrary, Plus } from "lucide-react";

export default function TeacherLessonsPage() {
  return (
    <div>
      <TopNavbar />

      <section className="p-6">
        <div className="flex gap-2 items-center text-(--info)">
          <SquareLibrary />
          <p className="uppercase paragraph-2">Curriculum</p>
        </div>
        <div>
          <h1 className="heading-2 text-(--black)">Lesson Library</h1>
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="flex w-1/2 items-center gap-4">
            <Input placeholder="Search lessons..." leadingIcon={Search} />

            <Dropdown
              className="max-w-50"
              value="all"
              onChange={() => {}}
              options={[
                { label: "All Grades", value: "all" },
                { label: "Grade 1", value: "grade-1" },
                { label: "Grade 2", value: "grade-2" },
                { label: "Grade 3", value: "grade-3" },
              ]}
            />
          </div>

          <div>
            <Link
              to="/teacher/lessons/new/step-1"
              className="flex items-center gap-2"
            >
              <Button variant="default" className="gap-2">
                <Plus />
                <span>Add new lesson</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="drafted"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
          <LessonCard
            imageUrl="/path/to/image.jpg"
            title="Sample Lesson"
            description="This is a sample lesson description."
            status="published"
          />
        </div>
      </section>
    </div>
  );
}
