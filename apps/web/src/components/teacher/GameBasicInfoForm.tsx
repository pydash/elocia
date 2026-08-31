import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../Button";
import Dropdown from "../Dropdown";
import Input from "../Input ";

export default function GameBasicInfoForm() {
  return (
    <form className="flex flex-col gap-8 rounded-[3rem] border border-(--white) bg-(--white) p-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(18rem,1fr)_minmax(0,1.8fr)] lg:items-start">
        <div className="overflow-hidden rounded-3xl bg-(--surface)">
          <img
            src={"/games/see-it-sign-it.png"}
            alt="Selected game"
            className="aspect-4/3 w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-7">
          <h1 className="heading-2 text-(--black)">
            Let&apos;s start with the basics
          </h1>

          <div className="flex flex-col gap-2">
            <label
              className="paragraph-1 text-(--black)"
              htmlFor="activity-title"
            >
              Activity Title
            </label>
            <Input
              id="activity-title"
              name="activityTitle"
              placeholder="e.g. See it, Sign it! - Activity 3"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="paragraph-1 text-(--black)" htmlFor="grade-level">
              Grade Level
            </label>
            <Dropdown
              value="grade-1"
              onChange={() => undefined}
              className=""
              options={[
                { label: "Grade 1", value: "grade-1" },
                { label: "Grade 2", value: "grade-2" },
                { label: "Grade 3", value: "grade-3" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-(--border)" />

      <div className="flex items-center justify-between gap-4">
        <Link to="/teacher/tasks">
          <Button type="button" className="min-w-40">
            Cancel
          </Button>
        </Link>
        <Link to="../step-2">
          <Button type="button" className="min-w-40 gap-3">
            Next Step
            <ChevronRight className="size-5" />
          </Button>
        </Link>
      </div>
    </form>
  );
}
