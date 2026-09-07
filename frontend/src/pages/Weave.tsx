import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SpiderWebBackground from '../components/SpiderWebBackground.js';

type Message ={
    id:string,
    content: string,
    sequence: number,
    createdAt: string,
    relation: string | null,
    target_message_id: string | null,
    user: {
        id: string,
        username: string,
    };
};

type WeaveData = {
    id: string,
    title: string,
    user: {
        username: string,
        id: string,
    };
};

const Weave = ()=>{
    const { id } = useParams< {id: string} >();

    const [weave, setWeave] = useState<WeaveData | null>(null);
    const [messages, setMessages] = useState<Message[] | [] >([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState("");
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [relation, setRelation] = useState("REPLY");

    //load weave and related messages
    useEffect(()=>{
        const fetchWeave = async ()=>{
            try{
                
                if(!id){
                    throw new Error("Weave id not found");
                }

                const [weaveResponse, messageResponse] = await Promise.all([

                    fetch(`/api/weaves/${id}`,
                        {
                            credentials: "include",
                        }
                    ),

                    fetch(`/api/weaves/${id}/messages`,
                        {
                            credentials: "include",
                        }
                    )

                ]);

                const weaveData = await weaveResponse.json();
                const messageData = await messageResponse.json();

                if(!weaveResponse.ok){
                    throw new Error(weaveData.error || "Failed to fetch Weave");
                }

                if(!messageResponse.ok){
                    throw new Error(messageData.error || "Failed to fetch messages");
                }

                setWeave(weaveData.weave);
                setMessages(messageData.messages);

            }catch(e){

                console.error("Error loading weave: ", e);

                setError(
                    e instanceof Error
                    ? e.message
                    : "Failed to load weave"
                );
            }
            finally{
                setLoading(false);
            }

        }; fetchWeave();
    },[id]);

    if(loading){
        return <p>Loading data....</p>
    }

    if(error){
        return <p>{error}</p>
    }

    if(!weave){
        return <p>Weave not found</p>
    }
    
    //send messages 
    const sendMessage = async ()=>{

        if(!id || !content.trim() || sending){
            return;
        }

        try{
            setSending(true);
            setSendError("");

            const clientMessageId = crypto.randomUUID();
            
            const response = await fetch(
                `/api/weaves/${id}/messages`,
                {
                    method: "POST",
                    credentials: "include",
                    headers:{
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: content.trim(),
                        clientMessageId,
                        targetMessageId: replyTo?.id,
                        relation: replyTo ? relation : undefined,
                    }),
                }
            ); 

            const data = await response.json();

            if(!response.ok){
                throw new Error(
                    data.error || "Failed to send message"
                );
            }

            setMessages((previousMessages)=>[
                ...previousMessages,
                data.message,
            ]);

            setContent("");
            setReplyTo(null);

        }catch(e){
            console.error("Error sending Message: ",e);

            setSendError(
                e instanceof Error
                ? e.message
                : "Failed to send message"
            );
        }finally{
            setSending(false);
            
        }
    }

    const getTargetMessage = (targetMessageId: string | null)=>{

        if(!targetMessageId){
            return null;
        }

        return messages.find(
            (message)=> message.id === targetMessageId
        );
    }



return (
    <>
        <SpiderWebBackground />

        <div className="min-h-screen bg-[#07080b]/85 text-zinc-100 relative overflow-hidden">

            {/* Ambient lighting */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-60 left-[10%] w-[300px] sm:w-[700px] h-[300px] sm:h-[700px] bg-violet-600/[0.10] rounded-full blur-[100px] sm:blur-[180px]" />
                <div className="absolute top-[25%] -right-60 w-[280px] sm:w-[650px] h-[280px] sm:h-[650px] bg-indigo-500/[0.08] rounded-full blur-[100px] sm:blur-[180px]" />
                <div className="absolute bottom-[-300px] left-[30%] w-[260px] sm:w-[600px] h-[260px] sm:h-[600px] bg-fuchsia-500/[0.045] rounded-full blur-[100px] sm:blur-[180px]" />
            </div>


            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">

                {/* ─────────────────────────
                    HEADER
                ───────────────────────── */}

                <header className="mb-8 sm:mb-12">

                    <div className="flex items-center justify-between gap-3 mb-6 sm:mb-12">

                        {/* Logo */}
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm sm:text-base shadow-[0_0_30px_rgba(255,255,255,0.12)]">
                                W
                            </div>

                            <div>
                                <div className="text-[10px] sm:text-xs font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase text-white">
                                    WEAVE
                                </div>

                                <div className="text-[8px] sm:text-[9px] tracking-[0.15em] sm:tracking-[0.18em] uppercase text-zinc-600 mt-0.5">
                                    Argument network
                                </div>
                            </div>
                        </div>


                        {/* Live indicator */}
                        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.04]">
                            <span className="relative flex w-2 h-2">
                                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-50 animate-ping" />
                                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                            </span>

                            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-emerald-400/80">
                                Live discussion
                            </span>
                        </div>

                    </div>


                    {/* Title */}
                    <div className="max-w-4xl">

                        <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-5">
                            <span className="h-px w-6 sm:w-8 bg-violet-400" />
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-violet-300">
                                Open discussion
                            </p>
                        </div>


                        <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] sm:tracking-[-0.04em] leading-[1.1] sm:leading-[0.98] text-white break-words">
                            {weave.title}
                        </h1>


                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-6 text-xs">

                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-violet-500/15 border border-violet-400/20 flex items-center justify-center">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-violet-300">
                                        {weave.user.username
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>
                                </div>

                                <span className="text-zinc-500 text-[11px] sm:text-xs">
                                    Started by
                                </span>

                                <span className="text-zinc-200 font-medium text-[11px] sm:text-xs">
                                    {weave.user.username}
                                </span>
                            </div>

                            <span className="text-zinc-700">/</span>

                            <span className="text-zinc-600 text-[11px] sm:text-xs">
                                {messages.length}{" "}
                                {messages.length === 1
                                    ? "argument"
                                    : "arguments"}
                            </span>

                        </div>

                    </div>

                </header>


                {/* ─────────────────────────
                    DISCUSSION
                ───────────────────────── */}

                <section className="relative rounded-2xl sm:rounded-3xl border border-white/[0.10] bg-[#0d0e12]/90 backdrop-blur-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.45)]">

                    {/* Top glow */}
                    <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-violet-400/80 to-transparent" />
                    <div className="absolute top-0 left-[25%] w-[30%] h-20 bg-violet-500/[0.08] blur-3xl pointer-events-none" />


                    {/* Discussion header */}
                    <div className="relative px-4 py-4 sm:px-6 sm:py-5 md:px-8 border-b border-white/[0.07]">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                                    <h2 className="text-xs sm:text-sm font-semibold text-white">
                                        Discussion
                                    </h2>
                                </div>

                                <p className="text-[10px] sm:text-[11px] text-zinc-600 mt-1">
                                    Follow the arguments. Challenge ideas. Build the thread.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-zinc-700 hidden sm:inline">
                                    Thread
                                </span>

                                <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                                    <span className="text-[9px] sm:text-[10px] font-semibold text-zinc-300">
                                        {messages.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* ─────────────────────────
                        MESSAGES
                    ───────────────────────── */}

                    <div className="p-4 sm:p-5 md:p-8">

                        {messages.length === 0 ? (

                            <div className="py-12 sm:py-20 text-center">
                                <div className="relative mx-auto mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16">
                                    <div className="absolute inset-0 rounded-2xl bg-violet-500/10 blur-xl" />
                                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] flex items-center justify-center">
                                        <span className="text-xl sm:text-2xl text-violet-300">
                                            +
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs sm:text-sm text-zinc-400">
                                    No arguments yet.
                                </p>

                                <p className="text-[11px] sm:text-xs text-zinc-700 mt-1.5">
                                    Be the first voice in this discussion.
                                </p>
                            </div>

                        ) : (

                            <div className="space-y-4 sm:space-y-5">

                                {messages.map((message, index) => {

                                    const targetMessage =
                                        getTargetMessage(
                                            message.target_message_id
                                        );

                                    return (

                                        <div
                                            key={message.id}
                                            className="group relative"
                                        >

                                            {/* Thread connection line */}
                                            {index < messages.length - 1 && (
                                                <div className="absolute left-[15px] sm:left-[20px] top-10 sm:top-12 bottom-[-16px] sm:bottom-[-20px] w-px bg-gradient-to-b from-violet-400/30 via-white/[0.08] to-transparent" />
                                            )}


                                            <div className="relative flex gap-2.5 sm:gap-4">

                                                {/* Node Avatar */}
                                                <div className="relative shrink-0">
                                                    <div className="absolute inset-[-5px] rounded-xl bg-violet-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#15131d] border border-violet-400/25 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.08)]">
                                                        <span className="text-[10px] sm:text-xs font-bold text-violet-300">
                                                            {message.user.username
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>


                                                {/* Message body */}
                                                <div className="min-w-0 flex-1">

                                                    <div className="rounded-xl sm:rounded-2xl bg-white/[0.035] border border-white/[0.075] group-hover:bg-white/[0.05] group-hover:border-violet-400/20 transition-all duration-300 overflow-hidden">

                                                        {/* Message top header */}
                                                        <div className="px-3.5 pt-3 sm:px-5 sm:pt-4">
                                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                <span className="text-xs sm:text-sm font-semibold text-white">
                                                                    {message.user.username}
                                                                </span>

                                                                <span className="text-zinc-700 text-xs">
                                                                    /
                                                                </span>

                                                                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.18em] text-zinc-600">
                                                                    #{message.sequence}
                                                                </span>
                                                            </div>


                                                            {/* Relation indicator */}
                                                            {message.relation &&
                                                                targetMessage && (
                                                                    <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                                        <div className="inline-flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-violet-500/[0.08] border border-violet-400/15">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                                                                            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.18em] font-semibold text-violet-300">
                                                                                {message.relation}
                                                                            </span>
                                                                        </div>

                                                                        <span className="text-zinc-700 text-xs">
                                                                            →
                                                                        </span>

                                                                        <span className="text-[9px] sm:text-[10px] text-zinc-500">
                                                                            {targetMessage.user.username}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </div>


                                                        {/* Text Content */}
                                                        <div className="px-3.5 py-3 sm:px-5 sm:py-5">
                                                            <p className="text-xs sm:text-sm md:text-[15px] leading-6 sm:leading-7 text-zinc-300 whitespace-pre-wrap break-words">
                                                                {message.content}
                                                            </p>
                                                        </div>


                                                        {/* Actions */}
                                                        <div className="px-3.5 py-2 sm:px-5 sm:py-3 border-t border-white/[0.05] flex items-center justify-between">
                                                            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-zinc-700">
                                                                Argument #{message.sequence}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setReplyTo(message);
                                                                    setRelation("REPLY");
                                                                }}
                                                                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-zinc-500 hover:text-violet-300 hover:bg-violet-500/[0.08] border border-transparent hover:border-violet-400/15 transition-all cursor-pointer"
                                                            >
                                                                Reply
                                                            </button>
                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    );

                                })}

                            </div>

                        )}


                        {/* ─────────────────────────
                            REPLY CONTEXT
                        ───────────────────────── */}

                        {replyTo && (

                            <div className="mt-5 sm:mt-7 rounded-xl sm:rounded-2xl border border-violet-400/20 bg-violet-500/[0.055] overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.05)]">

                                <div className="px-3.5 py-3 sm:px-5 sm:py-4 border-b border-violet-400/10">

                                    <div className="flex items-center justify-between">

                                        <div className="flex items-center gap-2.5 sm:gap-3">
                                            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)]" />

                                            <div>
                                                <p className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-violet-300">
                                                    Responding to
                                                </p>

                                                <p className="text-xs sm:text-sm text-white font-medium mt-0.5 sm:mt-1">
                                                    {replyTo.user.username}
                                                </p>
                                            </div>
                                        </div>


                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReplyTo(null);
                                                setRelation("REPLY");
                                            }}
                                            disabled={sending}
                                            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-all cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>

                                    </div>

                                </div>


                                <div className="px-3.5 py-3 sm:px-5 sm:py-5">
                                    <p className="text-xs sm:text-sm leading-6 sm:leading-7 text-zinc-400 italic break-words">
                                        “{replyTo.content}”
                                    </p>
                                </div>


                                <div className="px-3.5 py-3 sm:px-5 sm:py-4 border-t border-violet-400/10 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">

                                    <label className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                                        Your relation
                                    </label>

                                    <select
                                        value={relation}
                                        onChange={(e) =>
                                            setRelation(e.target.value)
                                        }
                                        disabled={sending}
                                        className="w-full sm:w-48 bg-[#090a0d] border border-white/[0.10] rounded-xl px-3 py-2 sm:py-2.5 text-xs text-zinc-300 outline-none focus:border-violet-400/50 focus:ring-4 focus:ring-violet-500/10 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <option value="REPLY">Reply</option>
                                        <option value="SUPPORT">Support</option>
                                        <option value="CHALLENGE">Challenge</option>
                                        <option value="COUNTER">Counter</option>
                                        <option value="QUESTION">Question</option>
                                    </select>

                                </div>

                            </div>

                        )}


                        {/* ─────────────────────────
                            COMPOSER
                        ───────────────────────── */}

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage();
                            }}
                            className="mt-5 sm:mt-7"
                        >

                            <div className="relative rounded-xl sm:rounded-2xl bg-[#090a0d] border border-white/[0.10] focus-within:border-violet-400/40 focus-within:shadow-[0_0_35px_rgba(139,92,246,0.08)] transition-all overflow-hidden">

                                {/* Composer glow */}
                                <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity" />

                                <input
                                    type="text"
                                    value={content}
                                    onChange={(e) =>
                                        setContent(e.target.value)
                                    }
                                    placeholder={
                                        replyTo
                                            ? "Write your response..."
                                            : "Add your argument to the thread..."
                                    }
                                    disabled={sending}
                                    className="w-full bg-transparent px-3.5 py-3.5 sm:px-5 sm:py-5 text-xs sm:text-sm text-white placeholder:text-zinc-700 outline-none"
                                />

                                <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-t border-white/[0.06]">

                                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pr-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400/70 shrink-0" />

                                        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-zinc-700 truncate">
                                            {replyTo
                                                ? `Replying to ${replyTo.user.username}`
                                                : "Join the argument"}
                                        </span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={
                                            sending ||
                                            !content.trim()
                                        }
                                        className="shrink-0 group px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-white hover:bg-violet-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black text-[9px] sm:text-[10px] uppercase tracking-[0.12em] font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <span className="group-hover:mr-1 transition-all">
                                            {sending
                                                ? "Posting..."
                                                : "Post argument"}
                                        </span>
                                    </button>

                                </div>

                            </div>

                        </form>


                        {/* Error */}
                        {sendError && (
                            <div className="mt-3 sm:mt-4 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-rose-500/[0.06] border border-rose-400/20 text-rose-400 text-xs">
                                {sendError}
                            </div>
                        )}

                    </div>

                </section>


                {/* ─────────────────────────
                    FOOTER
                ───────────────────────── */}

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-zinc-700">

                    <span>
                        WEAVE // ARGUMENT GRAPH
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        <span>
                            Network active
                        </span>
                    </div>

                </div>

            </div>

        </div>
    </>
);


}


export default Weave;