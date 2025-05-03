export interface Like {
    id: number;
    userId: number;
    eventId: number;
}

export interface Comment {
    commentId: number;
    comment: string;
    userId: number;
    eventId: number;
    updatedAt: string;
}


export interface Review {
    reviewerId: number;
    title: string;
    content: string;
    updatedAt: string;
    rating: number;
}