import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

                    fetch(`${import.meta.env.VITE_API_URL}/api/weaves/${id}`,
                        {
                            credentials: "include",
                        }
                    ),

                    fetch(`${import.meta.env.VITE_API_URL}/api/weaves/${id}/messages`,
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
                `${import.meta.env.VITE_API_URL}/api/weaves/${id}/messages`,
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
    <div>
        <header>
        <h1>{weave.title}</h1>

            <p>
                Created by <strong> {weave.user.username} </strong>
            </p>
        </header>
        <hr />

      <section>
    <h2>Discussion</h2>

    {messages.length === 0 ? (
        <p>No messages yet</p>
    ) : (
        messages.map((message) => {
            const targetMessage = getTargetMessage(
                message.target_message_id
            );

            return (
                <div key={message.id}>
                    <strong>{message.user.username}</strong>

                    {message.relation && targetMessage && (
                        <p>
                            <small>
                                {message.relation} →{" "}
                                {targetMessage.user.username}
                            </small>
                        </p>
                    )}

                    <p>{message.content}</p>

                    <button
                        type="button"
                        onClick={() => {
                            setReplyTo(message);
                            setRelation("REPLY");
                        }}
                    >
                        Reply
                    </button>

                    <hr />
                </div>
            );
        })
    )}

    {replyTo && (
        <div>
            <p>
                Replying to{" "}
                <strong>{replyTo.user.username}</strong>
            </p>

            <blockquote>
                {replyTo.content}
            </blockquote>

            <label>
                Relation:{" "}
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

            <button
                type="button"
                onClick={() => {
                    setReplyTo(null);
                    setRelation("REPLY");
                }}
                disabled={sending}
            >
                Cancel Reply
            </button>
        </div>
    )}

    <form
        onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
        }}
    >
        <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
                replyTo
                    ? "Write your response..."
                    : "Write your argument..."
            }
            disabled={sending}
        />

        <button
            type="submit"
            disabled={sending || !content.trim()}
        >
            {sending ? "Sending..." : "Send"}
        </button>
    </form>

    {sendError && <p>{sendError}</p>}
</section>
    </div>
);


}


export default Weave;