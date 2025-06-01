import React, { useEffect, useState } from "react";
import styles from "./UserUpdateForm.module.css"
import { User } from "../../../types/User";
import axiosInstance from "../../../axios/axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

interface UserUpdateFormProps {
    currentUser: User;
    onClose: () => void;
}

const UserUpdateForm: React.FC<UserUpdateFormProps> = ({currentUser, onClose}) => {

    const [user, setUser] = useState<User>(currentUser);

    useEffect(() => {

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        }
        document.addEventListener("keydown",handleEsc);

        return () => {
            document.removeEventListener("keydown",handleEsc);
        }

    },[onClose])


    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axiosInstance.post(`/me/update`, user)
            console.log(response.data)
            onClose();
        } catch(error ) {
                toast.error("Error updating user! E-mail is already registered");
        }
    }


    useEffect(() => {
    
        const handleCloseClick = (event: MouseEvent) => {

            const form = document.querySelector(`.${styles.formContainer}`)

            if(form && !form.contains(event.target as Node)) {
                onClose();
            }
        }

            document.addEventListener("mousedown",handleCloseClick);

        return () => {
            document.removeEventListener("mousedown", handleCloseClick);
        }
    
    },[onClose])
    

    return (
    <div className={styles.modalOverlay}>
        <div className={styles.formContainer}>
            <h5>Update your profile! 💾</h5>
            <form onSubmit={handleProfileUpdate}>
                <label>Username</label>
                <hr/>
                <input
                    type="text"
                    value={user.username}
                    disabled
                    onChange={(e) => setUser({...user, username: e.target.value})}
                />
                <label>First Name</label>
                <hr/>
                <input 
                    type="text"
                    value={user.firstName}
                    onChange={(e) => setUser({...user, firstName: e.target.value})}
                />
                <label>Last Name</label> 
                <hr/>
                <input 
                    type="text"
                    value={user.lastName}
                    onChange={(e) => setUser({...user, lastName: e.target.value})}
                />
                <label>About</label>
                <hr/>
                <textarea
                    placeholder="Express yourself..."
                    maxLength={400}
                    value={user.about}
                    onChange={(e) => setUser({...user, about: e.target.value})}
                />
                <label>E-mail</label>
                <hr/>
                <input 
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                />
                <label>Phone Number</label>
                <hr/>
                <PhoneInput
                    country={'tr'}
                    value={user.phone}
                    onChange={phone => setUser({ ...user, phone })}
                />
            <button type="submit"> Save </button>
            </form>
        </div>
    </div>
    )
} 



export default UserUpdateForm;