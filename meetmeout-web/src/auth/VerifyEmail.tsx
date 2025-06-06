import { useEffect, useState} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./common/Form.module.css"
import authAxios from "./axios/authAxios";


const VerifyEmail = () => {

    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('Loading...');
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if(token) {
            const verifyEmail = async () => {
                try {
                    const response = await authAxios.post(`/auth/verify-email?token=${token}`);
                    if (response.status === 200) {
                        setMessage("Your e-mail is verified. Redirecting to the login page...")
                        setTimeout(() => navigate("/login"), 3000)
                    } else {
                        setMessage("Error verifying e-mail")
                    }
                } catch (error) {
                    console.error('Error verifying email:', error);
                }
            };
            verifyEmail();
        }
    }

    , [searchParams]);


    return (
        <div className={styles.verifyContainer}>
            {message}
        </div>
    );

}

export default VerifyEmail;

