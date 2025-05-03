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
    <div className='register-container'>
                    <h1> Please provide information </h1>
                    <p> Please fill in the following details to create your account. </p>
                    <form className="register-form" onSubmit={handleRegister}>
                        <input type="text" value={username} placeholder="Username" required onChange={(e) => setUsername(e.target.value)} />
                        <input type="text" value={firstName} placeholder="First Name" required onChange={(e) => setFirstName(e.target.value)} />
                        <input type="text" value={lastName} placeholder="Last Name" required onChange={(e) => setLastName(e.target.value)} />
                        <input type="password" value={password} placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                        <input type="password" value={confirmPassword} placeholder="Confirm Password" required onChange={(e) => setConfirmPassword(e.target.value)} />
                        {error && <label className={styles.errorMessage}> {error} </label>}
                        <p> By signing up, you agree to our Terms of Service and Privacy Policy. </p>
                        <button type="submit" className="register-button" > Sign Up </button>
                    </form> 

    </div>
    );

}

export default UserDetailsForm;