import { useEffect } from "react";
import axiosInstance from "../../axios/axios";
import { User } from "../../types/User";
import { useState } from "react";

const AddCompanion = () => {

    const [users, setUsers] = useState<User[] | null>(null);

    const getAllUsers = async () => {

        try {
            const response = await axiosInstance.get(`/all-users-except-companions`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            console.log("All users fetched successfully:", response.data);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching all users:", error);
        }

    };


    const handleAddCompanion = async (receiverEmail: string) => {
        try {
            const response = await axiosInstance.post(`/add-a-companion/${encodeURIComponent(receiverEmail)}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
            console.log("Friend request is sent:", response.data);
        }
        catch (error) {
            console.error("Error adding companion:", error);
        }
    }


    useEffect(() => {
        getAllUsers();
    }
    , []);
        

    return (
        <div className="add-companion">
            {users?.map((user) => (
                <div key={user.id} className="user-card">
                    <img src={user.profilePictureUrl} alt="User" className="user-picture" />
                    <div className="user-details">
                        <h4>{user.firstName} {user.lastName}</h4>
                        <p>{user.email}</p>
                        <button className="add-button" onClick={() => handleAddCompanion(user.email)}>Add Companion</button>
                        </div>
                </div>
                ))}
        </div>
    )
}

export default AddCompanion;