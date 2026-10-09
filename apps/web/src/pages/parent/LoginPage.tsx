import Field from "../../components/Field";
import Button from "../../components/Button";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAdultLogin } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getRoleFromToken, tokenManager } from "@/helpers/jwt";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

export default function ParentLoginPage() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAdultLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRoleError("");
    const response = await login(username, password);

    if (response && response.access_token) {
      const role = getRoleFromToken(response.access_token);
      if (role !== "parent") {
        tokenManager.clearAccessToken();
        setRoleError("Access Denied: This portal is strictly restricted to parents.");
        return;
      }
      navigate("/parent/home");
    }
  };

  const displayError = roleError || authError;

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* Left Hero Panel */}
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
              Stay connected with your child's learning journey.
              Track progress, celebrate achievements, and support
              their success every step of the way with ELOCIA.
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
              <p className="paragraph-2 text-xs sm:text-sm text-(--ghost)">
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
                  trailingIcon={showPassword ? EyeOff : Eye}
                  onTrailingIconClick={() => setShowPassword((prev) => !prev)}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="********"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <div className="mt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    className="text-xs font-medium text-(--primary) hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

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

        <ForgotPasswordModal
          isOpen={isForgotOpen}
          onClose={() => setIsForgotOpen(false)}
          portalName="Parent Portal"
        />
      </main>
  );
}
