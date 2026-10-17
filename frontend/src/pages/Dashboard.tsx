import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
// import SpiderWebBackground from '../components/SpiderWebBackground.js';
// import { ArrowRight } from 'lucide-react';
// import { LuTrash2 } from 'react-icons/lu';

type Weave = {
  id: string,
  title: string,
  createdAt: string,
  user: {
    id: string,
    username: string,
  }
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  //console.log("User Credibility in Dashboard.ts", user?.credibility);

  const [liveWeaves, setLiveWeaves] = useState<Weave[]>([]);
  const [myWeaves, setMyWeaves] = useState<Weave[]>([]);
  const [weaves, setWeaves] = useState<Weave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(false);
  const [weaveTitle, setWeaveTitle] = useState("");
  const [weaveStatus, setWeaveStatus] = useState(false);
  const [popup, setPopup] = useState("");

  useEffect(() => {
    const fetchWeaves = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/weaves`,
          //const response = await fetch(`/api/weaves`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch weaves");
        }

        setWeaves(data.weaves);


      } catch (e) {
        console.error("Error fetching Weaves: ", e);

        setError(
          e instanceof Error
            ? e.message
            : "Failed to fetch weaves"
        );

      } finally {
        setLoading(false);
      }
    };
    fetchWeaves();
  }, []);

  //to create a new Weave
  const createWeave = async () => {
    setWeaveStatus(true);
    try {
      if (!user) {
        throw new Error("User not found");
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/weaves`,
        //const response = await fetch(`/api/weaves`,
        {
          headers: {
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

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Could not create a weave");
      }

      setWeaves((previousWeaves) => [
        ...previousWeaves,
        data.weave,
      ])

    } catch (e) {
      setError(e instanceof Error
        ? e.message
        : "Failed to create weave"
      );
    }
    finally {
      setWeaveStatus(false);
      setTitle(false);
      setWeaveTitle("");
    }

  }

  //delete user weaves 
  const deleteWeave = async (id: string) => {
    try {
      if (!id) {
        throw new Error("Weave Id not found");
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/weaves/${id}`,
        //const response = await fetch(`/api/weaves/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      //const data = await response.json();

      if (!response.ok) {
        throw new Error("Server Side Error");
      }

      setMyWeaves(myWeaves.filter((weave) => weave.id !== id));


    } catch (e) {
      console.error("Couldn't delete the weave: ", e);
    }
  }

  useEffect(() => {

    setMyWeaves(weaves.filter(
      (weave: Weave) => weave.user.id === user?.id
    ))


    setLiveWeaves(weaves.filter(
      (weave: Weave) => weave.user.id !== user?.id
    ));

  }, [weaves, user]);


  // Share weave 
  const handleShare = async (weave: Weave) => {

    if (!weave) return;

    const shareUrl = `${window.location.origin}/weaves/${weave.id}`;

    try {
     
      await navigator.clipboard.writeText(shareUrl);
      setPopup("Weave link copied");

      setTimeout(()=>{
        setPopup("");
      },2000);
    } catch (e) {
      console.error("Error sharing weave: ", e); 
    }
  }



  return (
    <main className="dashboard">
      <nav className="dashboard-nav">
        <div className="brand">
          <strong className="brand-mark">W</strong>
          <div className="brand-info">
            <p className="brand-name">Weave</p>
            <p className="brand-tagline">Discussion network</p>

          </div>
        </div>

        
        {/* pop up for in-between text  */}
        {popup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-[90%] max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
              {popup}
            </div>
          </div>
        )}

        <div className="nav-user">
          <div className="user-details">
            <p className="username">{user?.username}</p>
            <p className="user-role">Member</p>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>
      

      <header className="dashboard-header">
        <p className="eyebrow">Your ideas</p>

        <h1 className="dashboard-title">
          Conversations
          <span>worth continuing.</span>
        </h1>

        <p className="dashboard-description">
          Continue an argument, explore someone else's idea,
          or put something new on the table.
        </p>
      </header>

      {loading && (
        <p className="status-message loading-message">
          Loading discussions...
        </p>
      )}

      {error && (
        <p className="status-message error-message">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="dashboard-content">
          <section className="dashboard-overview">
            <div className="create-card">
              <p className="eyebrow">New conversation</p>

              <h2 className="section-title">
                What do you
                <span> want to argue about?</span>
              </h2>

              <p className="card-description">
                Start a discussion and let other people
                support, question, challenge or counter
                your idea.
              </p>

              {title && !weaveStatus && (
                <div className="create-weave-form">
                  <div className="form-header">
                    <h2>Start a new weave</h2>

                    <button
                      className="close-btn"
                      onClick={() => {
                        setTitle(false);
                        setWeaveTitle("");
                      }}
                      aria-label="Close create weave form"
                    >
                      ×
                    </button>
                  </div>

                  <input
                    className="weave-input"
                    type="text"
                    value={weaveTitle}
                    onChange={(e) => setWeaveTitle(e.target.value)}
                    placeholder="What do you want to argue about?"
                    autoFocus
                  />

                  <button
                    className="primary-btn"
                    onClick={createWeave}
                    disabled={!weaveTitle.trim()}
                  >
                    Create Weave
                  </button>
                </div>
              )}

              <button
                className="create-btn"
                onClick={() => {
                  title ? setTitle(false) : setTitle(true);
                }}
                disabled={title}
              >
                Create a Weave
              </button>
            </div>

            <div className="stat-card">
              <p className="stat-label">Created</p>
              <p className="stat-value">{myWeaves.length}</p>
              <p className="stat-description">your discussions</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Active</p>
              <p className="stat-value">{liveWeaves.length}</p>
              <p className="stat-description">open discussions</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Creadibility Score</p>
              <p className="stat-value">{user?.credibility}</p>
              <p className="stat-description">Your score increases with you influence</p>
            </div>
          </section>

          <section className="weaves-section my-weaves-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Your space</p>
                <h2 className="section-title">My Weaves</h2>
              </div>

              <span className="section-count">{myWeaves.length}</span>
            </div>

            {myWeaves.length === 0 ? (
              <p className="empty-message">
                You haven't started a discussion yet.
              </p>
            ) : (
              <div className="weaves-list">
                {myWeaves.map((weave, index) => (
                  <div className="weave-row" key={weave.id}>
                    <span className="weave-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="weave-info">
                      <h3 className="weave-title">{weave.title}</h3>
                      <p className="weave-meta">Started by you</p>
                    </div>

                    <div className="weave-actions">
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white transition"
                        onClick={() => handleShare(weave)}
                        title="Share Weave"
                      >
                        <Share2 size={18} />
                        Share
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteWeave(weave.id)}
                        title="Delete Weave"
                      >
                        Delete
                      </button>

                      <button
                        className="open-btn"
                        onClick={() => navigate(`/weaves/${weave.id}`)}
                        title="Open Weave"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <footer className="dashboard-footer">
        <span>WEAVE / DISCUSSION NETWORK</span>
        <span>Ideas become stronger when challenged.</span>
      </footer>
    </main>
  );




}


export default Dashboard;