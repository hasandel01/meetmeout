import { useNavigate, useSearchParams } from "react-router-dom";
import styles from './common/Form.module.css';
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import authAxios from "./axios/AuthAxiosConfig";
import FormInput from "./common/FormInput";

const ResetPassword = () => {

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleResetPassword = async () => {

        if(confirmPassword !== newPassword) {
            return;
        }
        
        try {
            await authAxios.post(`/auth/reset-password`, 
                {
                    resetPasswordToken: token,
                    password: newPassword
                }
            )

            navigate("/login")

        } catch(error) {
            setError('Passwords do not match');
            console.error(error);
        }
    } 


    return (
        <div className={styles.formContainer}>
                <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>            
                <h3>ResetPassword</h3>
                    <FormInput 
                        icon={faLock}
                        type="password"
                        placeholder="New password..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}/>
                    <FormInput
                        icon={faLock}
                        type="password"
                        placeholder="Confirm password..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}/>
                    {error && <p className={styles.error}>{error}</p>}
                <button type="submit">
                    Reset Password
                </button>
            </form>
            

        </div>
    );

}

export default ResetPassword;

