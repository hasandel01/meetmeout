import {User} from "./User"

export interface Message {
    message: string,
    user: User,
    timestamp: string
}