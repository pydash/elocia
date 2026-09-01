import { Link } from "react-router-dom";
import Button from "../components/Button";

export default function LandingPage() {
  return (
    <main className="h-screen bg-(--primary-500) flex flex-col">
      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <div className="flex flex-col items-center gap-4">
          <img className="size-32" src="/logo.png" alt="Logo" />
          <h1 className="text-(--primary) text-4xl font-bold">
            Welcome to ELOCIA
          </h1>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="font-medium">I am logging in as...</p>

          <ul className="flex flex-col gap-4">
            <li>
              <Link to="/teacher/login">
                <Button variant="default" className="w-70">
                  Teacher
                </Button>
              </Link>
            </li>

            <li>
              <Link to="/parent/login">
                <Button variant="default" className="w-70">
                  Parent
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="pb-12 text-center">
        <Link to="/help" className="text-(--info) hover:underline">
          Need help?
        </Link>
      </div>
    </main>
  );
}
