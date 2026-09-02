
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import React from "react";

interface CheckCredentialsProps{
    children: React.ReactNode;
}

export const CheckCredentials = ({children}: CheckCredentialsProps)=>{

    
    const { loading, user } = useAuth();

    if(loading){
        return <div> Checking Default Credentials</div>
    }

    if(user){
        return <Navigate to="/dashboard" replace/>;
    }

    return <>{children}</>;
}

