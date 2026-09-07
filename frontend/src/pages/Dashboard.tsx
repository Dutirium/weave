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
            
                const response = await fetch(`/api/weaves`,
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

    const response = await fetch(`/api/weaves`,
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

      const response = await fetch(`/api/weaves/${id}`,
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0b0b0c] text-zinc-100 relative">

        {/* ───────────── Spider Web Background ───────────── */}
        <SpiderWebBackground />

        {/* Ambient Glow Overlays */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-72 left-1/3 w-[300px] sm:w-[700px] h-[300px] sm:h-[700px] rounded-full bg-orange-500/[0.035] blur-[100px] sm:blur-[180px]" />
            <div className="absolute top-1/3 -right-72 w-[280px] sm:w-[650px] h-[280px] sm:h-[650px] rounded-full bg-indigo-500/[0.035] blur-[100px] sm:blur-[180px]" />
        </div>


        <div className="relative z-10 w-full max-w-6xl min-w-0 mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-7 md:py-9">


            {/* ───────────── Navigation ───────────── */}

            <nav className="flex items-center justify-between mb-8 sm:mb-14 md:mb-20">

                <div className="flex items-center gap-2.5 sm:gap-3">

                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-zinc-100 text-black rounded-lg flex items-center justify-center font-black text-sm sm:text-base">
                        W
                    </div>

                    <div>
                        <p className="text-[10px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-zinc-300">
                            Weave
                        </p>

                        <p className="text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.18em] uppercase text-zinc-700">
                            Discussion network
                        </p>
                    </div>

                </div>


                <div className="flex items-center gap-3 sm:gap-5">

                    <div className="text-right">

                        <p className="text-xs text-zinc-400 font-medium sm:font-normal">
                            {user?.username}
                        </p>

                        <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-zinc-700 hidden sm:block">
                            Member
                        </p>

                    </div>


                    <button
                        onClick={logout}
                        className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.18em] text-zinc-600 hover:text-orange-400 transition-colors cursor-pointer px-2 py-1 sm:p-0 rounded border border-white/5 sm:border-none"
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* ───────────── Hero ───────────── */}

            <header className="mb-10 sm:mb-14 md:mb-16">

                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-orange-400 mb-3 sm:mb-5">
                    Your ideas
                </p>

                <h1 className="text-3xl sm:text-5xl md:text-7xl font-semibold tracking-[-0.04em] sm:tracking-[-0.055em] leading-[1.05] sm:leading-[0.95] text-white max-w-4xl">
                    Conversations
                    <span className="block text-zinc-600">
                        worth continuing.
                    </span>
                </h1>

                <p className="mt-4 sm:mt-7 max-w-lg text-xs sm:text-sm leading-6 sm:leading-7 text-zinc-500">
                    Continue an argument, explore someone else's idea,
                    or put something new on the table.
                </p>

            </header>


            {/* ───────────── Loading / Error ───────────── */}

            {loading && (
                <div className="mb-8 text-xs text-zinc-600 flex items-center gap-3">

                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />

                    Loading discussions...

                </div>
            )}


            {error && (
                <div className="mb-8 px-4 py-3 rounded-xl bg-red-500/[0.05] border border-red-500/20 text-red-400 text-xs">
                    {error}
                </div>
            )}


            {!loading && !error && (
                <>


                    {/* ───────────── Featured area ───────────── */}

                    <section className="grid lg:grid-cols-[1.7fr_0.8fr] gap-4 sm:gap-5 mb-12 sm:mb-16 md:mb-20">


                        {/* Create Card */}
                        <div className="relative min-h-[260px] sm:min-h-[330px] rounded-2xl sm:rounded-[28px] overflow-hidden bg-[#141416]/90 backdrop-blur-md border border-white/[0.07] p-5 sm:p-7 md:p-10 flex flex-col justify-between">

                            {/* Decorative circles */}
                            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border border-orange-400/[0.08] pointer-events-none" />

                            <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full border border-orange-400/[0.06] pointer-events-none" />


                            <div className="relative">

                                <div className="flex items-center justify-between">

                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-zinc-600">
                                        New conversation
                                    </span>

                                    <span className="text-orange-400 text-base sm:text-lg">
                                        ↗
                                    </span>

                                </div>


                                <h2 className="mt-8 sm:mt-16 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white max-w-md">
                                    What do you
                                    <span className="text-zinc-600">
                                        {" "}want to argue about?
                                    </span>
                                </h2>

                            </div>


                            <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mt-6 sm:mt-10">

                                <p className="text-xs text-zinc-600 max-w-xs leading-5">
                                    Start a discussion and let other people
                                    support, question, challenge or counter
                                    your idea.
                                </p>

                                {title && !weaveStatus && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">

                                        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111216] p-5 sm:p-6 shadow-2xl">

                                            <div className="flex items-center justify-between mb-5 sm:mb-6">
                                                <h2 className="text-lg sm:text-xl font-semibold text-white">
                                                    Start a new weave
                                                </h2>

                                                <button
                                                    onClick={() => {
                                                        setTitle(false);
                                                        setWeaveTitle("");
                                                    }}
                                                    className="text-zinc-500 hover:text-white text-xl p-1 cursor-pointer"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <input
                                                className="w-full bg-transparent border-b border-white/20 text-white text-sm sm:text-base outline-none px-2 py-2.5 sm:py-3 focus:border-orange-400 transition-colors"
                                                type="text"
                                                value={weaveTitle}
                                                onChange={(e) => {
                                                    setWeaveTitle(e.target.value);
                                                }}
                                                placeholder="What do you want to argue about?"
                                                autoFocus
                                            />

                                            <button
                                                className="w-full mt-5 sm:mt-6 px-5 py-3 rounded-xl bg-orange-400 hover:bg-orange-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-black text-xs sm:text-sm font-bold transition-colors cursor-pointer disabled:cursor-not-allowed"
                                                onClick={createWeave}
                                                disabled={!weaveTitle.trim()}
                                            >
                                                Create Weave
                                            </button>

                                        </div>
                                    </div>
                                )}                                

                                
                                <button
                                    className="w-full sm:w-auto shrink-0 px-5 py-3 rounded-xl bg-orange-400 hover:bg-orange-300 text-black text-xs font-bold transition-colors cursor-pointer text-center"
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


                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-5">


                            <div className="rounded-2xl sm:rounded-[28px] bg-indigo-500/[0.08] backdrop-blur-md border border-indigo-400/[0.12] p-4 sm:p-7 flex flex-col justify-between min-h-[130px] sm:min-h-[155px]">

                                <div className="flex justify-between items-start">

                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-indigo-300/60">
                                        Created
                                    </span>

                                    <span className="text-indigo-300 text-[10px] sm:text-xs">
                                        01
                                    </span>

                                </div>


                                <div>

                                    <p className="text-3xl sm:text-5xl font-semibold tracking-tight text-indigo-200">
                                        {myWeaves.length}
                                    </p>

                                    <p className="text-[10px] sm:text-xs text-indigo-200/40 mt-1 sm:mt-2">
                                        your discussions
                                    </p>

                                </div>

                            </div>


                            <div className="rounded-2xl sm:rounded-[28px] bg-emerald-500/[0.06] backdrop-blur-md border border-emerald-400/[0.10] p-4 sm:p-7 flex flex-col justify-between min-h-[130px] sm:min-h-[155px]">

                                <div className="flex items-center justify-between">

                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-emerald-300/60">
                                        Active
                                    </span>

                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />

                                </div>


                                <div>

                                    <p className="text-3xl sm:text-5xl font-semibold tracking-tight text-emerald-200">
                                        {liveWeaves.length}
                                    </p>

                                    <p className="text-[10px] sm:text-xs text-emerald-200/40 mt-1 sm:mt-2">
                                        open discussions
                                    </p>

                                </div>

                            </div>

                        </div>

                    </section>



                    {/* ───────────── Discussions ───────────── */}

                    <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16">


                        {/* YOUR WEAVES */}

                        <section>

                            <div className="flex items-end justify-between pb-4 sm:pb-5 border-b border-white/[0.08]">

                                <div>

                                    <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-indigo-400 mb-1 sm:mb-2">
                                        Your space
                                    </p>

                                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                                        My Weaves
                                    </h2>

                                </div>


                                <span className="text-xs text-zinc-700 font-medium">
                                    {myWeaves.length}
                                </span>

                            </div>


                            <div>

                                {myWeaves.length === 0 ? (

                                    <div className="py-10 sm:py-16">

                                        <p className="text-xs sm:text-sm text-zinc-600">
                                            You haven't started a discussion yet.
                                        </p>

                                        <p className="text-[11px] sm:text-xs text-zinc-800 mt-1 sm:mt-2">
                                            Your first idea could start something interesting.
                                        </p>

                                    </div>

                                ) : (

                                    <div>

                                        {myWeaves.map((weave, index) => (

                                            <div
                                                key={weave.id}
                                                className="group flex items-center gap-3 sm:gap-5 py-4 sm:py-6 border-b border-white/[0.06] hover:px-2 sm:hover:px-3 transition-all"
                                            >

                                                <div className="shrink-0 w-6 sm:w-8 text-[9px] sm:text-[10px] text-zinc-700">
                                                    {String(index + 1).padStart(2, "0")}
                                                </div>


                                                <div className="min-w-0 flex-1">

                                                    <h3 className="text-xs sm:text-base font-medium text-zinc-300 group-hover:text-white transition-colors truncate">
                                                        {weave.title}
                                                    </h3>

                                                    <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.18em] text-zinc-700 mt-1 sm:mt-2">
                                                        Started by you
                                                    </p>

                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={()=>{deleteWeave(weave.id)}}
                                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/[0.08] bg-black/40 text-zinc-600 hover:border-indigo-400/40 hover:text-indigo-300 transition-all flex items-center justify-center cursor-pointer"
                                                        title="Delete Weave"
                                                    >
                                                        <span className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex items-center justify-center">
                                                            <LuTrash2 />
                                                        </span> 
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            navigate(`/weaves/${weave.id}`)
                                                        }
                                                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/[0.08] bg-black/40 text-zinc-600 hover:border-indigo-400/40 hover:text-indigo-300 transition-all flex items-center justify-center cursor-pointer"
                                                        title="Open Weave"
                                                    >
                                                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>

                                            </div>

                                        ))}

                                    </div>

                                )}

                            </div>

                        </section>



                        {/* LIVE WEAVES */}

                        <section>

                            <div className="flex items-end justify-between pb-4 sm:pb-5 border-b border-white/[0.08]">

                                <div>

                                    <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-emerald-400 mb-1 sm:mb-2">
                                        Happening now
                                    </p>

                                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                                        Live Weaves
                                    </h2>

                                </div>


                                <div className="flex items-center gap-1.5 sm:gap-2">

                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-zinc-700">
                                        Live
                                    </span>

                                </div>

                            </div>


                            <div>

                                {liveWeaves.length === 0 ? (

                                    <div className="py-10 sm:py-16">

                                        <p className="text-xs sm:text-sm text-zinc-600">
                                            Nothing is happening right now.
                                        </p>

                                        <p className="text-[11px] sm:text-xs text-zinc-800 mt-1 sm:mt-2">
                                            Start a discussion and change that.
                                        </p>

                                    </div>

                                ) : (

                                    <div>

                                        {liveWeaves.map((weave) => (

                                            <div
                                                key={weave.id}
                                                className="group py-4 sm:py-6 border-b border-white/[0.06]"
                                            >

                                                <div className="flex items-start gap-3 sm:gap-5">

                                                    <div className="shrink-0 pt-0.5 sm:pt-1">

                                                        <span className="flex w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-400/[0.07] border border-emerald-400/10 items-center justify-center">

                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                                                        </span>

                                                    </div>


                                                    <div className="min-w-0 flex-1">

                                                        <h3 className="text-xs sm:text-base font-medium text-zinc-300 group-hover:text-white transition-colors">
                                                            {weave.title}
                                                        </h3>

                                                        <p className="text-[9px] sm:text-[10px] text-zinc-700 mt-1 sm:mt-2">

                                                            Started by{" "}

                                                            <span className="text-emerald-300/60 font-medium">
                                                                {weave.user.username}
                                                            </span>

                                                        </p>


                                                        <button
                                                            onClick={() =>
                                                                navigate(`/weaves/${weave.id}`)
                                                            }
                                                            className="mt-3 sm:mt-4 text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-zinc-500 hover:text-emerald-300 transition-colors cursor-pointer"
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

                    <footer className="mt-12 sm:mt-16 md:mt-20 pt-5 sm:pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">

                        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-zinc-800">
                            WEAVE / DISCUSSION NETWORK
                        </span>

                        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-zinc-800">
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