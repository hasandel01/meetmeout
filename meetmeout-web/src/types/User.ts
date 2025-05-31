import { Badge } from "./Badge";
import { Review } from "./Like";
import { UserReview } from "./UserReviews";

export interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePictureUrl: string;
    about: string;
    companions: User[]; 
    participatedEventIds: number[];
    organizedEventIds: number[];
    badges: Badge[];
    showLocation: boolean;
    darkMode: boolean;
    reviews: Review[];
    userReviews: UserReview[];
}
