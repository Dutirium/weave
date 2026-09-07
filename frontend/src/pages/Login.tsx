import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

interface LoginFormData {
    uniqueId: string,
    password: string
}

interface ApiResponse {
    message?: string,
    error?: string,
    user?: {
        id: string,
        username: string,
        email: string,
        createdAt?: string
    }
}



export const Login: React.FC = () => {
    const { refreshUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<LoginFormData>({
        uniqueId: '',
        password: '',
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<null | string>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) =>{
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong during login");

            }
            setMessage(data.message ?? null);

            await refreshUser();
            
            navigate("/dashboard", {replace: true});
            
           
        }
        catch (e: unknown) {
            if (e instanceof Error) {
                setErrorMessage(e.message);
            }
            else {
                setErrorMessage("Something went Wrong");
            }
        }
        finally {
            setLoading(false);
        }
    }

return (
    <div className="min-h-screen bg-[#08090b] text-zinc-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[10%] w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-violet-600/10 rounded-full blur-[100px] sm:blur-[140px]" />
            <div className="absolute bottom-[-20%] right-[5%] w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-cyan-500/8 rounded-full blur-[100px] sm:blur-[140px]" />

            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                    backgroundImage:
                        "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />
        </div>

        {/* Main layout */}
        <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center my-auto">

            {/* Left side — branding (Desktop) */}
            <div className="hidden lg:block">

                <div className="flex items-center gap-3 mb-10">
                    <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-lg">
                        W
                    </div>

                    <span className="text-sm font-semibold tracking-[0.25em] uppercase text-zinc-400">
                        Weave
                    </span>
                </div>

                <div className="max-w-lg">
                    <p className="text-xs uppercase tracking-[0.3em] text-violet-400 mb-5">
                        Ideas collide here
                    </p>

                    <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05] text-white">
                        Don't just have
                        <span className="block text-zinc-500">
                            an opinion.
                        </span>
                        <span className="block">
                            <span className="text-violet-400">Weave</span> an argument.
                        </span>
                    </h1>

                    <p className="mt-7 text-zinc-500 leading-relaxed max-w-md">
                        Join discussions, challenge ideas, support arguments,
                        and follow where the conversation leads.
                    </p>
                </div>

                {/* Decorative argument thread */}
                <div className="mt-14 flex items-center gap-3 text-xs text-zinc-600">
                    <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-violet-400" />
                        <span className="w-16 h-px bg-zinc-800" />
                        <span className="w-2 h-2 rounded-full bg-zinc-600" />
                        <span className="w-16 h-px bg-zinc-800" />
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    </div>

                    <span>
                        CONNECT · CHALLENGE · DISCOVER
                    </span>
                </div>
            </div>


            {/* Login card */}
            <div className="w-full max-w-md mx-auto">

                {/* Mobile Header Branding */}
                <div className="mb-6 lg:hidden text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-base">
                            W
                        </div>

                        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-zinc-400">
                            Weave
                        </span>
                    </div>

                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-violet-400">
                        Ideas collide here
                    </p>
                </div>


                <div className="bg-[#101114]/90 border border-white/[0.08] rounded-2xl p-5 sm:p-9 shadow-2xl shadow-black/50 backdrop-blur-xl">

                    {/* Card header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                                Member access
                            </span>

                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Online
                                </span>
                            </div>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                            Welcome back.
                        </h2>

                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-zinc-500">
                            Continue where the conversation left off.
                        </p>
                    </div>


                    {/* Error */}
                    {errorMessage && (
                        <div className="mb-5 px-4 py-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs">
                            {errorMessage}
                        </div>
                    )}


                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                        {/* Username */}
                        <div>
                            <label
                                htmlFor="uniqueId"
                                className="block text-xs font-medium text-zinc-400 mb-1.5 sm:mb-2"
                            >
                                Username or email
                            </label>

                            <input
                                type="text"
                                id="uniqueId"
                                name="uniqueId"
                                required
                                value={formData.uniqueId}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full bg-[#0a0b0d] border border-white/[0.08] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-zinc-700 outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
                            />
                        </div>


                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-medium text-zinc-400 mb-1.5 sm:mb-2"
                            >
                                Password
                            </label>

                            <input
                                type="password"
                                id="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-[#0a0b0d] border border-white/[0.08] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-zinc-700 outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
                            />
                        </div>


                        {/* System message */}
                        {message && (
                            <div className="px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs">
                                {message}
                            </div>
                        )}


                        {/* Login */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 rounded-xl bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold text-sm py-3 sm:py-3.5 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? "Verifying..." : "Continue"}
                        </button>


                        {/* Register */}
                        <div className="pt-2 sm:pt-3 text-center">
                            <span className="text-xs text-zinc-600">
                                Don't have an account?
                            </span>{" "}

                            <Link
                                to="/register"
                                className="register-button text-xs text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                Create one
                            </Link>
                        </div>

                    </form>
                </div>


                {/* Footer */}
                <div className="mt-4 sm:mt-5 flex justify-center items-center gap-2 sm:gap-5 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-zinc-700">
                    <span>Private</span>
                    <span>•</span>
                    <span>Open discussion</span>
                    <span>•</span>
                    <span>Weave</span>
                </div>

            </div>
        </div>
    </div>
);

}

