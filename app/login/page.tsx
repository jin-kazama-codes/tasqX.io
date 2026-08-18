"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { setCookie } from "@/utils/helpers";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";

/* ─── Floating mock task cards shown on the left panel ─────────────────── */
const MOCK_CARDS = [
  {
    id: "TSQ-42",
    title: "Redesign onboarding flow with AI guidance",
    type: "STORY",
    status: "In Progress",
    statusColor: "#6366f1",
    avatar: "AR",
    avatarBg: "#7c3aed",
    priority: "High",
    priorityColor: "#f43f5e",
    tags: ["Design", "AI"],
  },
  {
    id: "TSQ-17",
    title: "Integrate Supabase Realtime for live board updates",
    type: "TASK",
    status: "Done",
    statusColor: "#10b981",
    avatar: "SC",
    avatarBg: "#0891b2",
    priority: "Medium",
    priorityColor: "#f59e0b",
    tags: ["Backend"],
  },
  {
    id: "TSQ-38",
    title: "Fix drag-and-drop flicker on mobile viewport",
    type: "BUG",
    status: "Todo",
    statusColor: "#94a3b8",
    avatar: "AU",
    avatarBg: "#4f46e5",
    priority: "Low",
    priorityColor: "#22c55e",
    tags: ["Mobile", "DnD"],
  },
];

const IssueTypeColors: Record<string, string> = {
  STORY: "#7c3aed",
  TASK: "#6366f1",
  BUG: "#ef4444",
};

/* ─── SprintProgress mini-bar ────────────────────────────────────────────── */
const SprintProgress = () => (
  <div
    style={{
      background: "rgba(255,255,255,0.07)",
      borderRadius: 14,
      padding: "14px 18px",
      border: "1px solid rgba(255,255,255,0.08)",
      marginBottom: 14,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Sprint 1 — Core MVP
      </span>
      <span style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 700 }}>73%</span>
    </div>
    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 5 }}>
      <div
        style={{
          width: "73%",
          height: "100%",
          borderRadius: 99,
          background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
        }}
      />
    </div>
    <div
      style={{
        display: "flex",
        gap: 12,
        marginTop: 10,
        fontSize: 10,
        color: "rgba(255,255,255,0.45)",
        fontWeight: 600,
      }}
    >
      <span>✅ 11 done</span>
      <span>⚡ 3 in progress</span>
      <span>📋 1 todo</span>
    </div>
  </div>
);

/* ─── Mock Task Card component ──────────────────────────────────────────── */
const MockCard = ({ card, style }: { card: (typeof MOCK_CARDS)[0]; style?: React.CSSProperties }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 14,
      padding: "14px 16px",
      marginBottom: 10,
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: IssueTypeColors[card.type] ?? "#6366f1",
            background: `${IssueTypeColors[card.type] ?? "#6366f1"}22`,
            padding: "2px 6px",
            borderRadius: 4,
            textTransform: "uppercase",
          }}
        >
          {card.type}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
          {card.id}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: `${card.statusColor}22`,
          padding: "2px 8px",
          borderRadius: 99,
        }}
      >
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: card.statusColor }} />
        <span style={{ fontSize: 10, color: card.statusColor, fontWeight: 600 }}>{card.status}</span>
      </div>
    </div>

    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.80)", lineHeight: 1.5, margin: "0 0 10px" }}>
      {card.title}
    </p>

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 5 }}>
        {card.tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "2px 7px",
              borderRadius: 4,
              letterSpacing: "0.04em",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: card.avatarBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          fontWeight: 800,
          color: "#fff",
        }}
      >
        {card.avatar}
      </div>
    </div>
  </div>
);

/* ─── Main Login Component ──────────────────────────────────────────────── */
const Login: React.FC = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const redirectPath = searchParams.get("redirect");

  useEffect(() => {
    setIsMounted(true);
    if (token) {
      fetch("/api/auth/verify-login-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.projectId) setCookie("Invited Project", data.projectId);
          else setError("This invite link is invalid or has expired.");
        })
        .catch(() => setError("Error verifying invite link."));
    }
    if (redirectPath) router.push(redirectPath);
  }, [token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/auth/login", formData, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 200 && isMounted) {
        const userToken = res.data.user;
        setCookie("user", userToken);
        const destination =
          userToken.role === "superAdmin" ? "/admin" : "/project";
        window.location.href = destination;
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.response?.data?.error || "Invalid email or password.");
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <style>{`
        @keyframes float-a {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes float-b {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50%       { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes float-c {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes orb-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%       { opacity: 0.75; transform: scale(1.08); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer-line {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes badge-pop {
          0%   { opacity: 0; transform: scale(0.7); }
          70%  { transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes spinner {
          to { transform: rotate(360deg); }
        }
        @keyframes grid-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .tasqx-input:focus {
          outline: none;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
        }
        .tasqx-input::placeholder { color: rgba(100,116,139,0.7); }
        .tasqx-btn:hover { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(99,102,241,0.45) !important; }
        .tasqx-btn:active { transform: translateY(0); }
        .tasqx-btn { transition: all 0.18s ease; }
      `}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "'Inter', system-ui, sans-serif",
          background: "#0b0f17",
        }}
      >
        {/* ── LEFT PANEL — Visual showcase ──────────────────────────────── */}
        <div
          style={{
            flex: "0 0 52%",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(145deg, #0d1323 0%, #0e1628 40%, #0b0f1c 100%)",
            display: "none",
            // Show on md+ via CSS below
          }}
          className="tasqx-left-panel"
        >
          {/* Grid pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
              animation: "grid-fade 1s ease forwards",
            }}
          />

          {/* Ambient orbs */}
          <div style={{
            position: "absolute", top: -80, left: -80,
            width: 420, height: 420, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
            animation: "orb-pulse 6s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: -100, right: -60,
            width: 380, height: 380, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 70%)",
            animation: "orb-pulse 8s ease-in-out infinite 2s",
          }} />
          <div style={{
            position: "absolute", top: "40%", right: "10%",
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)",
            animation: "orb-pulse 5s ease-in-out infinite 1s",
          }} />

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              padding: "48px 44px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              animation: "slide-in-left 0.6s ease forwards",
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 900, color: "#fff",
                boxShadow: "0 0 20px rgba(99,102,241,0.4)",
              }}>
                TQ
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
                TasqX.io
              </span>
              <span style={{
                marginLeft: 4,
                fontSize: 10, fontWeight: 700,
                color: "#a5b4fc",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.25)",
                padding: "2px 7px", borderRadius: 99,
                letterSpacing: "0.06em",
                animation: "badge-pop 0.5s 0.5s ease both",
              }}>
                AI
              </span>
            </div>

            {/* Headline */}
            <div style={{ marginBottom: 40 }}>
              <h1 style={{
                fontSize: 36, fontWeight: 800, lineHeight: 1.15,
                color: "#f1f5f9", letterSpacing: "-0.03em",
                margin: "0 0 14px",
              }}>
                Ship faster with{" "}
                <span style={{
                  backgroundImage: "linear-gradient(135deg, #818cf8, #a78bfa, #38bdf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  intelligent
                </span>{" "}
                project management
              </h1>
              <p style={{ fontSize: 14, color: "rgba(148,163,184,0.85)", lineHeight: 1.65, margin: 0 }}>
                AI-powered sprints, backlogs & team collaboration —<br />
                designed for teams that move at the speed of thought.
              </p>
            </div>

            {/* Sprint progress */}
            <SprintProgress />

            {/* Floating mock cards */}
            <div style={{ flex: 1, position: "relative", minHeight: 200 }}>
              <div style={{ animation: "float-a 5s ease-in-out infinite" }}>
                <MockCard card={MOCK_CARDS[0]} />
              </div>
              <div style={{ animation: "float-b 7s ease-in-out infinite 0.8s" }}>
                <MockCard card={MOCK_CARDS[1]} />
              </div>
              <div style={{ animation: "float-c 6s ease-in-out infinite 1.6s" }}>
                <MockCard card={MOCK_CARDS[2]} />
              </div>
            </div>

            {/* Footer stats */}
            <div
              style={{
                display: "flex",
                gap: 28,
                paddingTop: 24,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                marginTop: 10,
              }}
            >
              {[
                { label: "Sprints shipped", value: "2.4k+" },
                { label: "Teams using AI", value: "380+" },
                { label: "Uptime", value: "99.9%" },
              ].map((s) => (
                <div key={s.label}>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.02em" }}>
                    {s.value}
                  </p>
                  <p style={{ margin: 0, fontSize: 10, color: "rgba(148,163,184,0.6)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — Login form ───────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle bg gradient for right side */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at 60% 30%, rgba(99,102,241,0.07) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          <div
            style={{
              width: "100%",
              maxWidth: 400,
              animation: "slide-in-right 0.6s ease forwards",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Mobile-only logo */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 40,
              justifyContent: "center",
            }}
              className="tasqx-mobile-logo"
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 900, color: "#fff",
                boxShadow: "0 0 24px rgba(99,102,241,0.45)",
              }}>
                TQ
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>TasqX.io</span>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <h2 style={{
                fontSize: 26, fontWeight: 800, color: "#f1f5f9",
                margin: "0 0 8px", letterSpacing: "-0.025em",
              }}>
                Welcome back
              </h2>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(148,163,184,0.75)" }}>
                Sign in to continue to your workspace
              </p>
            </div>

            {/* Form card */}
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 20,
                padding: "32px 30px",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Shimmer top border */}
              <div style={{
                height: 2, borderRadius: "10px 10px 0 0",
                background: "linear-gradient(90deg, transparent 0%, #6366f1 30%, #8b5cf6 60%, #06b6d4 80%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer-line 2.5s linear infinite",
                marginBottom: 28,
              }} />

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Email */}
                <div>
                  <label style={{
                    display: "block", marginBottom: 8,
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                    color: "rgba(148,163,184,0.8)", textTransform: "uppercase",
                  }}>
                    Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <HiOutlineMail style={{
                      position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                      color: "rgba(148,163,184,0.5)", width: 16, height: 16,
                    }} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className="tasqx-input"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        paddingLeft: 42, paddingRight: 14,
                        paddingTop: 12, paddingBottom: 12,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        fontSize: 14, color: "#e2e8f0",
                        transition: "all 0.15s",
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                      color: "rgba(148,163,184,0.8)", textTransform: "uppercase",
                    }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => router.push("/forgot-password")}
                      style={{
                        background: "none", border: "none", padding: 0, cursor: "pointer",
                        fontSize: 12, color: "#a5b4fc", fontWeight: 600,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: "relative" }}>
                    <HiOutlineLockClosed style={{
                      position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                      color: "rgba(148,163,184,0.5)", width: 16, height: 16,
                    }} />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      className="tasqx-input"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        paddingLeft: 42, paddingRight: 44,
                        paddingTop: 12, paddingBottom: 12,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        fontSize: 14, color: "#e2e8f0",
                        transition: "all 0.15s",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(148,163,184,0.5)", display: "flex", padding: 4,
                      }}
                    >
                      {showPassword
                        ? <HiOutlineEyeSlash style={{ width: 16, height: 16 }} />
                        : <HiOutlineEye style={{ width: 16, height: 16 }} />
                      }
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 10, padding: "10px 14px",
                    fontSize: 13, color: "#fca5a5",
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="tasqx-btn"
                  style={{
                    width: "100%",
                    padding: "13px 0",
                    borderRadius: 12,
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                    color: "#fff",
                    fontSize: 15, fontWeight: 700,
                    letterSpacing: "0.01em",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    opacity: loading ? 0.75 : 1,
                    marginTop: 4,
                  }}
                >
                  {loading ? (
                    <>
                      <svg
                        style={{ width: 18, height: 18, animation: "spinner 0.8s linear infinite" }}
                        fill="none" viewBox="0 0 24 24"
                      >
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path style={{ opacity: 0.85 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    "Sign in to TasqX →"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, margin: "24px 0 0",
              }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                <span style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", fontWeight: 600, letterSpacing: "0.05em" }}>
                  ⚡ AI-powered sprints & boards
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              </div>
            </div>

            {/* Footer note */}
            <p style={{
              textAlign: "center", marginTop: 20,
              fontSize: 12, color: "rgba(100,116,139,0.6)",
            }}>
              By continuing you agree to TasqX{" "}
              <span style={{ color: "#a5b4fc", cursor: "pointer" }}>Terms of Service</span>
              {" & "}
              <span style={{ color: "#a5b4fc", cursor: "pointer" }}>Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>

      {/* Responsive: show left panel on md+ */}
      <style>{`
        @media (min-width: 768px) {
          .tasqx-left-panel { display: flex !important; }
          .tasqx-mobile-logo { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Login;
