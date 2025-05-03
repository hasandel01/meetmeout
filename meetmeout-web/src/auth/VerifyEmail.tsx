import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../axios/axios";


const VerifyEmail = () => {

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        if(token) {
            const verifyEmail = async () => {
                try {
                    const response = await axiosInstance.post(`/auth/verify-email?token=${token}`);
                    if (response.status === 200) {
                        console.log('Email verified successfully!');
                    } else {
                        console.error('Error verifying email:', response.data);
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
        <div>
        <h1>Verify Email</h1>
        <p>Please check your email for a verification link.</p>
        </div>
    );

}

export default VerifyEmail;

