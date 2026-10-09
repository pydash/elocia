import TopHeaderBar from "@/components/teacher/TopHeaderBar";
import {
  HelpCircle,
  Activity,
  Layers,
  Dumbbell,
  RefreshCw,
  Camera,
  CheckCircle2,
} from "lucide-react";

export default function TeacherHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopHeaderBar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[#FF8A00] font-bold text-xs uppercase tracking-wider mb-1">
            <HelpCircle className="h-4 w-4" />
            <span>Teacher Documentation & System Guide</span>
          </div>
          <h1 className="heading-2 text-(--black)">Help & Pedagogical Guide</h1>
          <p className="text-sm text-gray-500 mt-1">
            Understanding Filipino Sign Language (FSL) scoring, Vygotsky ZPD scaffolding, and desktop synchronization.
          </p>
        </div>

        {/* Section 1: 4-Parameter Phonological Model */}
        <section className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#FF8A00]">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                The 4-Parameter FSL Evaluation Model
              </h2>
              <p className="text-xs text-gray-500">
                How MediaPipe Holistic and DTW score student gestures
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-2">
              <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                1. Handshape
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Evaluates finger articulation, joint flexion angles, and thumb position relative to the reference sign.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-2">
              <span className="inline-block rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                2. Palm Orientation
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Evaluates the direction normal vector of the palms (facing forward, inward, toward floor, or sideways).
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-2">
              <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                3. Spatial Location
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tracks coordinates normalized against learner shoulder span and torso bounding box (chest, chin, neutral space).
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-2">
              <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                4. Movement Trajectory
              </span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Dynamic Time Warping (DTW) measures time-series motion path, direction, and velocity against the teacher baseline.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: 4-Tier Adaptive Scaffolding (ZPD) */}
        <section className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Zone of Proximal Development (ZPD) Scaffolding
              </h2>
              <p className="text-xs text-gray-500">
                Progressive assistance tiers delivered automatically during practice
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-extrabold text-xs text-emerald-700">
                T1
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Tier 1: Independent Production</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  The learner produces the sign with standard prompt cues only.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 font-extrabold text-xs text-blue-700">
                T2
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Tier 2: Parameter Highlight Hint</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Triggered upon 1st failed attempt: Highlights the specific struggling parameter (e.g., "Check hand position").
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 font-extrabold text-xs text-amber-700">
                T3
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Tier 3: Slow-Motion Video Guidance</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Triggered upon 2nd failed attempt: Replays teacher reference video in slow motion alongside live mirroring.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 p-4 bg-rose-50/60">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-200 font-extrabold text-xs text-rose-800">
                T4
              </span>
              <div>
                <h3 className="text-sm font-bold text-rose-900">Tier 4: Pass-and-Flag (Intervention)</h3>
                <p className="text-xs text-rose-800/80 mt-0.5">
                  Triggered after consecutive failures: Advances the learner without frustration, flags the sign on the Teacher Dashboard, and enables Focus Drill creation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Teacher Workflows FAQ */}
        <section className="rounded-3xl border-2 border-(--border) bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Frequently Asked Questions</h2>
              <p className="text-xs text-gray-500">Common questions regarding dashboard management</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                How do Focus Drills work?
              </h3>
              <p className="text-gray-600 leading-relaxed pl-6">
                When viewing a student's profile, click on their unit or flagged sign in the Analytics dialog and tap "Dispatch Focus Drill". The desktop application will automatically prioritize those specific signs during free practice.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                How does desktop syncing work?
              </h3>
              <p className="text-gray-600 leading-relaxed pl-6">
                When you publish new curriculum lessons or mini-game activities on the web portal, the student desktop app downloads the metadata and reference videos via the REST API over the local network or internet connection.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Camera className="h-4 w-4 text-purple-600" />
                What are the optimal webcam conditions for students?
              </h3>
              <p className="text-gray-600 leading-relaxed pl-6">
                Learners should sit approximately 0.5 to 1.2 meters away from the camera with shoulders, torso, and both hands fully visible in well-lit, non-backlit environments.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
