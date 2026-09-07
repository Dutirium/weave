import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

interface User {
    id: string;
    username: string;
    email: string;
    createdAt?: string;
    sessionId?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const response = await fetch(
                `/api/auth/me`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                setUser(null);
                return;
            }

            const data = await response.json();

            setUser(data.user);

        } catch (error) {
            console.error("Failed to check authentication:", error);
            setUser(null);
        }
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            await refreshUser();
            setLoading(false);
        };

        checkAuthentication();
    }, []);

    const logout = async () => {
        try {
            await fetch(
                `/api/auth/logout`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                refreshUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }

    return context;
};
