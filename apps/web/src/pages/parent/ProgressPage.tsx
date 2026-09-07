import { BarChart } from "@/components/BarChart";
import TopHeaderBar from "@/components/parent/TopHeaderBar";
import ProgressBar from "@/components/ProgressBar";

const parameterMastery = [
  {
    name: "Handshape",
    value: 80,
  },
  {
    name: "Location",
    value: 60,
  },
  {
    name: "Movement",
    value: 90,
  },
  {
    name: "Palm Orientation",
    value: 70,
  },
];

const performanceTrend = [
  {
    label: "Week 1",
    percentage: 60,
  },
  {
    label: "Week 2",
    percentage: 70,
  },
  {
    label: "Week 3",
    percentage: 80,
  },
  {
    label: "Week 4",
    percentage: 90,
  },
];

export default function ParentProgressPage() {
  return (
    <div>
      <TopHeaderBar />

      <section className="flex flex-col p-6 gap-4 text-(--black)">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Parameter Mastery</h1>
          <article className="space-y-6 border-2 border-(--border) rounded-2xl p-6">
            {parameterMastery.map((parameter) => (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="paragraph-2 font-semibold!">
                    {parameter.name}
                  </span>
                  <span className="py-1 px-3 rounded-full bg-(--primary) text-white text-sm font-medium border-b-4 border-(--primary-shadow)">
                    {parameter.value}%
                  </span>
                </div>
                <ProgressBar percentage={parameter.value} />
              </div>
            ))}
          </article>
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Performance Trend</h1>
          <article className="flex space-y-6 border-2 border-(--border) rounded-2xl p-6 h-64">
            <BarChart data={performanceTrend} />
          </article>
        </div>
      </section>
    </div>
  );
}
