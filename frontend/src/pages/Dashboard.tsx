import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SpiderWebBackground from '../components/SpiderWebBackground.js';
import { ArrowRight } from 'lucide-react';
import { LuTrash2 } from 'react-icons/lu';

type Weave = {
    id: string,
    title: string,
    createdAt: string,
    user:{
        id: string,
        username: string,
    }
}

const Dashboard = ()=>{
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [ liveWeaves, setLiveWeaves] = useState<Weave[]>([]);
    const [ myWeaves, setMyWeaves ] = useState<Weave[]>([]);
    const [ weaves, setWeaves ] = useState<Weave[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState("");
    const [ title, setTitle ] = useState(false);
    const [ weaveTitle, setWeaveTitle ] = useState("");
    const [ weaveStatus, setWeaveStatus] = useState(false);

    useEffect(() => {
        const fetchWeaves = async () =>{
            try{
            
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/weaves`,
                    {
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if(!response.ok){
                    throw new Error(data.error || "Failed to fetch weaves");
                }

            setWeaves(data.weaves);

            
        }catch(e){
            console.error("Error fetching Weaves: ", e);
            
             setError(
                e instanceof Error
                    ? e.message
                    : "Failed to fetch weaves"
            );

        }finally{
            setLoading(false);
        }
    }; 
    fetchWeaves();
},[]);

//to create a new Weave
const createWeave = async ()=>{
    setWeaveStatus(true);
    try{
    if(!user){
        throw new Error("User not found");
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/weaves`,
        {
            headers:{
                "Content-Type": "application/json",
            },
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                title: weaveTitle,
            }),
        }
    )

    const data = await response.json();
    
    if(!response.ok){
        throw new Error(
            data.error || 
            "Could not create a weave" );
    }

    setWeaves((previousWeaves)=>[
        ...previousWeaves,
        data.weave,
    ])
    
    }catch(e){
        setError(e instanceof Error
            ? e.message 
            : "Failed to create weave"
        );
    }
    finally{
        setWeaveStatus(false);
        setTitle(false);
        setWeaveTitle("");
    }

}

//delete user weaves 
const deleteWeave = async (id: string)=>{
    try{
      if(!id){
        throw new Error("Weave Id not found");
      } 

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/weaves/${id}`,
        {
            method: "DELETE",
            credentials: "include",
        }
      );

      //const data = await response.json();

      if(!response.ok){
        throw new Error("Server Side Error");
      }

      setMyWeaves(myWeaves.filter((weave)=> weave.id !== id));

      
    }catch(e){
        console.error("Couldn't delete the weave: ", e);
    }
}

useEffect(()=>{

setMyWeaves(weaves.filter(
    (weave: Weave) => weave.user.id === user?.id
))


setLiveWeaves(weaves.filter(
    (weave: Weave)=> weave.user.id !== user?.id
));

},[weaves, user]);



return (
    <div className="min-h-screen bg-[#0b0b0c] text-zinc-100 relative">

        {/* ───────────── Spider Web Background ───────────── */}
        <SpiderWebBackground />

        {/* Ambient Glow Overlays */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-72 left-1/3 w-[700px] h-[700px] rounded-full bg-orange-500/[0.035] blur-[180px]" />
            <div className="absolute top-1/3 -right-72 w-[650px] h-[650px] rounded-full bg-indigo-500/[0.035] blur-[180px]" />
        </div>


        <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-7 md:py-9">


            {/* ───────────── Navigation ───────────── */}

            <nav className="flex items-center justify-between mb-20">

                <div className="flex items-center gap-3">

                    <div className="w-9 h-9 bg-zinc-100 text-black rounded-lg flex items-center justify-center font-black">
                        W
                    </div>

                    <div>
                        <p className="text-xs font-bold tracking-[0.3em] uppercase text-zinc-300">
                            Weave
                        </p>

                        <p className="text-[9px] tracking-[0.18em] uppercase text-zinc-700">
                            Discussion network
                        </p>
                    </div>

                </div>


                <div className="flex items-center gap-5">

                    <div className="hidden sm:block text-right">

                        <p className="text-xs text-zinc-400">
                            {user?.username}
                        </p>

                        <p className="text-[9px] uppercase tracking-widest text-zinc-700">
                            Member
                        </p>

                    </div>


                    <button
                        onClick={logout}
                        className="text-[10px] uppercase tracking-[0.18em] text-zinc-600 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* ───────────── Hero ───────────── */}

            <header className="mb-16">

                <p className="text-[10px] uppercase tracking-[0.35em] text-orange-400 mb-5">
                    Your ideas
                </p>

                <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.055em] leading-[0.95] text-white max-w-4xl">
                    Conversations
                    <span className="block text-zinc-600">
                        worth continuing.
                    </span>
                </h1>

                <p className="mt-7 max-w-lg text-sm leading-7 text-zinc-500">
                    Continue an argument, explore someone else's idea,
                    or put something new on the table.
                </p>

            </header>


            {/* ───────────── Loading / Error ───────────── */}

            {loading && (
                <div className="mb-10 text-xs text-zinc-600 flex items-center gap-3">

                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />

                    Loading discussions...

                </div>
            )}


            {error && (
                <div className="mb-10 px-4 py-3 rounded-xl bg-red-500/[0.05] border border-red-500/20 text-red-400 text-xs">
                    {error}
                </div>
            )}


            {!loading && !error && (
                <>


                    {/* ───────────── Featured area ───────────── */}

                    <section className="grid lg:grid-cols-[1.7fr_0.8fr] gap-5 mb-20">


                        {/* Create */}
                        <div className="relative min-h-[330px] rounded-[28px] overflow-hidden bg-[#141416]/90 backdrop-blur-md border border-white/[0.07] p-7 md:p-10 flex flex-col justify-between">

                            {/* Decorative circle */}
                            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border border-orange-400/[0.08]" />

                            <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border border-orange-400/[0.06]" />


                            <div className="relative">

                                <div className="flex items-center justify-between">

                                    <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">
                                        New conversation
                                    </span>

                                    <span className="text-orange-400 text-lg">
                                        ↗
                                    </span>

                                </div>


                                <h2 className="mt-16 text-3xl md:text-4xl font-semibold tracking-tight text-white max-w-md">
                                    What do you
                                    <span className="text-zinc-600">
                                        {" "}want to argue about?
                                    </span>
                                </h2>

                            </div>


                            <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-10">

                                <p className="text-xs text-zinc-600 max-w-xs leading-5">
                                    Start a discussion and let other people
                                    support, question, challenge or counter
                                    your idea.
                                </p>

                                {title && !weaveStatus && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

                                        <div className="w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#111216] p-6 shadow-2xl">

                                            <div className="flex items-center justify-between mb-6">
                                                <h2 className="text-xl font-semibold text-white">
                                                    Start a new weave
                                                </h2>

                                                <button
                                                    onClick={() => {
                                                        setTitle(false);
                                                        setWeaveTitle("");
                                                    }}
                                                    className="text-zinc-500 hover:text-white text-xl cursor-pointer"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <input
                                                className="w-full bg-transparent border-b border-white/20 text-white outline-none px-2 py-3 focus:border-orange-400 transition-colors"
                                                type="text"
                                                value={weaveTitle}
                                                onChange={(e) => {
                                                    setWeaveTitle(e.target.value);
                                                }}
                                                placeholder="What do you want to argue about?"
                                                autoFocus
                                            />

                                            <button
                                                className="w-full mt-6 px-5 py-3 rounded-xl bg-orange-400 hover:bg-orange-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-black text-sm font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                                                onClick={createWeave}
                                                disabled={!weaveTitle.trim()}
                                            >
                                                Create Weave
                                            </button>

                                        </div>
                                    </div>
                                )}                                

                                
                                <button
                                    className="shrink-0 px-5 py-3 rounded-xl bg-orange-400 hover:bg-orange-300 text-black text-xs font-bold transition-colors cursor-pointer"
                                    onClick={()=>{ 
                                        title
                                        ? setTitle(false)
                                        : setTitle(true)
                                    }}
                                    disabled={title}
                                >
                                    Create a Weave   
                                </button>

                            </div>

                        </div>


                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-5">


                            <div className="rounded-[28px] bg-indigo-500/[0.08] backdrop-blur-md border border-indigo-400/[0.12] p-7 flex flex-col justify-between min-h-[155px]">

                                <div className="flex justify-between items-start">

                                    <span className="text-[9px] uppercase tracking-[0.25em] text-indigo-300/60">
                                        Created
                                    </span>

                                    <span className="text-indigo-300 text-xs">
                                        01
                                    </span>

                                </div>


                                <div>

                                    <p className="text-5xl font-semibold tracking-tight text-indigo-200">
                                        {myWeaves.length}
                                    </p>

                                    <p className="text-xs text-indigo-200/40 mt-2">
                                        your discussions
                                    </p>

                                </div>

                            </div>


                            <div className="rounded-[28px] bg-emerald-500/[0.06] backdrop-blur-md border border-emerald-400/[0.10] p-7 flex flex-col justify-between min-h-[155px]">

                                <div className="flex items-center justify-between">

                                    <span className="text-[9px] uppercase tracking-[0.25em] text-emerald-300/60">
                                        Active
                                    </span>

                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                                </div>


                                <div>

                                    <p className="text-5xl font-semibold tracking-tight text-emerald-200">
                                        {liveWeaves.length}
                                    </p>

                                    <p className="text-xs text-emerald-200/40 mt-2">
                                        open discussions
                                    </p>

                                </div>

                            </div>

                        </div>

                    </section>



                    {/* ───────────── Discussions ───────────── */}

                    <div className="grid lg:grid-cols-2 gap-16">


                        {/* YOUR WEAVES */}

                        <section>

                            <div className="flex items-end justify-between pb-5 border-b border-white/[0.08]">

                                <div>

                                    <p className="text-[9px] uppercase tracking-[0.3em] text-indigo-400 mb-2">
                                        Your space
                                    </p>

                                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                                        My Weaves
                                    </h2>

                                </div>


                                <span className="text-xs text-zinc-700">
                                    {myWeaves.length}
                                </span>

                            </div>


                            <div>

                                {myWeaves.length === 0 ? (

                                    <div className="py-16">

                                        <p className="text-sm text-zinc-600">
                                            You haven't started a discussion yet.
                                        </p>

                                        <p className="text-xs text-zinc-800 mt-2">
                                            Your first idea could start something interesting.
                                        </p>

                                    </div>

                                ) : (

                                    <div>

                                        {myWeaves.map((weave, index) => (

                                            <div
                                                key={weave.id}
                                                className="group flex items-center gap-5 py-6 border-b border-white/[0.06] hover:px-3 transition-all"
                                            >

                                                <div className="shrink-0 w-8 text-[10px] text-zinc-700">
                                                    {String(index + 1).padStart(2, "0")}
                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <h3 className="text-sm md:text-base font-medium text-zinc-300 group-hover:text-white transition-colors truncate">
                                                        {weave.title}
                                                    </h3>

                                                    <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-700 mt-2">
                                                        Started by you
                                                    </p>

                                                </div>
                                                {/* Delete the users weave */}    
                                                <button
                                                    onClick={()=>{deleteWeave(weave.id)}}
                                                    className="shrink-0 w-9 h-9 rounded-full border border-white/[0.08] bg-black/40 text-zinc-600 hover:border-indigo-400/40 hover:text-indigo-300 transition-all cursor-pointer"
                                                    title="Open Weave"
                                                >
                                                    <span className="w-5 h-5 text-red-400 flex items-center justify-center">
                                                        <LuTrash2 />
                                                    </span> 
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        navigate(`/weaves/${weave.id}`)
                                                    }
                                                    className="shrink-0 w-9 h-9 rounded-full border border-white/[0.08] bg-black/40 text-zinc-600 hover:border-indigo-400/40 hover:text-indigo-300 transition-all cursor-pointer"
                                                    title="Open Weave"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

                        </section>



                        {/* LIVE WEAVES */}

                        <section>

                            <div className="flex items-end justify-between pb-5 border-b border-white/[0.08]">

                                <div>

                                    <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-400 mb-2">
                                        Happening now
                                    </p>

                                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                                        Live Weaves
                                    </h2>

                                </div>


                                <div className="flex items-center gap-2">

                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                                    <span className="text-[9px] uppercase tracking-widest text-zinc-700">
                                        Live
                                    </span>

                                </div>

                            </div>


                            <div>

                                {liveWeaves.length === 0 ? (

                                    <div className="py-16">

                                        <p className="text-sm text-zinc-600">
                                            Nothing is happening right now.
                                        </p>

                                        <p className="text-xs text-zinc-800 mt-2">
                                            Start a discussion and change that.
                                        </p>

                                    </div>

                                ) : (

                                    <div>

                                        {liveWeaves.map((weave) => (

                                            <div
                                                key={weave.id}
                                                className="group py-6 border-b border-white/[0.06]"
                                            >

                                                <div className="flex items-start gap-5">

                                                    <div className="shrink-0 pt-1">

                                                        <span className="flex w-8 h-8 rounded-full bg-emerald-400/[0.07] border border-emerald-400/10 items-center justify-center">

                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                                                        </span>

                                                    </div>


                                                    <div className="min-w-0 flex-1">

                                                        <h3 className="text-sm md:text-base font-medium text-zinc-300 group-hover:text-white transition-colors">
                                                            {weave.title}
                                                        </h3>

                                                        <p className="text-[10px] text-zinc-700 mt-2">

                                                            Started by{" "}

                                                            <span className="text-emerald-300/60">
                                                                {weave.user.username}
                                                            </span>

                                                        </p>


                                                        <button
                                                            onClick={() =>
                                                                navigate(`/weaves/${weave.id}`)
                                                            }
                                                            className="mt-4 text-[9px] uppercase tracking-[0.2em] text-zinc-600 hover:text-emerald-300 transition-colors cursor-pointer"
                                                        >
                                                            Enter discussion →
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

                        </section>

                    </div>



                    {/* ───────────── Footer ───────────── */}

                    <footer className="mt-20 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between gap-3">

                        <span className="text-[9px] uppercase tracking-[0.25em] text-zinc-800">
                            WEAVE / DISCUSSION NETWORK
                        </span>

                        <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-800">
                            Ideas become stronger when challenged.
                        </span>

                    </footer>

                </>

            )}

        </div>

    </div>
);
}


export default Dashboard;