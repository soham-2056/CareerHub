import { Link } from "react-router-dom";
import { MdDescription, MdRecordVoiceOver, MdWork, MdArrowForward } from "react-icons/md";
import "./Home.css";

const features = [
  { icon: <MdDescription />, title: "AI Resume Analyzer", desc: "Get instant AI-powered feedback on your resume with skill detection and improvement suggestions.", color: "purple" },
  { icon: <MdRecordVoiceOver />, title: "Mock Interviews",    desc: "Practice with real interview questions across Frontend, Backend, and HR rounds with AI feedback.", color: "blue"   },
  { icon: <MdWork />,            title: "Internship Portal",  desc: "Browse 500+ curated internships from top companies filtered by your skills and preferences.",     color: "green"  },
];

export default function Home() {
  return (
    <div className="home">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav__brand">
          <span className="brand-icon">🎯</span>
          <span className="brand-name">CareerHub</span>
        </div>
        <div className="home-nav__links">
          <Link to="/login"    className="btn btn-outline btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero__badge">🚀 Built for BTech Students</div>
        <h1 className="hero__title">
          Build Your Career<br />
          <span className="hero__gradient">With Confidence</span>
        </h1>
        <p className="hero__sub">
          Resume analysis · Mock interviews · Skill tracking · Internship discovery —
          everything you need to land your first tech job.
        </p>
        <div className="hero__cta">
          <Link to="/register" className="btn btn-primary">
            Get Started Free <MdArrowForward />
          </Link>
          <Link to="/login" className="btn btn-outline">Login</Link>
        </div>

        <div className="hero__stats">
          <div className="hero__stat"><strong>500+</strong><span>Internships</span></div>
          <div className="hero__stat"><strong>50+</strong><span>Companies</span></div>
          <div className="hero__stat"><strong>AI</strong><span>Powered</span></div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <h2 className="features__title">Everything you need to succeed</h2>
        <p className="features__sub">One platform to track your growth and land opportunities</p>
        <div className="features__grid">
          {features.map((f) => (
            <div key={f.title} className={`feature-card feature-card--${f.color}`}>
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
              <Link to="/register" className="feature-card__link">
                Get started <MdArrowForward />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2024 CareerHub · Built for aspiring developers</p>
      </footer>
    </div>
  );
}
