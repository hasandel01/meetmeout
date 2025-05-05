import React, { useEffect, useState } from "react";
import styles from "./UserUpdateForm.module.css"
import { User } from "../../../types/User";
import axiosInstance from "../../../axios/axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        } catch(error ) {
                toast.error("Error updating user! E-mail is already registered");
        }
    }

    

    return (
        <div className={styles.formContainer}>
            <form onSubmit={handleProfileUpdate}>
                <label>Username</label>
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
                <input 
                    type="text"
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
                <input 
                    type="text"
                    value={user.phone}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                />
                <button type="submit"> Save </button>
            </form>
        </div>
    )
} 



export default UserUpdateForm;