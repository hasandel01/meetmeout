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
    title: string;
    content: string;
    updatedAt: string;
    rating: number;
}


export interface Invitation {
    id: number,
    eventId: number,
    senderId: number,
    receiverId: number,
    status: boolean
}