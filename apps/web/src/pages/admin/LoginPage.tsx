import Field from "../../components/Field";
import Button from "../../components/Button";
import { User, Lock, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAdultLogin } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getRoleFromToken, tokenManager } from "@/helpers/jwt";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAdultLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [roleError, setRoleError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRoleError("");

    const response = await login(username, password);

    if (response && response.access_token) {
      const role = getRoleFromToken(response.access_token);
      if (role !== "admin") {
        tokenManager.clearAccessToken();
        setRoleError("Access Denied: This portal is strictly restricted to system administrators.");
        return;
      }
      navigate("/admin");
    }
  };

  const displayError = roleError || authError;

  return (
    <main className="flex h-screen w-screen">
      {/* Left Hero Panel */}
      <section className="flex h-screen w-1/2 items-center justify-center bg-(--primary)">
        <div className="flex flex-col items-center justify-center text-center px-12">
          {/* Logo */}
          <div className="mb-6 flex h-32 w-32 items-center justify-center">
            <img
              src="/logo.png"
              alt="Elocia logo"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white tracking-wide uppercase mb-4">
            <ShieldCheck className="size-4" /> System Administration
          </div>

          <h1 className="heading-1 text-(--white)">ELOCIA Admin Portal</h1>

          <p className="paragraph-2 mt-4 leading-relaxed! text-(--white)/90 max-w-md">
            Centralized platform management, user administration,
            and school system configuration for the ELOCIA learning ecosystem.
          </p>
        </div>
      </section>

      {/* Right Login Form */}
      <section className="relative flex h-screen w-1/2 items-center justify-center overflow-hidden bg-(--primary-light)">
        <div
          className="absolute inset-0 bg-[url('/pattern_background.png')] bg-cover bg-center bg-no-repeat opacity-30"
          aria-hidden="true"
        />
        
        {/* Login Card */}
        <div className="relative z-10 w-100 rounded-xl bg-white px-8 py-12 shadow-md">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <h1 className="heading-3">Admin Sign In</h1>
            <p className="paragraph-2 text-(--ghost)">
              Enter your administrator credentials
            </p>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="w-full">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className="block text-sm font-medium text-gray-700 mb-1"
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
              {/* Note: Forgot Password intentionally omitted for security */}
            </div>

            {displayError && (
              <div
                role="alert"
                className="w-full rounded-md bg-red-50 p-3 text-sm text-(--danger) border border-red-200"
              >
                {displayError}
              </div>
            )}

            <Button type="submit" className="w-full mt-2">
              {loading ? "Authenticating..." : "Login to Console"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
