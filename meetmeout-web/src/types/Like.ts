import {User} from "./User"

export interface Like {
    id: number;
    username: string;
    eventId: number;
}

export interface Comment {
    commentId: number;
    comment: string;
    eventId: number;
    sender: User;
    updatedAt: string;
    sentAt: string;
}


export interface Review {
    reviewId: number;
    reviewer: User;
    content: string;
    updatedAt: string;
    rating: number;
    isDismissed: boolean;
}


export interface Invitation {
    id: number,
    eventId: number,
    senderId: number,
    receiverId: number,
    status: boolean,
    token: string
}