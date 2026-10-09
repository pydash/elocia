import { Link } from "react-router-dom";
import Field from "../../components/Field";
import Button from "../../components/Button";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAdultLogin } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getRoleFromToken, tokenManager } from "@/helpers/jwt";

export default function TeacherLoginPage() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAdultLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleError, setRoleError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleError("");
    const response = await login(username, password);
    if (response && response.access_token) {
      const role = getRoleFromToken(response.access_token);
      if (role !== "teacher") {
        tokenManager.clearAccessToken();
        setRoleError("Access Denied: This portal is strictly restricted to teachers.");
        return;
      }
      navigate("/teacher/classes");
    }
  };

  const displayError = roleError || authError;

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* Left Hero Panel (Hidden on small mobile, compact on tablet, full on desktop) */}
        <section className="flex w-full lg:w-1/2 items-center justify-center bg-(--primary) py-8 px-6 lg:py-0">
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            {/* Image Wrapper */}
            <div className="mb-4 sm:mb-6 flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center">
              <img
                src="/logo.png"
                alt="Elocia logo"
                className="h-full w-full object-contain"
              />
            </div>

            <h1 className="heading-1 text-2xl sm:text-4xl text-(--white)">Welcome Back!</h1>

            <p className="paragraph-2 mt-2 sm:mt-4 text-xs sm:text-base leading-relaxed text-(--white)">
              Dive back into your teaching journey with ELOCIA.
              Eager minds and exciting new lessons await! Ready to
              inspire your students today?
            </p>
          </div>
        </section>

        {/* Right Form Panel */}
        <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-(--primary-light) p-4 sm:p-8">
          <div
            className="absolute inset-0 bg-[url('/pattern_background.png')] bg-cover bg-center bg-no-repeat opacity-30"
            aria-hidden="true"
          />
          {/* Login Form Card */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white px-6 py-8 sm:px-8 sm:py-12 shadow-xl border border-gray-100">
            <div className="mb-6 flex flex-col items-center gap-1.5 text-center">
              <h1 className="heading-3 text-xl sm:text-2xl font-bold">Login your account</h1>
              <p className="paragraph-2 text-xs sm:text-sm text-(--ghost)">Ready to teach?</p>
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
                  onChange={(e) => setUsername(e.target.value)}
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
                  trailingIcon={showPassword ? EyeOff : Eye}
                  onTrailingIconClick={() => setShowPassword((prev) => !prev)}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Error message */}
              {displayError && (
                <div
                  role="alert"
                  className="w-full rounded-md bg-red-50 px-3 py-2 text-sm text-(--danger)"
                >
                  {displayError}
                </div>
              )}

              <Button type="submit" className="w-full">
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </section>
      </main>
  );
}
