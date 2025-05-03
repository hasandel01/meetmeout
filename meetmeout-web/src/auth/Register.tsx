import { useState } from 'react';
import axiosInstance from '../axios/axios';
import { Link } from 'react-router-dom';
import UserDetailsForm from './UserDetailsForm';
import '../styles/Form.css';


const Register = () => {

    const [email, setEmail] = useState('');
    const [userExists, setUserExists] = useState(true);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const message = <p className='error-message'> User already exists! </p>;

    const checkUser = async (e: React.FormEvent) => {
        
        try {
            e.preventDefault();
            setFormSubmitted(true);
    
            const response = await axiosInstance.post('/auth/check-user', {email}
            );
    
            console.log(response.status);
            console.log(response.data);
    
            if (response.status === 200) 
                setUserExists(true);
            else if (response.status === 404)
                setUserExists(false);
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
        <div className="form-container">
                <img alt='mmo-logo' src='/mmo_logo.PNG' className='mmo-logo'></img>
                {(!formSubmitted || userExists) && (
                    <div className='email-container'>
                        <h1> Sign Up! </h1>
                        <form onSubmit={checkUser}>
                            <input
                                type="email"
                                placeholder="E-mail"
                                value={email} required
                                onChange={(e) => setEmail(e.target.value)} />
                            {formSubmitted && userExists && message}
                            <button> Continue </button>
                        </form>
                        <p> By signing up, you agree to our Terms of Service and Privacy Policy. </p>
                        <Link to="/login" className="link"> Already have an account? Log in!</Link>
                    </div>
                )}
                {!userExists && <UserDetailsForm email={email} />}
            </div>
    );
}

export default Register;


