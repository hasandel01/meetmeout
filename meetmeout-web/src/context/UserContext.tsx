import { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types/User";
import axiosInstance from "../axios/axios";
import {toast} from 'react-toastify';

export interface UserContextType {
    currentUser?: User;
    getMe: () => void;
}

const UserContext = createContext<UserContextType|undefined>(undefined);

export const UserContextProvider = ({children}: {children: React.ReactNode}) => {

    const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

    const getMe = async () => {
        
        try {
            const response = await axiosInstance.get("/me");
            setCurrentUser(response.data);
        } catch(error) {
            toast.error("Error fetching user data.");
        }
    }

    useEffect(() => {
        if(currentUser === undefined)
            getMe();
    },[currentUser])

    return (
        <UserContext.Provider value={{currentUser, getMe}}>
            {children}
        </UserContext.Provider>
    )
}


export const useUserContext = () => {
    const context = useContext(UserContext);

    if(!context) {
    throw new Error("useUserContext must be used inside UserProvider");
    }
    return context;
}