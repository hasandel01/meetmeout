import styles from "./Settings.module.css"
import { useUserContext } from "../../../context/UserContext";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState } from "react";

const Settings = () => {
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const { currentUser, getMe } = useUserContext();
    const [showLocation, setShowLocation] = useState<boolean>(false);

    useEffect(() => {
        if (currentUser?.showLocation !== undefined) {
            setShowLocation(currentUser.showLocation);
        }
    }, [currentUser]);

    useEffect(() => {
        if(currentUser?.darkMode !== undefined) {
            setDarkMode(currentUser.darkMode);
        }}, [currentUser]);


    const updateDarkMode = async (value: boolean) => {
                    
            const response = axiosInstance.put("/me/dark-mode", { darkMode: value })
            response.then(() => {
                getMe();
            }
            ).catch((error) => {
                console.error("Error updating dark mode:", error);
            }
            );

                if(value)
                    document.body.classList.add("dark");
                else
                    document.body.classList.remove("dark");
    
        };
    

    const updateLocationPref = async (value: boolean) => {
        try {
            await axiosInstance.put("/me/location-preference", { showLocation: value });
            await getMe();
        } catch (error) {
            console.error("Error updating location preference:", error);
        }
    };

    const handleShowLocationChange = (value: boolean) => {
        setShowLocation(value);
        updateLocationPref(value);
    };

    const handleDarkModeChange = (value: boolean) => {
        setDarkMode(value);
        updateDarkMode(value);
    };

    return (
        <div className={styles.settingsContainer}>
            <h1>Settings</h1>
            <div className={styles.preferences}>
                <label className={styles.darkModeToggle}>
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => handleDarkModeChange(e.target.checked)} />
                    <span className={styles.slider}></span>
                    <span>Dark Mode</span>
                </label>
            </div>
            <div className={styles.privacy}>
                <label className={styles.privacyToggle}>
                    <input
                        type="checkbox"
                        checked={showLocation}
                        onChange={(e) => handleShowLocationChange(e.target.checked)} />
                    <span className={styles.slider}></span>
                    <span>Show Location</span>
                </label>
            </div>
        </div>
    );
};


export default Settings;