import { ShieldAlert, X } from "lucide-react";
import Button from "./Button";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalName?: string;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  portalName = "ELOCIA",
}: ForgotPasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-2 border-gray-100 relative space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                Forgot Password?
              </h3>
              <p className="text-xs text-gray-500">{portalName} Account Support</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Informational Message */}
        <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 space-y-3">
          <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
            For security and privacy compliance, password resets are handled exclusively by your <strong>School Administrator</strong>.
          </p>
          <div className="pt-2 border-t border-amber-200/60 text-xs text-amber-900 font-semibold space-y-1.5">
            <p>📌 How to reset your credentials:</p>
            <ul className="list-disc list-inside space-y-1 font-normal text-amber-800">
              <li>Please contact your designated <strong>School Administrator</strong>.</li>
              <li>The administrator can immediately reset your password in the <strong>ELOCIA Admin Console</strong>.</li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <Button onClick={onClose} className="w-full">
          Understood, Close
        </Button>
      </div>
    </div>
  );
}

