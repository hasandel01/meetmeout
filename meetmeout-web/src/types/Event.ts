
import { User } from './User';
import { Like, Comment, Review} from './Like';

export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
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
    createdAt: string;
    isFeeRequired: boolean;
    fee: number;
    isCapacityRequired: boolean;
    isThereRoute: boolean;
    endLatitude: number;
    endLongitude: number;
}