
import { User } from './User';


export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
    isPrivate: boolean;
    maximumCapacity: number;
    isDraft: boolean;
    category: string;
    tags: string[];
    status: string;
    attendees: User[];
    organizer: User | null;
    addressName: string;
}