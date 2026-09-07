import React, { useState } from 'react';
import { Link } from 'react-router-dom';
interface FormData {
  username: string;
  email: string;
  password: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    createdAt: string;
  };
}

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle typed input changes dynamically
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit registration to the backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong during registration.');
      }

      setStatusMessage(`Success: ${data.message} Welcome, ${data.user?.username}!`);
      setFormData({ username: '', email: '', password: '' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="min-h-screen bg-[#08090b] text-zinc-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">

        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">

            <div className="absolute top-[-20%] right-[10%] w-[280px] sm:w-[520px] h-[280px] sm:h-[520px] bg-violet-600/[0.08] rounded-full blur-[100px] sm:blur-[150px]" />

            <div className="absolute bottom-[-20%] left-[5%] w-[250px] sm:w-[480px] h-[250px] sm:h-[480px] bg-cyan-500/[0.045] rounded-full blur-[100px] sm:blur-[150px]" />

            <div
                className="absolute inset-0 opacity-[0.018]"
                style={{
                    backgroundImage:
                        "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

        </div>


        {/* Main layout */}
        <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center my-auto">


            {/* Left branding (Desktop) */}
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
                        Join the conversation
                    </p>

                    <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05] text-white">

                        Your ideas
                        <span className="block text-zinc-500">
                            deserve
                        </span>

                        <span className="block">
                            to be <span className="text-violet-400">challenged.</span>
                        </span>

                    </h1>


                    <p className="mt-7 text-zinc-500 leading-relaxed max-w-md">
                        Create your account, enter the discussion,
                        and see how far your ideas can go.
                    </p>

                </div>


                {/* Argument thread */}
                <div className="mt-14 flex items-center gap-3">

                    <div className="flex items-center">

                        <span className="w-2 h-2 rounded-full bg-violet-400" />

                        <span className="w-16 h-px bg-zinc-800" />

                        <span className="w-2 h-2 rounded-full bg-zinc-600" />

                        <span className="w-16 h-px bg-zinc-800" />

                        <span className="w-2 h-2 rounded-full bg-cyan-400" />

                    </div>

                    <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-700">
                        CONNECT · QUESTION · DISCOVER
                    </span>

                </div>

            </div>


            {/* Registration card */}
            <div className="w-full max-w-md mx-auto">


                {/* Mobile branding */}
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
                        Join the conversation
                    </p>

                </div>


                <div className="bg-[#101114]/90 border border-white/[0.08] rounded-2xl p-5 sm:p-9 shadow-2xl shadow-black/50 backdrop-blur-xl">


                    {/* Header */}
                    <div className="mb-6 sm:mb-8">

                        <div className="flex items-center justify-between mb-4 sm:mb-6">

                            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                                New member
                            </span>

                            <div className="flex items-center gap-2">

                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.7)]" />

                                <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                                    Create account
                                </span>

                            </div>

                        </div>


                        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                            Start weaving.
                        </h2>

                        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-zinc-500">
                            Set up your account and join the discussion.
                        </p>

                    </div>


                    {/* Error */}
                    {errorMessage && (
                        <div className="mb-4 sm:mb-5 px-4 py-3 rounded-xl bg-rose-500/[0.05] border border-rose-500/20 text-rose-400 text-xs">
                            {errorMessage}
                        </div>
                    )}


                    {/* Status */}
                    {statusMessage && (
                        <div className="mb-4 sm:mb-5 px-4 py-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 text-emerald-400 text-xs">
                            {statusMessage}
                        </div>
                    )}


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 sm:space-y-5"
                    >


                        {/* Username */}
                        <div>

                            <label
                                htmlFor="username"
                                className="block text-xs font-medium text-zinc-400 mb-1.5 sm:mb-2"
                            >
                                Username
                            </label>

                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="choose a username"
                                className="w-full bg-[#0a0b0d] border border-white/[0.08] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-zinc-700 outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
                            />

                        </div>


                        {/* Email */}
                        <div>

                            <label
                                htmlFor="email"
                                className="block text-xs font-medium text-zinc-400 mb-1.5 sm:mb-2"
                            >
                                Email address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
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
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-[#0a0b0d] border border-white/[0.08] rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-zinc-700 outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
                            />

                            <p className="mt-1.5 sm:mt-2 text-[10px] text-zinc-700">
                                Minimum 6 characters
                            </p>

                        </div>


                        {/* Register */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 rounded-xl bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-semibold text-sm py-3 sm:py-3.5 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>


                        {/* Login */}
                        <div className="pt-2 sm:pt-3 text-center">

                            <span className="text-xs text-zinc-600">
                                Already have an account?
                            </span>{" "}

                            <Link
                                to="/login"
                                className="login-button text-xs text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                Sign in
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
};
