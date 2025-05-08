import React, { useState } from 'react';
import styles from "./Form.module.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import axios from 'axios';
const ForgotPassword: React.FC = () => {
    
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await axios.post(`http://192.168.1.42:8081/auth/send-password-reset-link/${email}`)
            toast.success("Password reset link is sent.")
        } catch (error) {
            toast.success("User is not found in the system, please sign up!")
        }
    };

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit}>
            <h2>Forgot Password</h2>
                <div className={styles.inputGroup}>
                    <label>Email</label>
                    <div className={styles.inputElement}>
                        <FontAwesomeIcon icon={faEnvelope}/>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <button type="submit">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPassword;