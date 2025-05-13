import { useState } from 'react';
import axiosInstance from '../axios/axios';
import styles from'./Form.module.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface UserDetailsFormProps {
    email: string;
}

const UserDetailsForm: React.FC<UserDetailsFormProps> = ({email}) => {
    
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {

            if (password !== confirmPassword) {
                setError('Passwords do not match!');
                return;
            }        
    
            const response = await axiosInstance.post('/auth/register', {
                email: email,
                username: username,
                firstName: firstName,
                lastName: lastName,
                password: password,
            });
    
            if (response.status === 200) {
                toast.success('User registered successfully!');
                localStorage.setItem('token', response.data.token);
                navigate('/login');

            } else {
                toast.error('Error registering user!');
            }

        } catch (error) {
            toast.error('Error registering user!');
        }
  
    }

    return (
    <div className={styles.formContainer}>
                    <h1> Please provide information </h1>
                    <p> Please fill in the following details to create your account. </p>
                    <form className="register-form" onSubmit={handleRegister}>
                        <div className={styles.inputGroup}>
                                <label htmlFor="username">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    className={styles.compactInput}
                                    value={username}
                                    required
                                    onChange={(e) => setUsername(e.target.value)}
                                />

                                <label htmlFor="firstName">First Name</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className={styles.compactInput}
                                    value={firstName}
                                    required
                                    onChange={(e) => setFirstName(e.target.value)}
                                />

                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className={styles.compactInput}
                                    value={lastName}
                                    required
                                    onChange={(e) => setLastName(e.target.value)}
                                />

                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    className={styles.compactInput}
                                    value={password}
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className={styles.compactInput}
                                    value={confirmPassword}
                                    required
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />

                                {error && <p className={styles.compactError}>{error}</p>}
                                </div>
                        <p> By signing up, you agree to our Terms of Service and Privacy Policy. </p>
                        <button type="submit" className="register-button" > Sign Up </button>
                    </form> 

    </div>
    );

}

export default UserDetailsForm;