export interface Like {
    id: number;
    username: string;
    eventId: number;
}

export interface Comment {
    commentId: number;
    comment: string;
    userId: number;
    eventId: number;
    username: string;
    updatedAt: string;
}


export interface Review {
    reviewerId: number;
    title: string;
    content: string;
    updatedAt: string;
    rating: number;
}