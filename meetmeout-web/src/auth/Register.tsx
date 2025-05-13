import { useState } from 'react';
import axiosInstance from '../axios/axios';
import { Link } from 'react-router-dom';
import UserDetailsForm from './UserDetailsForm';
import styles from './Form.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';


const Register = () => {

    const [email, setEmail] = useState('');
    const [userExists, setUserExists] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);

    const checkUser = async (e: React.FormEvent) => {
        
        try {
            e.preventDefault();
            setFormSubmitted(true);
    
            const response = await axiosInstance.post('/auth/check-user', {email}
            );
    
            if (response.data === true) {
                setUserExists(true);
            }
            else if (response.data === false) {
                setUserExists(false);
                setShowUserDetailsForm(true);
            }

        } catch (error: any) {

            if(error.response && error.response.status === 404) {
                setUserExists(false);
            } else {
                console.error('Error checking user:', error);
                alert("Error checking user. Please try again later.");
            }
        }
    }

    return (
        <div className={styles.formContainer}>
            {!showUserDetailsForm &&
            <>
            <img alt='mmoLogo' src='/mmo_logo.PNG' className={styles.mmoLogo}></img>
                {(!formSubmitted || userExists) && (
                    <>
                        <h1> Sign Up! </h1>
                        <form onSubmit={checkUser}>
                            <div className={styles.inputGroup}>
                                <label>E-mail</label>
                                <div className={styles.inputElement}>
                                    <FontAwesomeIcon icon={faEnvelope}></FontAwesomeIcon>
                                    <input
                                        type="email"
                                        placeholder="E-mail"
                                        value={email} required
                                        onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                {userExists &&
                                    <label className={styles.errorMessage}> User already exists! </label> }  
                            </div>
 
                            <button type='submit'> Continue </button>
                        </form>
                        <p> By signing up, you agree to our Terms of Service and Privacy Policy. </p>
                        <Link to="/login" className={styles.link}> Already have an account? Log in!</Link>
                    </>
                )}
                </>}
                {showUserDetailsForm && <UserDetailsForm email={email} />}
            </div>
    );
}

export default Register;


