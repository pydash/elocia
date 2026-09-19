import { Link } from "react-router-dom";
import Field from "../../components/Field";
import Button from "../../components/Button";
import { User, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAdultLogin } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function ParentLoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAdultLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await login(username, password);

    if (response) {
      navigate("/parent/home");
    }
  };

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
              Stay connected with your child's learning journey.
              <br />
              Track progress, celebrate achievements, and support
              <br />
              their success every step of the way with ELOCIA.
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
              <p className="paragraph-2 text-(--ghost)">
                Ready to support your child's learning?
              </p>
            </div>

            <form
              className="flex flex-col items-end gap-4"
              onSubmit={handleSubmit}
            >
              <div className="w-full">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>

                <Field
                  leadingIcon={User}
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
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

              {error && (
                <div
                  role="alert"
                  className="w-full rounded-md bg-red-50 px-3 py-2 text-sm text-(--danger)"
                >
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
