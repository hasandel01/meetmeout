import { User } from './User';
import { NotificationType } from './NotificationType';

export interface Notification {
    id: number;
    sender: User;
    receiver: User;
    title: string;
    body: string;
    read: boolean;
    url: string;
    type: NotificationType;
}