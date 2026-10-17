import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/weave.css";

//import SpiderWebBackground from '../components/SpiderWebBackground.js';

type Message ={
    id:string,
    content: string,
    sequence: number,
    createdAt: string,
    relation: string | null,
    target_message_id: string | null,
    stance: string
    user: {
        id: string,
        username: string,
    };
};

type WeaveData = {
    id: string,
    title: string,
    totalSwitches: number,
    stances:[ {
        switch: number,
        stance: string,
       }
    ],
    user: {
        username: string,
        id: string,
    };
};



const Weave = ()=>{
    //weave id sent thorugh the params
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
    const [stance, setStance] = useState<string | null>(null);
    const [switchCount, setSwitchCount] = useState<number>(3);
    const [popup, setPopup] = useState<String>("");
    const [changeStance, setChangeStance] = useState<boolean>(false);
    const [switchMode, setSwitchMode] = useState<boolean>(false);
    const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

    //load weave and related messages
    useEffect(()=>{
        const fetchWeave = async ()=>{
            try{

                if(!id){
                    throw new Error("Weave not found");
                }

                const [weaveResponse, messageResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/weaves/${id}`,
                    //fetch(`/api/weaves/${id}`,
                        {
                            credentials: "include",
                        }
                    ),

                    fetch(`${import.meta.env.VITE_API_URL}/api/weaves/${id}/messages`,
                    //fetch(`/api/weaves/${id}/messages`,
                        {
                            credentials: "include",
                            
                        }
                        
                    )
                ]);

                const weaveData = await weaveResponse.json();
                const messageData = await messageResponse.json();

                console.log("Messages received from API:", messageData.messages);
                console.log("Weave received from API:", weaveData.weave);   



                if(!weaveResponse.ok){
                    throw new Error(weaveData.error || "Failed to fetch Weave");
                }

                if(!messageResponse.ok){
                    throw new Error(messageData.error || "Failed to fetch messages");
                }

                //check for the stance if available
                if(weaveData.weave.stances && weaveData.weave.stances.length>0){
                    setStance(weaveData.weave.stances[0].stance);
                }

                //check for the switches left
                if(weaveData.weave.stances && weaveData.weave.stances.length>0){
                    setSwitchCount(weaveData.weave.stances[0].switch);
                }

                setWeave(weaveData.weave);
                setMessages(messageData.messages);

                console.log("Switch count =", switchCount);
             

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
    

    //websocket connction from the frontend 
    useEffect(() => {

    if (!id) return;

    const socket = new WebSocket(
        import.meta.env.VITE_WS_URL || "ws://localhost:5000"
    );

    socket.onopen = () => {

        console.log("WebSocket connected");

        socket.send(
            JSON.stringify({
                type: "subscribe",
                weaveId: id,
            })
        );

    };

    socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    console.log("WS EVENT TYPE:", data.type);
    console.log("WS EVENT DATA:", data);

    if (data.type === "message:new") {
        console.log("NEW MESSAGE RECEIVED:", data.message);

        setMessages((previousMessages) => {
            if (
                previousMessages.some(
                    (message) => message.id === data.message.id
                )
            ) {
                return previousMessages;
            }

            return [...previousMessages, data.message];
        });
    }
};



    // socket.onmessage = (event) => {

    //     try {

    //         const data = JSON.parse(event.data);

    //         console.log("WebSocket event:", data);

    //         if (data.type === "message:new") {

    //             setMessages((previousMessages) => {

    //                 // Prevent duplicates
    //                 const alreadyExists = previousMessages.some(
    //                     (message) =>
    //                         message.id === data.message.id
    //                 );

    //                 if (alreadyExists) {
    //                     return previousMessages;
    //                 }

    //                 return [
    //                     ...previousMessages,
    //                     data.message,
    //                 ];

    //             });

    //         }

    //     } catch (error) {

    //         console.error(
    //             "Invalid WebSocket event:",
    //             error
    //         );

    //     }

    // };

    socket.onerror = (error) => {

        console.error(
            "WebSocket error:",
            error
        );

    };

    socket.onclose = () => {

        console.log(
            "WebSocket disconnected"
        );

    };

    return () => {

        console.log(
            "Closing WebSocket connection"
        );

        socket.close();

    };

}, [id]);


    //update stance when user selects a stance  

        const updateStance = async (newStance: string)=>{
        try{
            if(!newStance){
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/weaves/${id}/stance`,
                //`/api/weaves/${id}/stance`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers:{
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        stance: newStance,
                        switch: switchCount-1,
                    }),
                }
            );

            const data = await response.json();

            if(!response.ok){
                throw new Error(
                    data.error || "Failed to validate stance"
                );
            }
            setStance(newStance);
            

        }catch(e){
            console.error("Error validating stance: ", e);
            setStance(null);
            return;
        }
    }
   

    // to update switch, stance and push the creadibility of the user and to the target users
    const updateSwitch = async (currentStance: string)=>{
        try{
            if(selectedMessages.length<=0){
                setPopup("Select atleast one argument");
                setTimeout(()=>{
                    setPopup("");
                },2000);
                return;
            }

            if(switchCount <= 0){
                setPopup("You dont have any switches left");
                setTimeout(()=>{
                    setPopup("");
                },2000)
                return;
            }


            if(currentStance==null){
                setPopup("Choose a stance first");
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/user/${id}/stanceNcredibility`,
            {
                method: "POST",
                headers:{
                    "Content-Type":"application/json",
                },
                //mNuIds stand for userIds
                credentials: "include",
                body: JSON.stringify({
                    stance: currentStance,
                    messageIds: selectedMessages,
                }),
            });
            const data = await response.json();
            //const data = await response.json();
            if(!response.ok){
                setError(data.error);
                throw new Error("Cannot change stance right now");
            }

            setPopup("Stance changed successfully");

            setSwitchCount((prev)=> prev-1);
            setStance(currentStance);
            setTimeout(()=>{
                setPopup("");
            },2000);

            setChangeStance(false);
            setSwitchMode(false);
            setSelectedMessages([]);

        }catch(e){
           console.error("Cannot switch right now",e);
           setTimeout(()=>{
            setError("")
           },5000)
        }
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
                `${import.meta.env.VITE_API_URL}/api/weaves/${id}/messages`,
                //`/api/weaves/${id}/messages`,
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
                        stance: stance,
                    }),
                }
            ); 

            const data = await response.json();

           if(!response.ok){
            throw new Error (
                data.error || "Failed to send messages"
            );
           }

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

    //toggle between selected messages
    const toggleMessageSelection = (messageIds: string) =>{
        setSelectedMessages((prev)=>{

           if( prev.includes(messageIds)){
            return prev.filter(id => id !== messageIds);
           }

           if(prev.length>=4){
            return prev;
           }

           return [...prev, messageIds];
        });
    };




    if(loading){
        return <p>Loading data....</p>
    }

    if(error){
        return <p>{error}</p>
    }

    if(!weave){
        return <p>Weave not found</p>
    }
    
    


return (
    <main className="weave-page">
        <header className="weave-header">
            <div className="weave-brand">
                <strong className="weave-logo">W</strong>

                <div className="weave-brand-text">
                    <strong>WEAVE</strong>
                    <span>Argument network</span>
                </div>
            </div>
            
            {popup && (
            <div className="popup-overlay">
                <div className="popup-box">
                {popup}
                </div>
            </div>
            )}
            {error && (
            <div className="popup-overlay">
                <div className="popup-box">
                {error}
                </div>
            </div>
            )}
            
            <span className="weave-status">Live discussion</span>

            <p className="weave-type">Open discussion</p>

            <h1 className="weave-title">{weave.title} </h1>
            <br />+
            
            <h1> <strong>Total Number of switches {weave.totalSwitches} </strong> </h1>

            <div className="weave-meta">
                <span>
                    Started by {weave.user.username}
                </span>

                <span>
                    {messages.length}{" "}
                    {messages.length === 1 ? "argument" : "arguments"}
                </span>
            </div>
        </header>
        
        {switchMode && (
            <div className="switch-mode-overlay">
                <h2>
                    Select arguments that made you change your mind at max 4
                </h2>
                <p>
                    {selectedMessages.length} / 4 selected
                </p>
            </div>
        )}

        <section className="discussion-panel">
            <header className="discussion-header">
                <div>
                    <h2>Discussion</h2>

                    <p>
                        Follow the arguments. Challenge ideas. Build the thread.
                    </p>
                </div>

                <span className="discussion-count">
                    {messages.length}
                </span>
            </header>

            <div className="discussion-body">
                {messages.length === 0 ? (
                    <div className="empty-discussion">
                        <p>No arguments yet.</p>
                        <p>Be the first voice in this discussion.</p>
                    </div>
                ) : (
                    <div className="message-list">
                        {messages.map((message) => {
                            const targetMessage = getTargetMessage(
                                message.target_message_id
                            );

                            return (
                                <article
                                    key={message.id}
                                    onClick={()=>{
                                        if(switchMode){
                                            toggleMessageSelection(message.id);
                                        }
                                    }}
                                    className={`
                                        ${
                                            message.stance === "SUPPORT"
                                            ? "message message-for"
                                            : message.stance === "CHALLENGE"
                                            ? "message message-against"
                                            : "message message-neutral"
                                        }
                                        ${switchMode ? "selected-message": ""}
                                        ${
                                            selectedMessages.some(
                                                item => item === message.id
                                            )
                                                ? "selected-message"
                                                : ""
                                        }        
                                        
                                    `}
                                    

                                >
                                    <div className="message-avatar">
                                        <strong>
                                            {message.user.username
                                                .charAt(0)
                                                .toUpperCase()}
                                        </strong>

                                    </div>

                                    <div className="message-content">
                                        <div className="message-header">
                                            <div className="message-author">
                                                <strong>
                                                    {message.user.username}
                                                </strong>

                                                <span>
                                                    #{message.sequence}
                                                </span>

                                                {switchMode && (

                                                    <input 
                                                    type="checkbox"
                                                    checked = {selectedMessages.some(item=> item === message.id)}
                                                    onChange ={()=>{toggleMessageSelection(message.id)}}
                                                    onClick={(e)=>{e.stopPropagation()}} />
                                                )}
                                            </div>
                                        </div>

                                        {message.relation && targetMessage && (
                                            <div className="message-relation">
                                                <span>
                                                    {message.relation}
                                                </span>

                                                <span>→</span>

                                                <span>
                                                    {targetMessage.user.username}
                                                </span>
                                            </div>
                                        )}

                                        <p className="message-text">
                                            {message.content}
                                        </p>

                                        <div className="message-footer">
                                            <span>
                                                Argument #{message.sequence}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReplyTo(message);
                                                    setRelation("REPLY");
                                                }}
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {replyTo && (
                    <section className="reply-panel">
                        <div className="reply-header">
                            <div>
                                <p>Responding to</p>
                                <strong>{replyTo.user.username}</strong>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setReplyTo(null);
                                    setRelation("REPLY");
                                }}
                                disabled={sending}
                            >
                                Cancel
                            </button>
                        </div>

                        <p className="reply-preview">
                            “{replyTo.content}”
                        </p>

                        <label className="reply-relation">
                            Your relation

                            <select
                                value={relation}
                                onChange={(e) => setRelation(e.target.value)}
                                disabled={sending}
                            >
                                <option value="REPLY">Reply</option>
                                <option value="SUPPORT">Support</option>
                                <option value="CHALLENGE">Challenge</option>
                                <option value="COUNTER">Counter</option>
                                <option value="QUESTION">Question</option>
                            </select>
                        </label>
                    </section>
                )}

                <form
                    className="message-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                >
                    <input
                        className="message-input"
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={
                            replyTo
                                ? "Write your response..."
                                : "Add your argument to the thread..."
                        }
                        disabled={sending}
                    />

                    <span className="message-form-hint">
                        {replyTo
                            ? `Replying to ${replyTo.user.username}`
                            : "Join the argument"}
                    </span>
                
                    {!stance && 
                    <span 
                    className="message-form-hint">
                        Select your stance:
                       <button
                       type="button"
                       className="message-submit"
                       onClick={()=>{
                        updateStance("SUPPORT");
                       }}>
                        Support
                       </button>

                       <button
                       type="button"
                       className="message-submit"
                       onClick={()=>{
                        updateStance("CHALLENGE");
                       }}>
                        CHALLENGE
                       </button>
                        
                       <button
                       type="button"
                       className="message-submit"
                       onClick={()=>{
                        updateStance("NEUTRAL");
                       }}>
                        Neutral

                       </button>
                       <br />
                    <span className="message-form-hint">
                       <h1> Stance is required to post an argument. </h1>
                    </span>
                    </span>
                    }

                    {(stance && !changeStance) && (
                        <div>
                            <h1>You have {switchCount} switches left</h1>
                            <button 
                            className="message-submit"
                            disabled={switchCount==0}
                            onClick={()=>{
                                setChangeStance(true);
                                setSwitchMode(true);
                            }}> Switch </button>
                        </div>
                    )}

                    {(changeStance) && (
                       <div>
                       <button
                       type="button"
                       className="message-submit"
                       onClick={()=>{
                        updateSwitch("SUPPORT");
                       }}>
                        Support
                       </button>

                       <button
                       type="button"
                       className="message-submit"
                       onClick={()=>{
                        updateSwitch("CHALLENGE");
                       }}>
                        CHALLENGE
                       </button>
                        
                       <button
                       type="button"
                       className="message-submit"
                       onClick={()=>{
                        updateSwitch("NEUTRAL");
                       }}>
                        Neutral
                       </button>

                        <button onClick={()=>{setChangeStance(false)
                            setSwitchMode(false);
                        }}>
                            Cancel
                        </button>
                        </div>

                        
                    )}

                    <button
                        className="message-submit"
                        type="submit"
                        disabled={sending || !content.trim() || !stance}
                    >
                        {sending ? "Posting..." : "Post argument"}
                    </button>

                </form>

                {sendError && (
                    <p className="message-error">
                        {sendError}
                    </p>
                )}
            </div>
        </section>
    </main>
);

}

export default Weave;