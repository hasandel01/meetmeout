import styles from "./Settings.module.css"
import { useUserContext } from "../../../context/UserContext";
import axiosInstance from "../../../axios/axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
    
    const { currentUser, getMe } = useUserContext();
    const [showLocation, setShowLocation] = useState<boolean>(false);
    const navigate = useNavigate();

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


    const handleDeleteAccount = async () => {

        try {
            const response = await axiosInstance.delete(`/me`);

            if(response.data) {
                localStorage.removeItem("accessToken");
                navigate("/login");
            }

        }catch(error) {
            console.log(error)
        }
    } 

    return (
        <div className={styles.settingsContainer}>
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
                <h4>Account</h4>
                <hr/>
                <div>
                  <button className={styles.deleteAccount} onClick={() => handleDeleteAccount()}>
                        Delete Account
                  </button>
                </div>
            </div>
        </div>
    );
};


export default Settings;