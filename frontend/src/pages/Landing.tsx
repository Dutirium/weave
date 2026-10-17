import { useNavigate } from "react-router-dom";
import SpiderWebBackground from "../components/SpiderWebBackground";
import "../styles/landing.css";

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">

            <SpiderWebBackground />

            <div className="landing-content">

                {/* Navbar */}
                <header className="landing-navbar">

                    <h1 className="landing-logo">
                        WEAVE
                    </h1>

                    <div className="landing-nav-actions">

                        <button
                            onClick={() => navigate("/login")}
                            className="landing-login-btn"
                        >
                            Login
                        </button>

                        <button
                            onClick={() => navigate("/register")}
                            className="landing-start-btn"
                        >
                            Get Started
                        </button>

                    </div>

                </header>


                {/* Hero */}
                <main className="landing-hero">

                    <section className="landing-hero-content">

                        <p className="landing-eyebrow">
                            IDEAS COLLIDE. ARGUMENTS EVOLVE.
                        </p>

                        <h2 className="landing-title">
                            Don't just discuss.
                            <br />

                            <span className="landing-title-muted">
                                Weave it!
                            </span>
                        </h2>

                        <p className="landing-description">
                            Create a topic, take a position, and build an
                            argument with others. Every response becomes
                            another strand in the weave.
                        </p>


                        <div className="landing-hero-actions">

                            {/* <button
                                onClick={() => navigate("/register")}
                                className="landing-primary-btn"
                            >
                                Create a Weave
                            </button>

                            <button
                                onClick={() => navigate("/login")}
                                className="landing-secondary-btn"
                            >
                                Enter Weave
                            </button> */}

                            <button
                                className="landing-global-btn"
                                onClick={() => navigate("/global")}
                            >
                                See Ongoing <strong>Weaves</strong>
                            </button>

                        </div>

                    </section>

                </main>


                {/* Concept */}
                <section className="landing-concept">

                    <span className="concept-support">
                        SUPPORT
                    </span>

                    <span className="concept-divider">
                        —
                    </span>

                    <span className="concept-topic">
                        TOPIC
                    </span>

                    <span className="concept-divider">
                        —
                    </span>

                    <span className="concept-against">
                        AGAINST
                    </span>

                </section>


                {/* Gamification Footer */}
                <footer className="landing-footer">

                    <div className="landing-footer-line" />

                    <div className="landing-gamification">

                        <div className="gamification-item">
                            <span className="gamification-icon">
                                XP
                            </span>

                            <div>
                                <strong>Earn XP</strong>
                                <span>Every contribution matters</span>
                            </div>
                        </div>


                        <div className="gamification-item">
                            <span className="gamification-icon">
                                ↗
                            </span>

                            <div>
                                <strong>Build your streak</strong>
                                <span>Keep the conversation moving</span>
                            </div>
                        </div>


                        <div className="gamification-item">
                            <span className="gamification-icon">
                                ◈
                            </span>

                            <div>
                                <strong>Shape the Weave</strong>
                                <span>Ideas evolve through participation</span>
                            </div>
                        </div>

                    </div>

                    <p className="landing-footer-caption">
                        THINK. ARGUE. PARTICIPATE. EVOLVE.
                    </p>

                </footer>

            </div>

        </div>
    );
};

export default Landing;