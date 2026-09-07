import { useNavigate } from "react-router-dom";
import SpiderWebBackground from "../components/SpiderWebBackground";

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#08090b] text-zinc-100 relative overflow-hidden">
            <SpiderWebBackground />

            <div className="relative z-10 min-h-screen flex flex-col justify-between">
                
                {/* Navbar */}
                <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
                    <h1 className="text-lg sm:text-xl font-bold tracking-[0.2em] sm:tracking-[0.3em]">
                        WEAVE
                    </h1>

                    <div className="flex gap-1 sm:gap-3">
                        <button
                            onClick={() => navigate("/login")}
                            className="px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm text-zinc-300 hover:text-white transition"
                        >
                            Login
                        </button>

                        <button
                            onClick={() => navigate("/register")}
                            className="px-3.5 sm:px-5 py-2 rounded-lg bg-white text-black text-xs sm:text-sm font-medium hover:bg-zinc-200 transition"
                        >
                            Get Started
                        </button>
                    </div>
                </header>

                {/* Hero */}
                <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
                    <section className="max-w-4xl text-center">

                        <p className="text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.35em] text-zinc-400 mb-4 sm:mb-6">
                            IDEAS COLLIDE. ARGUMENTS EVOLVE.
                        </p>

                        <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                            Don't just discuss.
                            <br />
                            <span className="text-zinc-400">
                                Weave it!
                            </span>
                        </h2>

                        <p className="mt-6 sm:mt-8 max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed px-2">
                            Create a topic, take a position, and build an
                            argument with others. Every response becomes
                            another stand in the weave.
                        </p>

                        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto">
                            <button
                                onClick={() => navigate("/register")}
                                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition text-sm sm:text-base"
                            >
                                Create a Weave
                            </button>

                            <button
                                onClick={() => navigate("/login")}
                                className="w-full sm:w-auto px-7 py-3 rounded-xl border border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10 transition text-sm sm:text-base"
                            >
                                Enter Weave
                            </button>
                        </div>

                    </section>
                </main>

                {/* Bottom concept */}
                <footer className="pb-6 sm:pb-8 px-4 text-center">
                    <div className="flex justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm">
                        <span className="text-emerald-400 font-medium tracking-wide">
                            SUPPORT
                        </span>

                        <span className="text-zinc-600">
                            —
                        </span>

                        <span className="text-zinc-400 font-medium tracking-wide">
                            TOPIC
                        </span>

                        <span className="text-zinc-600">
                            —
                        </span>

                        <span className="text-red-400 font-medium tracking-wide">
                            AGAINST
                        </span>
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default Landing;