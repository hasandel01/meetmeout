
import { User } from './User';
import { Like, Comment, Review} from './Like';

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
    likes: Like[];
    comments: Comment[];
    reviews: Review[];

}