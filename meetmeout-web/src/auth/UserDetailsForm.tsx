import { SetStateAction,useEffect, useState } from 'react';
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
    const [isUsernameValid, setIsUsernameValid] = useState(true);
    const navigate = useNavigate();


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        try {

            if (password !== confirmPassword) {
                setError('Passwords do not match!');
                return;
            }

            if(!isUsernameValid) {
                setError('Username is already taken!');
                return;
            }
    
            const response = await authAxios.post('/auth/register', {
                email: email,
                username: username,
                firstName: firstName,
                lastName: lastName,
                password: password,
            });
    
            if (response.status === 201) {
                navigate('/login');
            } else {
                toast.error('Error registering user!');
            }

        } catch (error) {
            toast.error('Error registering user!');
        }
  
    }


    const validateUsername = (username: string) => {
    
        try {
            const response = authAxios.get(`/auth/validate`, {
                params:
                { username: username } 
            });
            return response;
        } catch (error) {
            console.error('Error validating username:', error);
            throw error;
        }
    }

    useEffect(() => {   
        const validate = async () => {
            if (username.length >= 3) {
                try {
                    const response = await validateUsername(username);
                    if (response.data) {
                        setIsUsernameValid(false);
                    } 
                    else {
                        setIsUsernameValid(true);
                    }
                } catch (error) {
                    setError('Error validating username!');
                }
            } else {
                setError('');
            }
        };

        validate();
    }, [username]);

    return (
    <div className={styles.formContainer}>
                    <h2> Please provide information </h2>
                    <p> Please fill in the following details to create your account. </p>
                    <form onSubmit={handleRegister}>
                                <FormInput
                                    icon={faUser}
                                    type="text"
                                    value={username}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setUsername(e.target.value)}
                                    label="Username (You can't change your username later!)"
                                    required
                                    minLength={3}
                                    maxLength={30}
                                    />
                                    {!isUsernameValid && <p className={styles.errorMessage}>Username is taken.</p>}
                                <FormInput
                                    icon={faIdBadge}
                                    type="text"
                                    value={firstName}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setFirstName(e.target.value)}
                                    label="First Name"
                                    required
                                    minLength={2}
                                    maxLength={30}
                                    />
                                <FormInput
                                    icon={faIdCard}
                                    type="text"
                                    value={lastName}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setLastName(e.target.value)}
                                    label="Last Name"
                                    required
                                    minLength={2}
                                    maxLength={30}
                                    />
                                <FormInput
                                    icon={faLock}
                                    type="password"
                                    value={password}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setPassword(e.target.value)}
                                    label="Password"
                                    required
                                    minLength={8}
                                    maxLength={100}
                                    />
                                <FormInput
                                    icon={faShieldAlt}
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setConfirmPassword(e.target.value)}
                                    label="Confirm Password"
                                    required
                                    minLength={8}
                                    maxLength={100}
                                    />
                                {error && <p className={styles.errorMessage}>{error}</p>}
                        <p> By signing up, you agree to our Terms of Service and Privacy Policy. </p>
                        <button type="submit" className="register-button" > Sign Up </button>
                    </form> 

    </div>
    );

}

export default UserDetailsForm;