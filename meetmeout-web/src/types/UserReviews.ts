import { Event } from "./Event";
import { User } from "./User";

export interface UserReview {
    id: number,
    review: string,
    rating: number,
    organizer: User,
    reviewer: User,
    event: Event,
    createdAt: string
}