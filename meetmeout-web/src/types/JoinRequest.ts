import {User} from "./User";

export interface JoinRequest {
    user: User,
    eventId: number
}