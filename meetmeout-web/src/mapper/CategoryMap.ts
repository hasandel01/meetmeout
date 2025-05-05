export const categoryMap: { [key: string]: string } = {
    "OUTDOOR_NATURE": "Outdoor & Nature",
    "LIVE_MUSIC": "Live Music",
    "WELLNESS": "Wellness",
    "SPORTS": "Sports",
    "SOCIAL": "Social",
    "FOOD_DRINK": "Food & Drink",
    "ART_CULTURE": "Art & Culture",
    "WORKSHOP": "Workshop",
    "GAMES": "Games",
    "NETWORKING": "Networking",
    "FAMILY": "Family",
    "ADVENTURE": "Adventure",
};



const categoryIcons: Record<string, { label: string, icon: string, color: string }> = {
    OUTDOOR_NATURE: {label: "Nature", icon: "🌳", color:" bg-green-100 text-green-700"},
    LIVE_MUSIC: {label: "Music", icon: "🎶", color:" bg-blue-100 text-blue-700"},
    WELLNESS: {label: "Health", icon: "💪", color:" bg-yellow-100 text-yellow-700"},
    SPORTS: {label: "Sport", icon: "⚽", color:" bg-red-100 text-red-700"},
    SOCIAL: {label: "Social", icon: "👥", color:" bg-purple-100 text-purple-700"},
    FOOD_DRINK: {label: "Food & Drink", icon: "🍔", color:" bg-orange-100 text-orange-700"},
    ART_CULTURE: {label: "Art & Culture", icon: "🎨", color:" bg-pink-100 text-pink-700"},
    WORKSHOP: {label: "Workshop", icon: "🛠️", color:" bg-teal-100 text-teal-700"},
    GAMES: {label: "Games", icon: "🎮", color:" bg-indigo-100 text-indigo-700"},
    NETWORKING: {label: "Networking", icon: "🤝", color:" bg-gray-100 text-gray-700"},
    FAMILY: {label: "Family", icon: "👨‍👩‍👧‍👦", color:" bg-yellow-100 text-yellow-700"},
    ADVENTURE: {label: "Adventure", icon: "🧗", color:" bg-green-100 text-green-700"}
};

export const getCategoryIconLabel = (category: string): { label: string, icon: string, color: string } => {
    return categoryIcons[category] || { label: "Unknown", icon: "❓", color:" bg-gray-100 text-gray-700"};
}