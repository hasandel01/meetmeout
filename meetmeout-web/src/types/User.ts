import { Badge } from "./Badge";

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
}
