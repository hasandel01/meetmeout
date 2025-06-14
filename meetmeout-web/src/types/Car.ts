import { User } from "./User";

export interface Car {
    id: number;
    make: string;
    model: string;
    year: number;
    capacity: number;
    userId: number;
}


export interface RideAssigment {
    id: number;
    car: Car;
    passenger: User;
}


export interface EventCar {
    id: number;
    car: Car;
    passengers: User[];
}