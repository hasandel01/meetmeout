import { User } from "./User";


export interface RecommendedFriendDTO {
    user: User,
    mutualFriends: User[],
    sharedEvents: Event[],
    reason: string
}