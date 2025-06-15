import React, { useState } from 'react';
import styles from "./common/Form.module.css"
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import authAxios from './axios/authAxios';
import FormInput from './common/FormInput';

const ForgotPassword: React.FC = () => {
    
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authAxios.post(`/auth/password-reset-link`, null, {
                params: {
                    email: email
                }
            })
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit}>
            <h2>Send reset link to e-mail</h2>
                    <p className={styles.helperText}>  You will receive a reset link via email if your address is registered. </p>
                       <FormInput
                            icon={faEnvelope}
                            label="E-mail"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            />
                <button type="submit">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPassword;