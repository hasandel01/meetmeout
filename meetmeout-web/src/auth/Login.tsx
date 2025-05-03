import React, { useState } from 'react';
import axiosInstance from '../axios/axios';
import { useNavigate } from 'react-router-dom';
import styles from './Form.module.css';
import { Link } from 'react-router-dom';

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
                <input type='text' placeholder='Username' value={username} required onChange={(e) => setUsername(e.target.value)} />
                <input type='password' placeholder='Password' value={password} required onChange={(e) => setPassword(e.target.value)} />
                {error && <p className='error-message'>{error}</p>}
                <button> Sign In </button>
            </form>
            <Link to="/register" className={styles.link}> Don't have an account? Sign up!</Link>
        </div>
    );
}


export default Login;