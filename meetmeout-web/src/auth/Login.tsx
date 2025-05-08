import React, { useState } from 'react';
import axiosInstance from '../axios/axios';
import { useNavigate } from 'react-router-dom';
import styles from './Form.module.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUser, faLock} from '@fortawesome/free-solid-svg-icons'

const Login = ()  => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {

        try {

            e.preventDefault();

            const response = await axiosInstance.post('/auth/authenticate', {
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
            <h1> Welcome Back Traveler! </h1>
            <p> Join Events, find companions! </p>
            <form onSubmit={handleLogin}>
                <div className={styles.inputGroup}>
                    <label>Username</label>
                    <div className={styles.inputElement}>
                        <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
                        <input type='text' value={username} required onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <label>Password</label>
                    <div className={styles.inputElement}>
                        <FontAwesomeIcon icon={faLock}></FontAwesomeIcon>
                        <input type='password' value={password} required onChange={(e) => setPassword(e.target.value)} />
                    </div> 
                    {error && <label className={styles.errorMessage}>{error}</label>}      
                </div>
                <Link to="/forgot-password" className={styles.link}>Forgot password?</Link>
                <button> Sign In </button>
            </form>
            <Link to="/register" className={styles.link}> Don't have an account? Sign up!</Link>
        </div>
    );
}


export default Login;