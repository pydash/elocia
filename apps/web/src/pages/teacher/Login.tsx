import { Link } from "react-router-dom";
import Field from "../../components/Field";
import Button from "../../components/Button";
import { User, Lock } from "lucide-react";

export default function TeacherLogin() {
  return (
    <>
      <main className="flex h-screen w-screen">
        <section className="flex h-screen w-1/2 items-center justify-center bg-(--primary)">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Image Wrapper */}
            <div className="mb-6 flex h-32 w-32 items-center justify-center">
              <img
                src="/logo.png"
                alt="Elocia logo"
                className="h-full w-full object-contain"
              />
            </div>

            <h1 className="heading-1 text-(--white)">Welcome Back!</h1>

            <p className="paragraph-2 mt-4 leading-relaxed! text-(--white)">
              Dive back into your teaching journey with ELOCIA.
              <br />
              Eager minds and exciting new lessons await! Ready to
              <br />
              inspire your students today?
            </p>
          </div>
        </section>

        <section className="relative flex h-screen w-1/2 items-center justify-center overflow-hidden bg-(--primary-light)">
          <div
            className="absolute inset-0 bg-[url('/pattern_background.png')] bg-cover bg-center bg-no-repeat opacity-30"
            aria-hidden="true"
          />
          {/* Login Form Card */}
          <div className="relative z-10 w-100 rounded-xl bg-white px-8 py-12 shadow-md">
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              <h1 className="heading-3">Login your account</h1>
              <p className="paragraph-2 text-(--ghost)">Ready to teach?</p>
            </div>

            <form className="flex flex-col items-end gap-4">
              <div className="w-full">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <Field
                  leadingIcon={User}
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <Field
                  leadingIcon={Lock}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="********"
                />

                <div className="mt-1 flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-(--primary) hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
