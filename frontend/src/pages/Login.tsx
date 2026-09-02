import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

interface LoginFormData {
    uniqueId: string,
    password: string
}

interface ApiResponse {
    message?: string,
    error?: string,
    user?: {
        id: string,
        username: string,
        email: string,
        createdAt?: string
    }
}



export const Login: React.FC = () => {
    const { refreshUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<LoginFormData>({
        uniqueId: '',
        password: '',
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<null | string>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) =>{
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong during login");

            }
            setMessage(data.message ?? null);

            await refreshUser();
            
            navigate("/dashboard", {replace: true});
            
           
        }
        catch (e: unknown) {
            if (e instanceof Error) {
                setErrorMessage(e.message);
            }
            else {
                setErrorMessage("Something went Wrong");
            }
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div>
                <h1> Login Form </h1>


                {errorMessage && (
                    <div> {errorMessage} </div>)}

                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="uniqueId"> Username or email</label>
                        <input type="text"
                            id="uniqueId"
                            name="uniqueId"
                            required
                            value={formData.uniqueId}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="password"> Enter your password </label>
                        <input type="password"
                            required
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {message && ( 
                        <div>{ message }</div> 
                    )}

                    <button
                        type='submit'
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Login"}
                    </button>
                    <br />
                    {/*Link to Register  page */}
                    <Link to="/register" className="register-button">
                        Not a User? Register now
                     </Link>
                </form>
            </div>



        </>

    );
}

