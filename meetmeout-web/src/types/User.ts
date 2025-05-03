export interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePictureUrl: string;
    bio: string;
    companions: User[]; 
    activity: string[]; 
}
