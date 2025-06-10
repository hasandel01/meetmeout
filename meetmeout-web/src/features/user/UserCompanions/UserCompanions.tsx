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
import { RecommendedFriendDTO } from "../../../types/RecommendedFriend";

const UserCompanions = () => {

    const { username } = useParams<{ username: string }>();
    const {currentUser} = useUserContext();
    const [page, setPage] = useState(1);
    const [companions, setCompanions] = useState<User[]>([]);
    const [recommendedCompanions, setRecommendedCompanions] = useState<RecommendedFriendDTO[] | null>(null);
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
            const response = await axiosInstance.get(`/companions/recommendations`);
            setRecommendedCompanions(response.data);
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

            setRecommendedCompanions((prev) => (prev ?? []).filter((recommended) => recommended.user.email !== receiverEmail))
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
    <div className={styles.companionsContainer}>
        <div className={styles.mainPanel}>
        <div className={styles.tabHeader}>
            <button className={page === 1 ? styles.activeTab : ""} onClick={() => setPage(1)}>Companions</button>
            <button className={page === 2 ? styles.activeTab : ""} onClick={() => setPage(2)}>Pending Requests</button>
        </div>

        {page === 1 && (
            <div className={styles.userContainer}>
                <h3>Companions</h3>

                {companions.length > 0 ? (
                <>
                    <div className={styles.companionsHeader}>
                    <div className={styles.searchBar}>
                        <FontAwesomeIcon icon={faSearch} />
                        <input
                        type="text"
                        placeholder="Search companions..."
                        onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className={styles.sortContainer}>
                        <label>Sort by:</label>
                        <select onChange={(e) => setSortType(e.target.value)}>
                        <option value="Recently Added">Recently Added</option>
                        <option value="First Name">First Name</option>
                        <option value="Last Name">Last Name</option>
                        </select>
                    </div>
                    </div>

                    <ul className={styles.divisionContainer}>
                    {sortCompanions()
                        ?.filter(c => query === "" || searchResults.some(s => s.username === c.username))
                        .map(c => (
                        <li key={c.email}>
                            <div className={styles.userDetails} onClick={() => goToUserProfile(c.username)}>
                            <img src={c.profilePictureUrl} alt="User" />
                            <div className={styles.userDetailsInfo}>
                                <h4>{c.firstName} {c.lastName}</h4>
                                <p>@{c.username}</p>
                            </div>
                            </div>
                            <button className={styles.decline} onClick={(e) => {
                            e.stopPropagation();
                            removeCompanion(c.email);
                            }}>Remove</button>
                        </li>
                    ))}
                    </ul>
                </>
                ) : (
                <p className={styles.noRequestsText}>You have no companions.</p>
                )}
            </div>
        )}
        {page === 2 && currentUser?.username === username && (
        <div className={styles.userContainer}>
            <h3>Pending Friend Requests</h3>

                    {friendRequests.length > 0 ? (
            <>
                <div className={styles.companionsHeader}>
                <div className={styles.searchBar}>
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                    type="text"
                    placeholder="Search requesters..."
                    onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className={styles.sortContainer}>
                    <label>Sort by:</label>
                    <select onChange={(e) => setSortType(e.target.value)}>
                    <option value="Recently Added">Recently Added</option>
                    <option value="First Name">First Name</option>
                    <option value="Last Name">Last Name</option>
                    </select>
                </div>
                </div>

                <ul className={styles.divisionContainer}>
                {sortRequesters()
                    ?.filter(r => query === "" || searchResults.some(s => s.username === r.sender.username))
                    .map(request => (
                    <li key={request.id}>
                        <div className={styles.userDetails}  onClick={() => goToUserProfile(request.sender.username)}>
                        <img src={request.sender.profilePictureUrl} alt="User" />
                        <div className={styles.userDetailsInfo}>
                            <h4>{request.sender.firstName} {request.sender.lastName}</h4>
                            <p>@{request.sender.username}</p>
                        </div>
                        </div>
                        <div className={styles.actionButtons}>
                        <button className={styles.accept} onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptRequest(request.sender.email);
                        }}>Accept</button>
                        <button className={styles.decline} onClick={(e) => {
                            e.stopPropagation();
                            handleRejectRequest(request.sender.email);
                        }}>Decline</button>
                        </div>
                    </li>
                ))}
                </ul>
            </>
            ) : (
            <p className={styles.noRequestsText}>You have no pending requests at the moment.</p>
            )}
        </div>
        )}
        {currentUser?.username === username && (
            <div className={styles.suggestionsPanel}>
            <h3>Suggestions</h3>
            {recommendedCompanions && recommendedCompanions.length > 0 ? (
                <ul className={styles.divisionContainer}>
                {recommendedCompanions.map(recommendedCompanion => (
                    <li key={recommendedCompanion.user.email}>
                    <div className={styles.userDetails}  onClick={() => goToUserProfile(recommendedCompanion.user.username)}>
                        <img src={recommendedCompanion.user.profilePictureUrl} alt="User" />
                        <div className={styles.userDetailsInfo}>
                            <h4>{recommendedCompanion.user.firstName} {recommendedCompanion.user.lastName}</h4>
                            <p>@{recommendedCompanion.user.username}</p>
                            <p>{recommendedCompanion.reason}</p>
                        </div>
                    </div>
                    <button className={styles.addButton} onClick={(e) => {
                        e.stopPropagation();
                        handleAddCompanion(recommendedCompanion.user.email);
                    }}>Send Request</button>
                    </li>
                ))}
                </ul>
            ) : <p>No suggestions right now.</p>}
            </div>
        )}
        </div>
    </div>
);

}

export default UserCompanions;