import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useUserContext } from "./UserContext";


interface DarkModeType {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}


const DarkModeContext = createContext<DarkModeType | undefined>(undefined);



export const DarkModeContextProvider = ({children}: {children: ReactNode}) => {

    const {currentUser} = useUserContext();
    const [darkMode, setDarkMode] = useState<boolean>(false);
    
    useEffect(() => {
        if(currentUser?.darkMode !== undefined) {
            setDarkMode(currentUser.darkMode);
    
    }}, [currentUser]);


    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
}, [darkMode]);


    return (
        <DarkModeContext.Provider value={{darkMode, setDarkMode}}>
            {children}
        </DarkModeContext.Provider>
    )

}



export const useDarkModeContext = () => {
    
    const context = useContext(DarkModeContext);

    if(!context)
        console.error("Dark Mode context should be in application tsx")

    return context;
}



