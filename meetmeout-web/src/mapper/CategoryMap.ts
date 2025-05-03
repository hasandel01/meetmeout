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
    OUTDOOR_NATURE: {label: "Doğa", icon: "🌳", color:" bg-green-100 text-green-700"},
    LIVE_MUSIC: {label: "Müzik", icon: "🎶", color:" bg-blue-100 text-blue-700"},
    WELLNESS: {label: "Sağlık", icon: "💪", color:" bg-yellow-100 text-yellow-700"},
    SPORTS: {label: "Spor", icon: "⚽", color:" bg-red-100 text-red-700"},
    SOCIAL: {label: "Sosyal", icon: "👥", color:" bg-purple-100 text-purple-700"},
    FOOD_DRINK: {label: "Yiyecek & İçecek", icon: "🍔", color:" bg-orange-100 text-orange-700"},
    ART_CULTURE: {label: "Sanat & Kültür", icon: "🎨", color:" bg-pink-100 text-pink-700"},
    WORKSHOP: {label: "Atölye", icon: "🛠️", color:" bg-teal-100 text-teal-700"},
    GAMES: {label: "Oyunlar", icon: "🎮", color:" bg-indigo-100 text-indigo-700"},
    NETWORKING: {label: "Ağ Oluşturma", icon: "🤝", color:" bg-gray-100 text-gray-700"},
    FAMILY: {label: "Aile", icon: "👨‍👩‍👧‍👦", color:" bg-yellow-100 text-yellow-700"},
    ADVENTURE: {label: "Macera", icon: "🧗", color:" bg-green-100 text-green-700"}
};

export const getCategoryIconLabel = (category: string): { label: string, icon: string, color: string } => {
    return categoryIcons[category] || { label: "Unknown", icon: "❓", color:" bg-gray-100 text-gray-700"};
}