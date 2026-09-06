import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

    const [ weaves, setWeaves ] = useState<Weave[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState("");
    
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

const myWeaves = weaves.filter(
    (weave) => weave.user.id === user?.id
);

const liveWeaves = weaves.filter(
    (weave) => weave.user.id !==user?.id
);

return (
        <div>

            <h1>Dashboard</h1>

            <h2>Welcome, {user?.username}</h2>

            <button onClick={logout}>
                Logout
            </button>

            {loading && <p>Loading weaves...</p>}

            {error && <p>{error}</p>}

            {!loading && !error && (
                <>
                    <section>
                        <h2>My Weaves</h2>

                        {myWeaves.length === 0 ? (
                            <p>You haven't created any weaves yet.</p>
                        ) : (
                            myWeaves.map((weave) => (
                                <div key={weave.id}>
                                    <h3>{weave.title}</h3>

                                    <button
                                        onClick={() =>
                                            navigate(`/weaves/${weave.id}`)
                                        }
                                    >
                                        Open Weave
                                    </button>
                                </div>
                            ))
                        )}
                    </section>

                    <section>
                        <h2>Live Weaves</h2>

                        {liveWeaves.length === 0 ? (
                            <p>No live weaves available.</p>
                        ) : (
                            liveWeaves.map((weave) => (
                                <div key={weave.id}>
                                    <h3>{weave.title}</h3>

                                    <p>
                                        Created by {weave.user.username}
                                    </p>

                                    <button
                                        onClick={() =>
                                            navigate(`/weaves/${weave.id}`)
                                        }
                                    >
                                        Join Discussion
                                    </button>
                                </div>
                            ))
                        )}
                    </section>
                </>
            )}

        </div>
    );

}


export default Dashboard;