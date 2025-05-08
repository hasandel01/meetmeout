import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import styles from './Form.module.css';
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { toast } from "react-toastify";

const ResetPassword = () => {

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();


    const handleResetPassword = async () => {

        if(confirmPassword !== newPassword) {
            toast.error("Passwords do not match!")
            return;
        }
        
        try {

            await axios.post(`https://meetmeout.onrender.com/auth/reset-password`, 
                {
                    resetPasswordToken: token,
                    password: newPassword
                }
            )

            toast.success("Password updated!")

            navigate("/login")

        } catch(error) {
            toast.error("Error resetting your password.")
        }
    } 


    return (
        <div className={styles.formContainer}>
                <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>            
                <div className={styles.inputGroup}>
                <h3>ResetPassword</h3>
                <div className={styles.inputElement}>
                    <FontAwesomeIcon icon={faLock}></FontAwesomeIcon>
                    <input
                        type="password"
                        placeholder="Enter your new password..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}>
                        </input>
                </div>
                <div className={styles.inputElement}>
                    <FontAwesomeIcon icon={faLock}></FontAwesomeIcon>
                        <input
                            type="password"
                            placeholder="Confirm password..."
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}>
                        </input>
                </div>
            </div>
                <button type="submit">
                    Reset Password
                </button>
            </form>
            

        </div>
    );

}

export default ResetPassword;

