import { User } from "./User";

export interface UserReview {
    id: number,
    review: string,
    rating: number,
    user: User,
    reviewer: User,
    createdAt: string
}