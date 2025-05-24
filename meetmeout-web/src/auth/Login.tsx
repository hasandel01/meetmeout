import React, { useState } from 'react';
import authAxios from './axios/AuthAxiosConfig';
import { useNavigate } from 'react-router-dom';
import styles from './common/Form.module.css';
import { Link } from 'react-router-dom';
import {faUser, faLock} from '@fortawesome/free-solid-svg-icons'
import FormInput from './common/FormInput';

const Login = ()  => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {

        try {

            e.preventDefault();

            const response = await authAxios.post('/auth/authenticate', {
                username: username,
                password: password,
            });

            const { accessToken, refreshToken } = response.data;

            console.log(response.data);
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            navigate('/');

        } catch (err) {
            console.error(err);
            setError('Invalid username or password');
        }
    }

    return (
        <div className={styles.formContainer}>
            <img alt='mmo-logo' src='/mmo_logo.PNG' className={styles.mmoLogo}></img>
            <h2> Welcome Back Traveler! </h2>
            <p> Join Events, find companions! </p>
            <form onSubmit={handleLogin}>
                        <FormInput
                            icon={faUser}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            label="Username"
                            required
                            />
                        <FormInput
                            icon={faLock}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="Password"
                            required
                            />
                    {error && <label className={styles.errorMessage}>{error}</label>}      
                <Link to="/forgot-password" className={styles.link}>Forgot password?</Link>
                <button> Sign In </button>
                <Link to="/register" className={styles.link}> Don't have an account? Sign up!</Link>
            </form>
        </div>
    );
}


export default Login;