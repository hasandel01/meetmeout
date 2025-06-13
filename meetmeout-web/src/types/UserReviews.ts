import { User } from "./User";

export interface UserReview {
    id: number,
    review: string,
    rating: number,
    organizer: User,
    reviewer: User,
    createdAt: string
}