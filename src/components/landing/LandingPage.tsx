"use client";
import { useState, ReactNode } from "react";
import { motion } from "framer-motion";

/* ============================================================
   SWITCH — Landing Page with Aurora Blossom animated background
   Aurora palette: #F9D4E0 · #EB96FF · #0B5777 · #193153
   ============================================================ */

type ProviderKey = "off" | "on";

interface Provider {
  name: string;
  dot: string;
  sub: string;
}

const PROVIDERS: Record<ProviderKey, Provider> = {
  off: { name: "ChatGPT", dot: "#10b981", sub: "Account 1 · GPT-4o" },
  on: { name: "Claude", dot: "#d97706", sub: "Account 2 · Sonnet" },
};

interface Theme {
  bg: string;
  bgSoft: string;
  card: string;
  cardBorder: string;
  text: string;
  textDim: string;
  accent: string;
  accentText: string;
  line: string;
}

function useTheme(on: boolean): Theme {
  return {
    bg: "transparent",
    bgSoft: on ? "rgba(255,255,255,0.08)" : "rgba(25,49,83,0.5)",
    card: on ? "rgba(255,255,255,0.12)" : "rgba(25,49,83,0.4)",
    cardBorder: on ? "rgba(249,212,224,0.25)" : "rgba(11,87,119,0.35)",
    text: "#f5f0ff",
    textDim: on ? "rgba(249,212,224,0.7)" : "rgba(235,150,255,0.65)",
    accent: on ? "#EB96FF" : "#F9D4E0",
    accentText: "#193153",
    line: on ? "rgba(249,212,224,0.15)" : "rgba(11,87,119,0.3)",
  };
}

/* ---------------- Aurora Blossom Background ---------------- */
function AuroraBackground({ on }: { on: boolean }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: on
          ? "linear-gradient(160deg, #193153 0%, #0B5777 40%, #2d1a4a 100%)"
          : "linear-gradient(160deg, #193153 0%, #0B5777 35%, #1a0d2e 100%)",
        transition: "background 1s ease",
      }}
    >
      {/* Orb 1 — large rose/pink blob, sweeps bottom-center */}
      <motion.div
        animate={{
          x: [0, 140, -60, 90, -30, 0],
          y: [0, -80, 120, -50, 60, 0],
          scale: [1, 1.25, 0.85, 1.15, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          width: "70vw",
          height: "70vw",
          borderRadius: "50%",
          background: on
            ? "radial-gradient(circle, rgba(235,150,255,0.5) 0%, rgba(249,212,224,0.25) 45%, transparent 68%)"
            : "radial-gradient(circle, rgba(235,150,255,0.45) 0%, rgba(249,212,224,0.2) 45%, transparent 68%)",
          filter: "blur(55px)",
          left: "20%",
          bottom: "-20%",
        }}
      />
      {/* Orb 2 — teal/blue, sweeps top-right */}
      <motion.div
        animate={{
          x: [0, -130, 80, -70, 40, 0],
          y: [0, 90, -130, 80, -40, 0],
          scale: [1, 0.8, 1.3, 0.9, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{
          position: "absolute",
          width: "60vw",
          height: "60vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(11,87,119,0.65) 0%, rgba(25,49,83,0.35) 45%, transparent 68%)",
          filter: "blur(70px)",
          right: "-15%",
          top: "5%",
        }}
      />
      {/* Orb 3 — violet/purple, sweeps left-middle */}
      <motion.div
        animate={{
          x: [0, 100, -90, 120, -50, 0],
          y: [0, 120, 50, -90, 80, 0],
          scale: [1, 1.2, 0.8, 1.1, 0.9, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        style={{
          position: "absolute",
          width: "55vw",
          height: "55vw",
          borderRadius: "50%",
          background: on
            ? "radial-gradient(circle, rgba(249,212,224,0.3) 0%, rgba(235,150,255,0.18) 45%, transparent 68%)"
            : "radial-gradient(circle, rgba(249,212,224,0.28) 0%, rgba(235,150,255,0.14) 45%, transparent 68%)",
          filter: "blur(65px)",
          left: "-18%",
          top: "25%",
        }}
      />
      {/* Orb 4 — deep indigo, top-center */}
      <motion.div
        animate={{
          x: [0, -80, 110, -40, 70, 0],
          y: [0, -110, 40, -70, 30, 0],
          scale: [1, 0.9, 1.2, 0.85, 1.1, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 12 }}
        style={{
          position: "absolute",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79,46,140,0.55) 0%, rgba(25,49,83,0.28) 45%, transparent 68%)",
          filter: "blur(75px)",
          left: "35%",
          top: "-15%",
        }}
      />
    </div>
  );
}

/* ---------------- Giant Switch ---------------- */
interface GiantSwitchProps {
  on: boolean;
  setOn: (v: boolean) => void;
  size?: number;
}

function GiantSwitch({ on, setOn, size = 1 }: GiantSwitchProps) {
  return (
    <button
      aria-label="Toggle Switch theme and active provider"
      onClick={() => setOn(!on)}
      style={{
        position: "relative",
        width: 260 * size,
        height: 130 * size,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        padding: 0,
        background: on
          ? "linear-gradient(180deg, rgba(235,150,255,0.3), rgba(249,212,224,0.15))"
          : "linear-gradient(180deg, rgba(25,49,83,0.8), rgba(11,87,119,0.4))",
        boxShadow: on
          ? "0 0 0 1px rgba(235,150,255,0.4), 0 30px 80px -20px rgba(235,150,255,0.5), inset 0 2px 10px rgba(249,212,224,0.2)"
          : "0 0 0 1px rgba(11,87,119,0.5), 0 30px 80px -20px rgba(11,87,119,0.4), inset 0 2px 10px rgba(249,212,224,0.08)",
        backdropFilter: "blur(12px)",
        transition: "background 0.6s ease, box-shadow 0.6s ease",
      }}
    >
      {/* energy line track */}
      <div
        style={{
          position: "absolute",
          inset: 10 * size,
          borderRadius: 999,
          overflow: "hidden",
          background: on ? "rgba(235,150,255,0.08)" : "rgba(11,87,119,0.15)",
        }}
      >
        <motion.div
          animate={{ x: on ? "0%" : "-100%" }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          style={{
            position: "absolute",
            inset: 0,
            background: on
              ? "linear-gradient(90deg, transparent, rgba(235,150,255,0.5))"
              : "linear-gradient(90deg, rgba(249,212,224,0.3), transparent)",
          }}
        />
      </div>

      {/* knob */}
      <motion.div
        animate={{ left: on ? `calc(100% - ${110 * size}px)` : `${10 * size}px` }}
        transition={{ type: "spring", stiffness: 210, damping: 22 }}
        style={{
          position: "absolute",
          top: 10 * size,
          width: 100 * size,
          height: 100 * size,
          borderRadius: "50%",
          background: on
            ? "radial-gradient(circle at 35% 30%, #F9D4E0, #EB96FF 75%)"
            : "radial-gradient(circle at 35% 30%, #a8d8ea, #0B5777 140%)",
          boxShadow: on
            ? "0 10px 30px rgba(235,150,255,0.6), inset 0 -6px 10px rgba(0,0,0,0.15)"
            : "0 10px 30px rgba(11,87,119,0.6), inset 0 -6px 10px rgba(0,0,0,0.4)",
        }}
      />
    </button>
  );
}

/* ---------------- Fade in on view ---------------- */
interface RevealProps {
  children: ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}

function Reveal({ children, delay = 0, style }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Floating aurora particles ---------------- */
function Particles({ on, count = 18 }: { on: boolean; count?: number }) {
  const items = Array.from({ length: count });
  const colors = ["#F9D4E0", "#EB96FF", "#0B5777", "#a8d8ea"];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {items.map((_, i) => {
        const left = (i * 137.5) % 100;
        const dur = on ? 5 + (i % 6) : 10 + (i % 7);
        const delay = (i % 9) * 0.5;
        const sz = 2 + (i % 4);
        const color = colors[i % colors.length];
        return (
          <motion.div
            key={i}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "-10%", opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              left: `${left}%`,
              width: sz,
              height: sz,
              borderRadius: "50%",
              background: color,
              filter: "blur(0.5px)",
              boxShadow: `0 0 ${sz * 2}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ---------------- Navbar ---------------- */
function Navbar({ on, t }: { on: boolean; t: Theme }) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 28px",
        backdropFilter: "blur(20px)",
        background: "rgba(25,49,83,0.45)",
        borderBottom: "1px solid rgba(249,212,224,0.1)",
        transition: "background 0.6s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 26,
            height: 14,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${t.accent}, #EB96FF)`,
            position: "relative",
            transition: "background 0.6s ease",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              left: on ? 14 : 2,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#193153",
              transition: "left 0.4s ease",
            }}
          />
        </div>
        <span
          style={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#f5f0ff",
            fontFamily: "Fragment, serif",
            background: "linear-gradient(90deg, #F9D4E0, #EB96FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Switch
        </span>
      </div>
      <div style={{ display: "flex", gap: 28, fontSize: 13, color: "rgba(249,212,224,0.65)" }}>
        <a href="#how" style={{ color: "inherit", textDecoration: "none" }}>How it works</a>
        <a href="#workspace" style={{ color: "inherit", textDecoration: "none" }}>Workspace</a>
        <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>Pricing</a>
      </div>
      <a
        href="/sign-in"
        style={{
          fontSize: 13,
          fontWeight: 700,
          padding: "9px 20px",
          borderRadius: 999,
          background: "linear-gradient(135deg, #EB96FF, #F9D4E0)",
          color: "#193153",
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(235,150,255,0.35)",
        }}
      >
        Start Free
      </a>
    </nav>
  );
}

/* ---------------- Hero ---------------- */
function Hero({ on, setOn, t }: { on: boolean; setOn: (v: boolean) => void; t: Theme }) {
  const active = on ? PROVIDERS.on : PROVIDERS.off;
  const other = on ? PROVIDERS.off : PROVIDERS.on;
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "140px 24px 80px",
        overflow: "hidden",
      }}
    >
      <Particles on={on} />

      <Reveal>
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(235,150,255,0.7)",
            marginBottom: 18,
          }}
        >
          The switch controls everything
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <h1
          style={{
            textAlign: "center",
            fontFamily: "Fragment, Georgia, serif",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #ffffff 0%, #F9D4E0 40%, #EB96FF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "clamp(2.6rem, 7vw, 5.6rem)",
            lineHeight: 1.02,
            margin: 0,
          }}
        >
          Switch Models.<br />Keep Context.
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <p
          style={{
            textAlign: "center",
            maxWidth: 560,
            margin: "22px auto 0",
            color: "rgba(249,212,224,0.75)",
            fontSize: 18,
            lineHeight: 1.6,
          }}
        >
          Move between ChatGPT, Claude, Gemini and DeepSeek without losing memory, files or
          conversation history.
        </p>
      </Reveal>

      {/* The switch stage */}
      <div
        style={{
          marginTop: 64,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 36,
          width: "100%",
          maxWidth: 880,
        }}
      >
        <ProviderCard provider={other} faded t={t} side="left" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <GiantSwitch on={on} setOn={setOn} />
          <span style={{ fontSize: 12, color: "rgba(235,150,255,0.55)", letterSpacing: "0.06em" }}>
            tap to flip
          </span>
        </div>
        <ProviderCard provider={active} t={t} side="right" />
      </div>

      <Reveal delay={0.15}>
        <div style={{ marginTop: 56, display: "flex", gap: 12, justifyContent: "center" }}>
          <a
            href="/sign-in"
            style={{
              padding: "14px 28px",
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 15,
              background: "linear-gradient(135deg, #EB96FF, #F9D4E0)",
              color: "#193153",
              textDecoration: "none",
              boxShadow: "0 8px 30px rgba(235,150,255,0.4)",
            }}
          >
            Start Free
          </a>
          <a
            href="#demo"
            style={{
              padding: "14px 28px",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 15,
              border: "1px solid rgba(249,212,224,0.25)",
              color: "#F9D4E0",
              textDecoration: "none",
              backdropFilter: "blur(10px)",
              background: "rgba(25,49,83,0.3)",
            }}
          >
            Watch Demo
          </a>
        </div>
      </Reveal>
    </section>
  );
}

interface ProviderCardProps {
  provider: Provider;
  faded?: boolean;
  t: Theme;
  side: "left" | "right";
}

function ProviderCard({ provider, faded, t, side }: ProviderCardProps) {
  return (
    <motion.div
      key={provider.name}
      initial={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      animate={{ opacity: faded ? 0.4 : 1, x: 0, scale: faded ? 0.94 : 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
      style={{
        borderRadius: 20,
        padding: "22px 20px",
        background: "rgba(25,49,83,0.45)",
        border: "1px solid rgba(249,212,224,0.15)",
        backdropFilter: "blur(14px)",
        boxShadow: faded ? "none" : "0 8px 40px rgba(235,150,255,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: provider.dot }} />
        <span style={{ fontSize: 12, color: "rgba(235,150,255,0.6)", letterSpacing: "0.05em" }}>
          {faded ? "STANDBY" : "ACTIVE"}
        </span>
      </div>
      <p style={{ fontSize: 26, fontWeight: 700, color: "#f5f0ff", margin: 0, fontFamily: "Fragment, serif" }}>
        {provider.name}
      </p>
      <p style={{ fontSize: 13, color: "rgba(249,212,224,0.6)", marginTop: 4 }}>
        {provider.sub}
      </p>
    </motion.div>
  );
}

/* ---------------- How it works ---------------- */
function HowItWorks({ on, t }: { on: boolean; t: Theme }) {
  const from = on ? "Claude" : "ChatGPT";
  const to = on ? "Gemini" : "Claude";
  const stages = ["Files", "Memory cards", "Context packets"];
  return (
    <section id="how" style={{ padding: "120px 24px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Reveal>
          <p style={{ fontSize: 13, letterSpacing: "0.1em", color: "rgba(235,150,255,0.65)", textTransform: "uppercase" }}>
            How switching works
          </p>
          <h2
            style={{
              fontFamily: "Fragment, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              background: "linear-gradient(135deg, #ffffff, #F9D4E0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginTop: 10,
              letterSpacing: "-0.02em",
            }}
          >
            One pipeline, under a second
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            style={{
              marginTop: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              borderRadius: 24,
              padding: "40px 32px",
              background: "rgba(25,49,83,0.45)",
              border: "1px solid rgba(249,212,224,0.15)",
              backdropFilter: "blur(14px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <PipelineNode label={from} />
            <div style={{ flex: 1, position: "relative", height: 2 }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(235,150,255,0.2)" }} />
              {stages.map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ left: "0%", opacity: 0 }}
                  whileInView={{ left: "100%", opacity: [0, 1, 1, 0] }}
                  viewport={{ once: false }}
                  transition={{ duration: 1.6, delay: i * 0.35, repeat: Infinity, repeatDelay: 1 }}
                  style={{
                    position: "absolute",
                    top: -14,
                    transform: "translateX(-50%)",
                    fontSize: 11,
                    padding: "4px 9px",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #EB96FF, #F9D4E0)",
                    color: "#193153",
                    whiteSpace: "nowrap",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(235,150,255,0.4)",
                  }}
                >
                  {s}
                </motion.div>
              ))}
            </div>
            <PipelineNode label={to} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PipelineNode({ label }: { label: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 140,
        textAlign: "center",
        padding: "16px 10px",
        borderRadius: 16,
        background: "rgba(11,87,119,0.4)",
        border: "1px solid rgba(249,212,224,0.2)",
        backdropFilter: "blur(8px)",
      }}
    >
      <p style={{ fontWeight: 700, color: "#f5f0ff", margin: 0 }}>{label}</p>
    </div>
  );
}

/* ---------------- Universal Workspace ---------------- */
function Workspace({ t }: { t: Theme }) {
  const projects = [
    { name: "Startup Idea", tag: "Product" },
    { name: "Placement Prep", tag: "Career" },
    { name: "Research Paper", tag: "Academic" },
    { name: "Client Project", tag: "Freelance" },
  ];
  return (
    <section id="workspace" style={{ padding: "100px 24px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Reveal>
          <p style={{ fontSize: 13, letterSpacing: "0.1em", color: "rgba(235,150,255,0.65)", textTransform: "uppercase" }}>
            Universal workspace
          </p>
          <h2
            style={{
              fontFamily: "Fragment, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              background: "linear-gradient(135deg, #ffffff, #F9D4E0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginTop: 10,
              letterSpacing: "-0.02em",
              maxWidth: 560,
            }}
          >
            Switching models never breaks project memory
          </h2>
        </Reveal>
        <div
          style={{
            marginTop: 48,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 16,
          }}
        >
          {projects.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(235,150,255,0.2)" }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                style={{
                  borderRadius: 18,
                  padding: 22,
                  background: "rgba(25,49,83,0.45)",
                  border: "1px solid rgba(249,212,224,0.15)",
                  backdropFilter: "blur(14px)",
                  minHeight: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 11, color: "rgba(235,150,255,0.65)", letterSpacing: "0.06em" }}>
                  {p.tag.toUpperCase()}
                </span>
                <p style={{ fontWeight: 700, color: "#f5f0ff", fontSize: 17, margin: 0 }}>
                  {p.name}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Interactive Demo ---------------- */
const MODEL_META: Record<string, { color: string; initial: string }> = {
  Claude:   { color: "#d97706", initial: "C" },
  ChatGPT:  { color: "#10b981", initial: "G" },
  Gemini:   { color: "#6366f1", initial: "Ge" },
  DeepSeek: { color: "#ec4899", initial: "D" },
};

const MODEL_REPLIES: Record<string, string> = {
  Claude:   "Picking up right where we left off — for your SaaS pricing, I'd anchor the free tier around 1 project and 100 messages/month. That's enough to hook power users without cannibalising conversions.",
  ChatGPT:  "Continuing from our pricing discussion — the sweet spot for a free tier is generous enough to feel real, but gated on the one feature paying users need most. For you that's unlimited projects.",
  Gemini:   "Based on our full conversation context: I'd set the free tier at 1 workspace, 3 connected accounts, 100 messages. The bottleneck drives upgrades without frustrating trial users.",
  DeepSeek: "Your context is fully loaded. For the free tier: 1 project limit, 3 AI integrations, 100 messages/mo. The multi-model angle is your differentiator — highlight that in the upgrade CTA.",
};

function InteractiveDemo({ on, setOn, t }: { on: boolean; setOn: (v: boolean) => void; t: Theme }) {
  const models = ["Claude", "ChatGPT", "Gemini", "DeepSeek"];
  const [activeModel, setActiveModel] = useState("ChatGPT");
  const [switching, setSwitching]     = useState(false);
  const [fromModel, setFromModel]     = useState("");
  const [toModel, setToModel]         = useState("");

  const handleSwitch = (next: string) => {
    if (next === activeModel || switching) return;
    setFromModel(activeModel);
    setToModel(next);
    setSwitching(true);
    setOn(next === "Claude" || next === "Gemini");
    setTimeout(() => {
      setActiveModel(next);
      setSwitching(false);
    }, 1300);
  };

  const meta   = MODEL_META[activeModel];
  const toMeta = MODEL_META[toModel] || meta;

  const thread = [
    { role: "user", text: "Help me design a SaaS pricing page" },
    { role: "ai",   text: "I'll help craft a compelling page. Based on your startup context, I suggest a 3-tier model — Free, Pro at $12, and Team at $29 — with memory engine as the Pro hook." },
    { role: "user", text: "What should the free tier limits be?" },
  ];

  return (
    <section id="demo" style={{ padding: "100px 24px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Reveal>
          <p style={{ fontSize: 13, letterSpacing: "0.1em", color: "rgba(235,150,255,0.65)", textTransform: "uppercase", textAlign: "center" }}>
            Live demo
          </p>
          <h2
            style={{
              fontFamily: "Fragment, serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              background: "linear-gradient(135deg, #ffffff, #F9D4E0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginTop: 10,
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            Switch mid-conversation.<br />Not a single byte lost.
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          {/* ── mock window ── */}
          <div
            style={{
              marginTop: 48,
              borderRadius: 24,
              border: "1px solid rgba(249,212,224,0.14)",
              backdropFilter: "blur(24px)",
              background: "rgba(13,6,32,0.55)",
              overflow: "hidden",
              boxShadow: "0 40px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(235,150,255,0.06)",
            }}
          >
            {/* ── title bar ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 20px",
                borderBottom: "1px solid rgba(249,212,224,0.07)",
                background: "rgba(6,9,15,0.5)",
              }}
            >
              {/* traffic-light dots */}
              <div style={{ display: "flex", gap: 6, marginRight: 10 }}>
                {["#ff5f57","#febc2e","#28c840"].map(c => (
                  <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.85 }} />
                ))}
              </div>
              {/* model tabs */}
              {models.map(m => {
                const mc = MODEL_META[m].color;
                const active = m === activeModel;
                return (
                  <button
                    key={m}
                    onClick={() => handleSwitch(m)}
                    disabled={switching}
                    style={{
                      padding: "5px 13px",
                      borderRadius: 7,
                      border: active ? `1px solid ${mc}50` : "1px solid transparent",
                      background: active ? `${mc}18` : "transparent",
                      color: active ? mc : "rgba(249,212,224,0.35)",
                      fontWeight: active ? 700 : 400,
                      fontSize: 12,
                      cursor: switching ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.25s ease",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: mc, opacity: active ? 1 : 0.4 }} />
                    {m}
                  </button>
                );
              })}
              <div style={{ marginLeft: "auto", fontSize: 11, color: "rgba(235,150,255,0.4)", fontFamily: "monospace" }}>
                ctx: 4.2 kb · 3 msgs
              </div>
            </div>

            {/* ── chat body ── */}
            <div style={{ padding: "28px 28px 20px", minHeight: 300, position: "relative" }}>

              {/* context-transfer overlay */}
              {switching && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    background: "rgba(6,9,15,0.82)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 20,
                    borderRadius: 2,
                  }}
                >
                  {/* from → to */}
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${MODEL_META[fromModel]?.color}50`, color: MODEL_META[fromModel]?.color, fontSize: 13, fontWeight: 700, background: `${MODEL_META[fromModel]?.color}12` }}>
                      {fromModel}
                    </div>
                    <motion.div
                      animate={{ x: [0, 6, 0] }}
                      transition={{ duration: 0.55, repeat: Infinity }}
                      style={{ color: "rgba(235,150,255,0.9)", fontSize: 22 }}
                    >
                      →
                    </motion.div>
                    <div style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${toMeta.color}50`, color: toMeta.color, fontSize: 13, fontWeight: 700, background: `${toMeta.color}12` }}>
                      {toModel}
                    </div>
                  </div>
                  {/* transfer pills */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    {["Files","Memory","Context","History","Goals"].map((item, i) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.14 }}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 999,
                          background: "rgba(235,150,255,0.12)",
                          border: "1px solid rgba(235,150,255,0.3)",
                          fontSize: 11,
                          color: "#EB96FF",
                          fontWeight: 600,
                          letterSpacing: "0.03em",
                        }}
                      >
                        ✓ {item}
                      </motion.div>
                    ))}
                  </div>
                  <motion.p
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ fontSize: 12, color: "rgba(235,150,255,0.55)", margin: 0 }}
                  >
                    Transferring context...
                  </motion.p>
                </motion.div>
              )}

              {/* conversation thread */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {thread.map((msg, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "68%",
                        padding: "10px 16px",
                        borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: msg.role === "user"
                          ? "linear-gradient(135deg, rgba(235,150,255,0.22), rgba(249,212,224,0.12))"
                          : "rgba(255,255,255,0.05)",
                        border: msg.role === "user"
                          ? "1px solid rgba(235,150,255,0.2)"
                          : "1px solid rgba(249,212,224,0.07)",
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: "#f0ecff",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* active model reply */}
                <motion.div
                  key={activeModel}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      flexShrink: 0,
                      background: `${meta.color}20`,
                      border: `1px solid ${meta.color}45`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 800,
                      color: meta.color,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {meta.initial}
                  </div>
                  <div
                    style={{
                      maxWidth: "68%",
                      padding: "10px 16px",
                      borderRadius: "18px 18px 18px 4px",
                      background: `${meta.color}0f`,
                      border: `1px solid ${meta.color}28`,
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: "#f0ecff",
                    }}
                  >
                    {MODEL_REPLIES[activeModel]}
                  </div>
                </motion.div>
              </div>

              {/* input bar */}
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(249,212,224,0.09)",
                }}
              >
                <span style={{ flex: 1, fontSize: 13, color: "rgba(249,212,224,0.28)" }}>Continue the conversation...</span>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: "linear-gradient(135deg, #EB96FF, #F9D4E0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    color: "#193153",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ↑
                </div>
              </div>
            </div>

            {/* ── footer bar with toggle ── */}
            <div
              style={{
                padding: "14px 28px",
                borderTop: "1px solid rgba(249,212,224,0.07)",
                background: "rgba(6,9,15,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontSize: 12, color: "rgba(249,212,224,0.45)" }}>4.2 kb context</span>
                </div>
                <span style={{ fontSize: 12, color: "rgba(249,212,224,0.35)" }}>3 messages</span>
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>0 bytes lost</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "rgba(235,150,255,0.5)" }}>flip to switch</span>
                <GiantSwitch on={on} setOn={(v) => { setOn(v); handleSwitch(v ? "Claude" : "ChatGPT"); }} size={0.52} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Bento Features ---------------- */
function Features({ t }: { t: Theme }) {
  return (
    <section style={{ padding: "100px 24px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "Fragment, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              background: "linear-gradient(135deg, #ffffff, #F9D4E0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
              marginBottom: 40,
            }}
          >
            Built for the switch
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <Reveal>
            <BentoCard tall>
              <h3 style={{ color: "#f5f0ff", fontFamily: "Fragment, serif", fontSize: 24, margin: 0 }}>
                Shared Memory Engine
              </h3>
              <p style={{ color: "rgba(249,212,224,0.7)", fontSize: 14, lineHeight: 1.6, maxWidth: 320, margin: 0 }}>
                Every decision and insight lives in your workspace, not locked inside one model.
              </p>
            </BentoCard>
          </Reveal>
          <Reveal delay={0.05}>
            <BentoCard>
              <h3 style={{ color: "#f5f0ff", fontFamily: "Fragment, serif", fontSize: 22, margin: 0 }}>
                Bring Your Own Keys
              </h3>
              <p style={{ color: "rgba(249,212,224,0.7)", fontSize: 14, margin: 0 }}>We never proxy or log requests.</p>
            </BentoCard>
          </Reveal>
          <Reveal delay={0.1}>
            <BentoCard>
              <h3 style={{ color: "#f5f0ff", fontFamily: "Fragment, serif", fontSize: 22, margin: 0 }}>
                Sub-second transfer
              </h3>
              <p style={{ color: "rgba(249,212,224,0.7)", fontSize: 14, margin: 0 }}>Context packages average 0.8s to load.</p>
            </BentoCard>
          </Reveal>
          <Reveal delay={0.15}>
            <BentoCard tall>
              <h3 style={{ color: "#f5f0ff", fontFamily: "Fragment, serif", fontSize: 24, margin: 0 }}>
                Project-scoped context
              </h3>
              <p style={{ color: "rgba(249,212,224,0.7)", fontSize: 14, lineHeight: 1.6, maxWidth: 320, margin: 0 }}>
                Each workspace remembers its own files, goals and history independently.
              </p>
            </BentoCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BentoCard({ tall, children }: { tall?: boolean; children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(235,150,255,0.15)" }}
      transition={{ type: "spring", stiffness: 250, damping: 18 }}
      style={{
        borderRadius: 22,
        padding: 28,
        background: "rgba(25,49,83,0.45)",
        border: "1px solid rgba(249,212,224,0.12)",
        backdropFilter: "blur(14px)",
        minHeight: tall ? 220 : 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Pricing ---------------- */
function Pricing({ t }: { t: Theme }) {
  const plans = [
    { name: "Free", price: "$0", features: ["1 project", "3 AI accounts", "100 messages/mo"], hero: false },
    { name: "Pro", price: "$12", features: ["Unlimited projects", "Unlimited accounts", "Full memory engine"], hero: true },
    { name: "Team", price: "$29", features: ["Everything in Pro", "5 seats", "Shared workspaces"], hero: false },
  ];
  return (
    <section id="pricing" style={{ padding: "100px 24px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Reveal>
          <h2
            style={{
              fontFamily: "Fragment, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              background: "linear-gradient(135deg, #ffffff, #F9D4E0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
              textAlign: "center",
            }}
          >
            Simple pricing
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 40 }}>
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6, boxShadow: p.hero ? "0 20px 60px rgba(235,150,255,0.35)" : "0 20px 60px rgba(235,150,255,0.1)" }}
                transition={{ type: "spring", stiffness: 250, damping: 18 }}
                style={{
                  borderRadius: 22,
                  padding: 28,
                  background: p.hero
                    ? "linear-gradient(135deg, rgba(235,150,255,0.3), rgba(249,212,224,0.15))"
                    : "rgba(25,49,83,0.45)",
                  border: p.hero
                    ? "1px solid rgba(235,150,255,0.4)"
                    : "1px solid rgba(249,212,224,0.12)",
                  backdropFilter: "blur(14px)",
                  color: "#f5f0ff",
                  boxShadow: p.hero ? "0 8px 40px rgba(235,150,255,0.2)" : "none",
                }}
              >
                <p style={{ fontWeight: 700, fontSize: 15, opacity: 0.8, margin: 0 }}>{p.name}</p>
                <p
                  style={{
                    fontFamily: "Fragment, serif",
                    fontSize: 38,
                    margin: "6px 0 18px",
                    background: p.hero ? "linear-gradient(135deg, #EB96FF, #F9D4E0)" : "none",
                    WebkitBackgroundClip: p.hero ? "text" : "unset",
                    WebkitTextFillColor: p.hero ? "transparent" : "inherit",
                  }}
                >
                  {p.price}
                  <span style={{ fontSize: 14, opacity: 0.6 }}>/mo</span>
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ fontSize: 13, opacity: 0.85 }}>· {f}</li>
                  ))}
                </ul>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */
function FinalCTA({ on, setOn, t }: { on: boolean; setOn: (v: boolean) => void; t: Theme }) {
  return (
    <section id="start" style={{ padding: "140px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
      <Reveal>
        <h2
          style={{
            fontFamily: "Fragment, serif",
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            background: "linear-gradient(135deg, #ffffff 0%, #F9D4E0 40%, #EB96FF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          Stop Starting Over.
        </h2>
        <p style={{ color: "rgba(249,212,224,0.7)", marginTop: 14, fontSize: 17 }}>
          One workspace. Every AI.
        </p>
      </Reveal>
      <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
        <GiantSwitch on={on} setOn={setOn} />
      </div>
      <Reveal delay={0.1}>
        <a
          href="/sign-in"
          style={{
            display: "inline-block",
            marginTop: 48,
            padding: "16px 32px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 16,
            background: "linear-gradient(135deg, #EB96FF, #F9D4E0)",
            color: "#193153",
            textDecoration: "none",
            boxShadow: "0 8px 40px rgba(235,150,255,0.45)",
          }}
        >
          Get Started Free
        </a>
      </Reveal>
    </section>
  );
}

/* ============================================================
   ROOT EXPORT — the full landing page
   ============================================================ */
export default function SwitchLanding() {
  const [on, setOn] = useState<boolean>(false);
  const t = useTheme(on);

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
        color: "#f5f0ff",
      }}
    >
      {/* Aurora animated background — fixed */}
      <AuroraBackground on={on} />

      {/* Content layer */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar on={on} t={t} />
        <Hero on={on} setOn={setOn} t={t} />
        <HowItWorks on={on} t={t} />
        <Workspace t={t} />
        <InteractiveDemo on={on} setOn={setOn} t={t} />
        <Features t={t} />
        <Pricing t={t} />
        <FinalCTA on={on} setOn={setOn} t={t} />
        <footer
          style={{
            textAlign: "center",
            padding: "32px 24px",
            color: "rgba(235,150,255,0.45)",
            fontSize: 12,
            borderTop: "1px solid rgba(249,212,224,0.08)",
          }}
        >
          © 2026 Switch. One workspace. Every AI.
        </footer>
      </div>
    </div>
  );
}
