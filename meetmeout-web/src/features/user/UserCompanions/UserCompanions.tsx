import { useParams } from "react-router-dom";
import axiosInstance from "../../../axios/axios";
import {User} from "../../../types/User";
import { useEffect, useState } from "react";
import styles from "./UserCompanions.module.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUserContext } from "../../../context/UserContext";
import { useProfileContext } from "../../../context/ProfileContext";
import {FriendRequest} from "../../../types/FriendRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useBadgeContext } from "../../../context/BadgeContext";

const UserCompanions = () => {

    const { username } = useParams<{ username: string }>();
    const {currentUser} = useUserContext();
    const [page, setPage] = useState(1);
    const [companions, setCompanions] = useState<User[]>([]);
    const [possibleCompanions, setPossibleCompanions] = useState<User[] | null>(null);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const {goToUserProfile} = useProfileContext();
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const pagination = 0;
    const size = 3;
    const [sortType, setSortType] = useState(`Recently Added`);
    const [query, setQuery] = useState("");
    const {getMe} = useBadgeContext();

    const getPendingRequests = async () => {
        try {
            const response = await axiosInstance.get(`/companions/requests`);
            setFriendRequests(response.data);
        } catch (error) {
        }
    };

    const getAllPossibleCompanions = async () => {
        try {
            const response = await axiosInstance.get(`/companions/possible`);
            setPossibleCompanions(response.data);
        } catch (error) {
        }
    };

    const getCompanions = async () => {
        try {
            const response = await axiosInstance.get(`/companions/${username}`);
            console.log("Companion profile fetched successfully:", response.data);
            setCompanions(response.data);
        }
        catch (error) {
            console.error("Error fetching companion profile:", error);
        }
    };

    const handleAddCompanion = async (receiverEmail: string) => {
        try {
            await axiosInstance.post(`/companions/${encodeURIComponent(receiverEmail)}`,
                null);
            
            toast.info("Companion request sent!");

            setPossibleCompanions((prev) => (prev ?? []).filter((user) => user.email !== receiverEmail))
        }
        catch (error) {
            toast.error("Error sending companion request.")
        }
    }

    const handleAcceptRequest = async (senderEmail: string) => {
        try {
            await axiosInstance.post(`/companions/${senderEmail}/accept`, null);
            toast.info("Companion request is accepted.")
            setFriendRequests((prevRequests) => prevRequests.filter((request) => request.sender.email !== senderEmail));
            await getCompanions();
            await getMe();
        } catch (error) {
            toast.error("Error happened while accepting companion request.")
        }
    }

    const handleRejectRequest = async (senderEmail: string) => {
        try {
            const response = await axiosInstance.post(`/companions/${senderEmail}/reject`, null);
            console.log("Companion request rejected:", response.data);
            setFriendRequests((prevRequests) => prevRequests.filter((request) =>  request.sender.email !== senderEmail));
        }
        catch (error) {
            console.error("Error rejecting friend request:", error);
        }
    }

    useEffect(() => {
    getCompanions();
    getAllPossibleCompanions();
    getPendingRequests();
}, [username]); 



    const removeCompanion = async (companionEmail: string) => {
        try {
            const response = await axiosInstance.delete(`/companions/${companionEmail}`)
                if(response.data === true)
                    toast.success("Companion removed!")
                
             setCompanions((prev) => prev.filter((companion) => companion.email !== companionEmail))
        }catch(error) {
            toast.error("There was an error while removing companion...");
        }
    }

      const companionsSearch = async () => {

        try {

            const response = await axiosInstance.get(`/search/companions`,
            {
                params: {
                    query: query,
                    page: pagination,
                    size: size,
                }
            })

                setSearchResults(response.data)
                console.log(response.data)

        } catch(error) {

        }

      }

      const requestersSearch = async () => {
         
        try {

            const response = await axiosInstance.get(`/search/requesters`,
            {
                params: {
                    query: query,
                    page: pagination,
                    size: size,
                }
            })

                setSearchResults(response.data)
                console.log(response.data)

        } catch(error) {

        }
      }


      useEffect(() => {

        if(query !== "" && page === 1)
            companionsSearch();
        else if(query !== "" && page === 2)
            requestersSearch();

      },[query])


      useEffect(() => {

        setQuery("");

      },[page])


      const sortCompanions = () => {

        if(sortType === `Recently Added`)
            return [...companions].reverse();
        else if(sortType === `First Name`) 
            return [...companions].sort((a,b) => { return a.firstName.localeCompare(b.firstName)})
        else if(sortType === `Last Name`)  
            return [...companions].sort((a,b) => { return a.lastName.localeCompare(b.lastName)})  

      }

      const sortRequesters = () => {
        if(sortType === 'Recently Added')
            return [...friendRequests].reverse();
        else if(sortType === `First Name`) 
            return [...friendRequests].sort((a,b) => { return a.sender.firstName.localeCompare(b.sender.firstName)})
        else if(sortType === `Last Name`)  
            return [...friendRequests].sort((a,b) => { return a.sender.lastName.localeCompare(b.sender.lastName)})  
      }

    return (
        <div className ={styles.companionsContainer}>
            <div className={styles.filterPanel}>
                <label onClick={()=> setPage(1)}> Companions </label>
                <label onClick={() => setPage(2)}> Pending Requests </label>
            </div>
                <div className={styles.mainPanel}>
                    {page === 1 && 
                    <div className={styles.userContainer}>  
                        <h3>Companions</h3>
                        {companions.length > 0 ? (
                            <div className={styles.divisionContainer}>
                                <div className={styles.companionsHeader}>
                                    <div className={styles.searchBar}> 
                                        <FontAwesomeIcon icon={faSearch}/>
                                        <input
                                            type="text"
                                            placeholder="Search companions..."
                                            onChange={(e) => setQuery(e.target.value)} 
                                        />
                                    </div>
                                    <div className={styles.sortContainer}> 
                                        <label>Sort by: </label>
                                        <select className={styles.companionSort} onChange={(e) => setSortType(e.target.value)}>
                                                <option value="Recently Added">Recently Added</option>
                                                <option value="First Name">First Name</option>
                                                <option value="Last Name">Last Name</option>
                                        </select>
                                    </div>
                                </div>
                            <ul>
                                {sortCompanions()?.filter(companion => {
                                        if(query === '') 
                                             return [...companions].reverse;
                                        else
                                            return searchResults.some(searchResult => companion.username === searchResult.username)
                                    }).map((companion: User) => (
                                    <li key={companion.email}>
                                        <div className={styles.userDetails} onClick={() => goToUserProfile(companion.username)}>
                                            <img src={companion.profilePictureUrl} alt="Companion" />
                                            <div className={styles.userDetailsInfo}>
                                                <h4>{companion.firstName} {companion.lastName}</h4>
                                                <p>@{companion.username}</p>
                                            </div>
                                        </div>
                                        <button 
                                                className={styles.decline}
                                                onClick={(e) =>
                                            {
                                                e.stopPropagation();
                                                removeCompanion(companion.email)
                                            }
                                        }>
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>      
                        </div>
                        ) : (
                            <p>There is no companions, maybe you want to add?</p>
                        )}
                    </div>

                }
                {page === 2 && currentUser?.username === username && (
                <div className={styles.userContainer}>
                    <h3>Pending Friend Requests</h3>
                    {friendRequests.length > 0 ? (
                        <div className={styles.divisionContainer}>
                            <div className={styles.companionsHeader}>
                                    <div className={styles.searchBar}> 
                                        <FontAwesomeIcon icon={faSearch}/>
                                        <input
                                            type="text"
                                            placeholder="Search requesters..."
                                            onChange={(e) => setQuery(e.target.value)} 
                                        />
                                    </div>
                                    <div className={styles.sortContainer}> 
                                        <label>Sort by: </label>
                                        <select className={styles.companionSort} onChange={(e) => setSortType(e.target.value)}>
                                                <option value="Recently Added">Recently Added</option>
                                                <option value="First Name">First Name</option>
                                                <option value="Last Name">Last Name</option>
                                        </select>
                                    </div>
                            </div>
                            <ul>
                                {sortRequesters()
                                ?.filter(request => {
                                        if(query === '') 
                                             return [...friendRequests].reverse;
                                        else
                                            return searchResults.some(searchResult => request.sender.username === searchResult.username)
                                        }).map((request) => (
                                        <li key={request.id} className="friend-request-item" onClick={() => goToUserProfile(request.sender.username)}>
                                        <div className={styles.userDetails}>
                                            <img src={request.sender.profilePictureUrl} alt="User" className="user-picture" />
                                            <div className={styles.userDetailsInfo}>
                                                <h4>{request.sender.firstName} {request.sender.lastName}</h4>
                                                <p>@{request.sender.username}</p>
                                            </div>
                                        </div>
                                        <div className={styles.actionButtons}>
                                        <button 
                                            className={`${styles.button} ${styles.accept}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAcceptRequest(request.sender.email);
                                            }}>
                                                Accept</button>
                                        <button 
                                            className={`${styles.button} ${styles.decline}`}
                                            onClick={(e) =>
                                            {
                                                e.stopPropagation(); 
                                                handleRejectRequest(request.sender.email)
                                            }}>Decline</button>
                                        </div>
                                        </li>
                                ))}
                            </ul>
                        </div>
                    ) 
                    : (
                        <p>There are no pending requests for now.</p>
                    )}

                </div> 
                )}

            </div>
            {currentUser?.username === username && (
                <div className={styles.suggestionsPanel}>
                    <div className={styles.userContainerSg}>
                        <h3>Suggestions</h3>
                        {possibleCompanions && possibleCompanions.length > 0 ? (
                            <div className={styles.divisionContainer}>
                                <ul>
                                {possibleCompanions?.map((user) => (
                                    <li onClick={() => goToUserProfile(user.username)}>
                                        <div className={styles.userDetails}>
                                            <img src={user.profilePictureUrl} alt="User" className="user-picture" />
                                                <div className={styles.userDetailsInfo}>
                                                    <h4>{user.firstName} {user.lastName}</h4>
                                                    <p>@{user.username}</p>
                                                </div>
                                        </div>
                                        <button className={`${styles.addButton}`} 
                                            onClick={(e) =>{
                                                e.stopPropagation();
                                                handleAddCompanion(user.email);
                                        }}> Send Request</button>
                                    </li>
                                ))}
                                </ul>
                            </div>
                            ) : 
                            (
                                <p> There are no suggestions right now. </p>
                            )}

                    </div>        
                </div>     
            )}
        </div>
    )
}

export default UserCompanions;