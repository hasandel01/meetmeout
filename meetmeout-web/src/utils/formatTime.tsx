export const formatTime = (timestamp: string) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diff = Math.floor((now.getTime() - posted.getTime()) / 1000); // saniye farkı
  
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  
    return posted.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  export default formatTime;