import { SetStateAction, useState } from 'react';
import styles from'./common/Form.module.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faUser, faIdBadge, faIdCard, faLock, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import FormInput from './common/FormInput';
import authAxios from './axios/authAxios';

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
    
            const response = await authAxios.post('/auth/register', {
                email: email,
                username: username,
                firstName: firstName,
                lastName: lastName,
                password: password,
            });
    
            if (response.status === 200) {
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
                                <FormInput
                                    icon={faUser}
                                    type="text"
                                    value={username}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    label="Username"
                                    />
                                <FormInput
                                    icon={faIdBadge}
                                    type="text"
                                    value={firstName}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setFirstName(e.target.value)}
                                    placeholder="First Name"
                                    label="First Name"
                                    />
                                <FormInput
                                    icon={faIdCard}
                                    type="text"
                                    value={lastName}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setLastName(e.target.value)}
                                    placeholder="Last Name"
                                    label="Last Name"
                                    />
                                <FormInput
                                    icon={faLock}
                                    type="password"
                                    value={password}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    label="Password"
                                    />
                                <FormInput
                                    icon={faShieldAlt}
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm Password"
                                    label="Confirm Password"
                                    />
                                {error && <p className={styles.compactError}>{error}</p>}
                        <p> By signing up, you agree to our Terms of Service and Privacy Policy. </p>
                        <button type="submit" className="register-button" > Sign Up </button>
                    </form> 

    </div>
    );

}

export default UserDetailsForm;