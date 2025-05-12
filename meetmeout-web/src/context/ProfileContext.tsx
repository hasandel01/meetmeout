import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

interface ProfileContextType {
    goToUserProfile: (username: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);


export const ProfileContextProvider = ({children}: {children: React.ReactNode}) => {

    const navigate = useNavigate();

  const goToUserProfile = (username: string) => {
    try {
        navigate(`/user-profile/${username}`);
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
    }

  };

    return (
        <ProfileContext.Provider value={{goToUserProfile}}>
            {children}
        </ProfileContext.Provider>
    )
}


export const useProfileContext = () =>  {
    const context = useContext(ProfileContext);

        if(!context) {
        throw new Error("useProfileContext must be used inside Event");
        }
    return context;
}