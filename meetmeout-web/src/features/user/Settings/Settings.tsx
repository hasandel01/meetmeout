import styles from "./Settings.module.css"
import { useUserContext } from "../../../context/UserContext";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState } from "react";

const Settings = () => {
    
    const { currentUser, getMe } = useUserContext();
    const [showLocation, setShowLocation] = useState<boolean>(false);

    useEffect(() => {
        if (currentUser?.showLocation !== undefined) {
            setShowLocation(currentUser.showLocation);
        }
    }, [currentUser]);


    const updateDarkMode = async (value: boolean) => {
                    
            const response = axiosInstance.put("/me/dark-mode", { darkMode: value })
            response.then(() => {
                getMe();
            }
            ).catch((error) => {
                console.error("Error updating dark mode:", error);
            }
            );
    
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
        updateDarkMode(value);
    };

    return (
        <div className={styles.settingsContainer}>
            <h1>Settings</h1>
            <div className={styles.settings}>
                <h4>Preferences</h4>
                <hr/>
                <div className={styles.preferences}>
                        {currentUser && (
                            <label className={styles.darkModeToggle}>
                            <input
                                type="checkbox"
                                checked={currentUser.darkMode}
                                onChange={(e) => handleDarkModeChange(e.target.checked)}
                            />
                                    <span className={styles.slider}></span>
                                    <span>Dark Mode</span>
                            </label>
                            )}
                </div>
                <h4>Privacy</h4>
                <hr/>
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
        </div>
    );
};


export default Settings;