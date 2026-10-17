import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

type Weave = {
    id: string;
    title: string;
    createdAt: string;
    user: {
        id: string;
        username: string;
    };
};

type GlobalWeavesResponse = {
    weaves: Weave[];
    nextCursor: string | null;
    hasMore: boolean;
};

const PAGE_SIZE = 50;

const Global = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    const [error, setError] = useState<string>("");
    const [weaves, setWeaves] = useState<Weave[]>([]);
    const [popup, setPopup] = useState<string>("");

    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const observer = useRef<IntersectionObserver | null>(null);


    // Fetch Weaves
    const fetchWeaves = useCallback(
        async (cursor: string | null = null) => {

            try {

                if (cursor === null) {
                    setLoading(true);
                } else {
                    setLoadingMore(true);
                }

                const params = new URLSearchParams();

                params.set("limit", String(PAGE_SIZE));

                if (cursor) {
                    params.set("cursor", cursor);
                }

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/global?${params.toString()}`
                );

                const data: GlobalWeavesResponse =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        (data as any).error ||
                        "Failed to fetch weaves"
                    );
                }

                // First request
                if (cursor === null) {

                    setWeaves(data.weaves);

                }
                // Subsequent requests
                else {

                    setWeaves((previousWeaves) => [
                        ...previousWeaves,
                        ...data.weaves,
                    ]);

                }

                setNextCursor(data.nextCursor);
                setHasMore(data.hasMore);

            } catch (e) {

                console.error("Error fetching Weaves: ",e);

                setError(
                    e instanceof Error
                        ? e.message
                        : "Failed to fetch Weaves :("
                );

            } finally {

                setLoading(false);
                setLoadingMore(false);
            }
        },
        []
    );


    // Initial fetch
    useEffect(() => {
        fetchWeaves();
    }, [fetchWeaves]);


    // Infinite scroll observer
    const lastWeaveRef = useCallback(
        (node: HTMLDivElement | null) => {

            if (loadingMore) {
                return;
            }

            if (observer.current) {
                observer.current.disconnect();
            }

            observer.current =
                new IntersectionObserver(
                    (entries) => {

                        if (
                            entries[0].isIntersecting &&
                            hasMore &&
                            nextCursor
                        ) {
                            fetchWeaves(nextCursor);
                        }

                    },
                    {
                        rootMargin: "300px",
                    }
                );

            if (node) {
                observer.current.observe(node);
            }
        },
        [
            loadingMore,
            hasMore,
            nextCursor,
            fetchWeaves
        ]
    );


    // Loading screen
    if (loading) {
        return <p>Loading Weaves...</p>;
    }


    // Error
    if (error) {
        return <p>{error}</p>;
    }


    return (
        <>
            <main className="global">

                <nav className="nav-bar">
                    On going
                    <strong>
                        Weaves
                    </strong>
                </nav>


                {/* Popup */}
                {popup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

                        <div className="w-[90%] max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">

                            {popup}

                        </div>

                    </div>
                )}


                {/* No Weaves */}
                {weaves.length === 0 ? (

                    <p className="empty-message">
                        No Ongoing <strong>Weaves</strong>
                    </p>

                ) : (

                    <div className="weave-list">

                        {weaves.map((weave, index) => (

                            <div
                                className="weave-row"
                                key={weave.id}

                                /*
                                 * Attach observer to the last
                                 * currently rendered Weave.
                                 */
                                ref={
                                    index === weaves.length - 1
                                        ? lastWeaveRef
                                        : null
                                }
                            >

                                <span className="weave-index">

                                    {String(
                                        index + 1
                                    ).padStart(2, "0")}

                                </span>


                                <div className="weave-info">

                                    <h3 className="weave-title">
                                        {weave.title}
                                    </h3>

                                    <p className="weave-meta">

                                        <strong>
                                            Started by{" "}
                                            {weave.user.username}
                                        </strong>

                                    </p>

                                </div>


                                <div className="weave-action">

                                    <button
                                        className="oopen-btn"

                                        onClick={() =>
                                            navigate(
                                                `/weaves/${weave.id}`
                                            )
                                        }
                                    >
                                        <strong>
                                            Open
                                        </strong>
                                    </button>

                                </div>

                            </div>

                        ))}


                        {/* Loading next batch */}

                        {loadingMore && (

                            <div className="py-6 text-center">
                                Loading more Weaves...
                            </div>

                        )}


                        {/* End of list */}

                        {!hasMore && (

                            <div className="py-6 text-center">
                                No more Weaves
                            </div>

                        )}

                    </div>

                )}

            </main>
        </>
    );
};

export default Global;