import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  LayoutTemplate,
  Activity,
  ShieldCheck,
  Upload,
  MousePointerClick,
  CheckCircle2,
  ArrowRight,
  Mail,
  Menu,
  X,
  Plus,
  Github,
  Linkedin,
} from "lucide-react";
import logo from "../assets/logo01-nobg.png";
import "../styles/Home.css";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

const STATS = [
  { value: "50,000", label: "Emails sent per day" },
  { value: "99.9%", label: "Delivery uptime" },
  { value: "Real-time", label: "Open & bounce tracking" },
  { value: "AWS", label: "Backed infrastructure" },
];

const FEATURES = [
  {
    icon: Send,
    title: "Bulk sending",
    description:
      "Attach your recipient list, confirm the send, and Bulk Wave queues and delivers every message.",
  },
  {
    icon: LayoutTemplate,
    title: "Custom templates",
    description:
      "Build a template once and reuse it across campaigns without starting from scratch.",
  },
  {
    icon: Activity,
    title: "Delivery tracking",
    description:
      "Watch opens, bounces, and delivery status update in real time as your campaign goes out.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description:
      "Built on AWS with a MySQL-backed data layer, so your lists and sends stay reliable and safe.",
  },
];

const STEPS = [
  {
    icon: Upload,
    title: "Upload your list",
    description: "Add or import the recipient emails you want to reach.",
  },
  {
    icon: MousePointerClick,
    title: "Craft your message",
    description: "Pick a saved template or build a new one in minutes.",
  },
  {
    icon: CheckCircle2,
    title: "Confirm & send",
    description: "Review the details, confirm, and let Bulk Wave send it out.",
  },
];

const FAQS = [
  {
    question: "How many emails can I send per day?",
    answer:
      "Bulk Wave supports up to 50,000 emails per day. Once you confirm a send, the queue takes care of pacing delivery for you.",
  },
  {
    question: "Can I reuse email templates?",
    answer:
      "Yes. Build a template once, save it, and reuse it across as many campaigns as you like.",
  },
  {
    question: "Can I see if my emails were delivered?",
    answer:
      "Every campaign shows delivery, open, and bounce status as it happens, so you always know what landed.",
  },
  {
    question: "What is Bulk Wave built on?",
    answer:
      "The app runs on React, Python, AWS, and MySQL, keeping sending fast and your data reliable.",
  },
];

const STACK = ["React", "Python", "AWS", "MySQL"];

function WaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`wave-divider ${flip ? "wave-divider--flip" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path
          className="wave wave--back"
          d="M0,120 C 240,200 480,40 720,90 C 960,140 1200,60 1440,110 L1440,220 L0,220 Z"
        />
        <path
          className="wave wave--mid"
          d="M0,150 C 240,90 480,190 720,140 C 960,90 1200,170 1440,130 L1440,220 L0,220 Z"
        />
        <path
          className="wave wave--front"
          d="M0,170 C 240,140 480,200 720,160 C 960,120 1200,190 1440,150 L1440,220 L0,220 Z"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bw-page">
      {/* ambient rising bubbles, purely decorative */}
      <div className="bubbles" aria-hidden="true">
        {Array.from({ length: 36 }).map((_, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${8 + Math.random() * 24}px`,
              height: `${8 + Math.random() * 24}px`,
              animationDuration: `${12 + Math.random() * 18}s`,
              animationDelay: `${Math.random() * 12}s`,
            }}
          />
        ))}
      </div>

      <header className={`bw-nav ${scrolled ? "bw-nav--scrolled" : ""}`}>
        <div className="bw-nav__inner">
          <a href="#top" className="bw-brand">
            <span className="bw-brand__logo-wrap">
              <img src={logo} alt="Bulk Wave logo" className="bw-brand__logo" />
            </span>
          </a>

          <nav className="bw-nav__links">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="bw-nav__actions">
            <button
              className="btn btn--glass-outline"
              type="button"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
            <button className="btn btn--primary" type="button">
              Get started
              <ArrowRight size={16} />
            </button>
          </div>

          <button
            className="bw-nav__toggle"
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav className={`bw-nav__mobile ${menuOpen ? "is-open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <button className="btn btn--primary" type="button">
            Get started
          </button>
        </nav>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="bw-glow" />

          <div className="hero__content">
            <span className="eyebrow">
              <Mail size={14} />
              Bulk email sending, simplified
            </span>
            <h1>
              Send bulk email <span className="text-gradient">in waves</span>,
              not headaches.
            </h1>
            <p className="hero__sub">
              Attach your list, confirm the send, and Bulk Wave delivers up to{" "}
              <strong>50,000 emails a day</strong> — with templates and
              real-time tracking built in.
            </p>
            <div className="hero__actions">
              <button className="btn btn--primary btn--lg" type="button">
                Start sending
                <ArrowRight size={18} />
              </button>
              <a href="#how-it-works" className="btn btn--glass-outline btn--lg">
                See how it works
              </a>
            </div>
          </div>

          <div className="hero__panel glass-card">
            <div className="hero__panel-row">
              <span>Campaign</span>
              <span className="pill pill--live">Sending…</span>
            </div>
            <div className="hero__panel-bar">
              <div className="hero__panel-bar-fill" />
            </div>
            <div className="hero__panel-stats">
              <div>
                <strong>32,481</strong>
                <span>Delivered</span>
              </div>
              <div>
                <strong>98.4%</strong>
                <span>Open rate</span>
              </div>
              <div>
                <strong>0.2%</strong>
                <span>Bounced</span>
              </div>
            </div>
          </div>

          <WaveDivider />
        </section>

        {/* STATS */}
        <section className="stats">
          {STATS.map((s) => (
            <div className="stat glass-card" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        {/* FEATURES */}
        <section className="features" id="features">
          <div className="section-heading">
            <span className="eyebrow">Features</span>
            <h2>Everything a bulk send needs</h2>
            <p>Built for teams who send often and need to know it landed.</p>
          </div>

          <div className="features__grid">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div className="feature-card glass-card" key={title}>
                <div className="feature-card__icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-it-works" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">How it works</span>
            <h2>Three steps to send</h2>
          </div>

          <div className="steps">
            {STEPS.map((step, i) => (
              <div className="step" key={step.title}>
                <div className="step__icon glass-card">
                  <step.icon size={22} />
                </div>
                <h3>
                  {String(i + 1).padStart(2, "0")}. {step.title}
                </h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="faq" id="faq">
          <div className="section-heading">
            <span className="eyebrow">FAQ</span>
            <h2>Good to know</h2>
          </div>

          <div className="faq__list">
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div className={`faq-item glass-card ${isOpen ? "is-open" : ""}`} key={item.question}>
                  <button
                    className="faq-item__question"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                  >
                    {item.question}
                    <Plus size={18} />
                  </button>
                  <div className="faq-item__answer">{item.answer}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <WaveDivider flip />
          <div className="cta__content glass-card">
            <h2>Ready to catch the wave?</h2>
            <p>Set up your first campaign in minutes — no credit card needed.</p>
            <button className="btn btn--primary btn--lg" type="button">
              Get started free
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <footer className="bw-footer">
        <div className="bw-footer__grid">
          <div className="bw-footer__col">
            <span className="bw-footer__brand-logo-wrap">
              <img src={logo} alt="Bulk Wave logo" className="bw-footer__logo" />
            </span>
            <p className="bw-footer__tagline">
              Bulk email sending, without the busywork.
            </p>
            <div className="bw-footer__stack">
              {STACK.map((tech) => (
                <span key={tech} className="chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="bw-footer__col">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>

          <div className="bw-footer__col">
            <h4>Developer</h4>
            <ul>
              <li>Rohan Kumar</li>
              <li>Software Engineer</li>
            </ul>
            <div className="bw-footer__socials">
              <a href="https://github.com/RohanDeveloper05" aria-label="GitHub">
                <Github size={16} />
              </a>
              <a href="https://www.linkedin.com/in/rohankumar001/" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="bw-footer__bottom">
          <p>© {new Date().getFullYear()} Bulk Wave. All rights reserved.</p>
          <p>Daily sending limit: 50,000 emails.</p>
        </div>
      </footer>
    </div>
  );
}
