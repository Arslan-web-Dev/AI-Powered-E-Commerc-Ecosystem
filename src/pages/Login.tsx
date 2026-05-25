import { Zap } from "lucide-react";

function buildOAuthUrl() {
  const base = import.meta.env.VITE_KIMI_AUTH_URL;
  const clientId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  const url = new URL(`${base}/api/oauth/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", btoa(redirectUri));
  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-white/40 mt-1.5">Sign in to continue to NexusAI</p>
        </div>

        <div
          className="rounded-2xl border border-white/[0.08] p-6"
          style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)" }}
        >
          <button
            onClick={() => { window.location.href = buildOAuthUrl(); }}
            className="btn-primary w-full py-3 text-[15px] flex items-center justify-center gap-2"
          >
            Continue with Kimi
          </button>
          <p className="text-[11px] text-white/25 text-center mt-4">
            By signing in, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
