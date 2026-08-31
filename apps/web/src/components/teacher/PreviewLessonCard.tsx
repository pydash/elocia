import Separator from "../Separator";

export default function PreviewLessonCard() {
  return (
    <>
      <div className="grid grid-cols-[40%_60%] gap-6 border-2 border-dashed border-(--primary) p-6 rounded-4xl bg-(--white)">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-3xl bg-(--surface) max-h-64">
            <img
              src={"/games/see-it-sign-it.png"}
              alt="Selected game"
              className="aspect-4/3 w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="paragraph-1 font-semibold! text-(--info)">
              Preview
            </h3>
            <div className="p-3 bg-(--primary-light) rounded-2xl shadow-[0_5px_0_0_#FB9F34]">
              <h1 className="paragraph-1 font-semibold! text-(--primary)">
                Hello
              </h1>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="paragraph-2 font-semibold text-(--ghost)">Title</p>
            <p className="heading-3 text-(--black)">Alphabet Basics</p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="paragraph-2 font-semibold text-(--ghost)">
              Grade Level
            </p>
            <p className="heading-3 text-(--black)">Grade 1</p>
          </div>
          <Separator />
        </div>
      </div>
    </>
  );
}
