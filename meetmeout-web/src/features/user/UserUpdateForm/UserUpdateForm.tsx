import React, { useEffect, useState } from "react";
import styles from "./UserUpdateForm.module.css"
import { User } from "../../../types/User";
import axiosInstance from "../../../axios/axios";
import 'react-toastify/dist/ReactToastify.css';
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import isEmail from "validator/lib/isEmail";

interface UserUpdateFormProps {
    currentUser: User;
    onClose: () => void;
}

const UserUpdateForm: React.FC<UserUpdateFormProps> = ({currentUser, onClose}) => {

    const [user, setUser] = useState<User>(currentUser);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof User, string>>>({});

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

    const validateUserProfile = (user: User): Partial<Record<keyof User, string>> => {
        const errors: Partial<Record<keyof User, string>> = {};

        if (user.firstName.trim().length < 2 || user.firstName.length > 30) {
            errors.firstName = "First name must be between 2 and 50 characters.";
        }

        if (user.lastName.trim().length < 2 || user.lastName.length > 30) {
            errors.lastName = "Last name must be between 2 and 50 characters.";
        }

        if (!isEmail(user.email) || user.email.length > 100) {
            errors.email = "Please enter a valid email address.";
        }

        if (user.phone && (user.phone.length < 10 || user.phone.length > 15)) {
            errors.phone = "Phone number must be between 10 and 15 digits.";
        }

        if (user.about && user.about.length > 400) {
            errors.about = "About section can be up to 400 characters.";
        }

        return errors;
    };



       const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const errors = validateUserProfile(user);
            setFormErrors(errors);

            if (Object.keys(errors).length > 0) return;

            try {
                await axiosInstance.post(`/me/update`, user);
                onClose();
            } catch (error) {
                setFormErrors(prev => ({ ...prev, email: "This e-mail is already in use." }));
            }
        };




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
            <h4>Update your profile! 💾</h4>
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
                    minLength={2}
                    maxLength={30}
                    onChange={(e) => setUser({...user, firstName: e.target.value})}
                />
                {formErrors.firstName && <p className={styles.error}>{formErrors.firstName}</p>}
                <label>Last Name</label> 
                <hr/>
                <input 
                    type="text"
                    value={user.lastName}
                    minLength={2}
                    maxLength={30}
                    onChange={(e) => setUser({...user, lastName: e.target.value})}
                />
                {formErrors.lastName && <p className={styles.error}>{formErrors.lastName}</p>}
                <label>About</label>
                <hr/>
                <textarea
                    placeholder="Express yourself..."
                    maxLength={400}
                    value={user.about}
                    onChange={(e) => setUser({...user, about: e.target.value})}
                />
                {formErrors.about && <p className={styles.error}>{formErrors.about}</p>}
                <label>E-mail</label>
                <hr/>
                <input 
                    type="email"
                    value={user.email}
                    maxLength={100}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                />
                {formErrors.email && <p className={styles.error}>{formErrors.email}</p>}
                <label>Phone Number</label>
                <hr/>
                <PhoneInput
                    country={'tr'}
                    value={user.phone}
                    onChange={phone => setUser({ ...user, phone })}
                />
                {formErrors.phone && <p className={styles.error}>{formErrors.phone}</p>}
                <div className={styles.buttonContainer}>
                <button type="submit">Save</button>
                </div>            
            </form>
        </div>
    </div>
    )
} 



export default UserUpdateForm;