export const getOrganizerRatingDescription = (rating: number, isOwnProfile: boolean, wasReviewed: boolean): string => {
    if (rating === 0) {

        if(wasReviewed) {
        return isOwnProfile
            ? "You are not a good organizer as it seems, but don't lose hope."
            : "This organizer isn't liked by much participants.";
        }
        else {
            return isOwnProfile
                ? "You haven't reviewed by any participants as an organizer yet."
                : "This user hasn't been reviewed as an organizer.";
        }
    }

    if (rating < 2) {
        return isOwnProfile
            ? "Your event organization skills need improvement."
            : "Needs improvement as an organizer.";
    }

    if (rating < 3.5) {
        return isOwnProfile
            ? "A decent start — keep growing as an organizer!"
            : "Has potential as an event organizer.";
    }

    if (rating < 4.5) {
        return isOwnProfile
            ? "You're doing well! People enjoy the events you organize."
            : "A reliable and appreciated organizer.";
    }

    return isOwnProfile
        ? "Fantastic! Your events receive excellent feedback 🎉"
        : "Highly rated organizer — attendees love their events!";
};
