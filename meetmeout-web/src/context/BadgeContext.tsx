import { createContext, useContext, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../axios/axios";
import { Badge } from "../types/Badge";
import { useUserContext } from "./UserContext";

export interface BadgeContextType {
  getMe: () => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useUserContext();

  const prevBadgesRef = useRef<Badge[] | null>(null);

  useEffect(() => {
    if (currentUser && prevBadgesRef.current === null) {
      prevBadgesRef.current = currentUser.badges ?? [];
    }
  }, [currentUser]);

  const getMe = async () => {
    try {
      const response = await axiosInstance.get("/me");
      const newBadges: Badge[] = response.data.badges ?? [];

      const prevBadges = prevBadgesRef.current ?? [];
      const prevIds = new Set(prevBadges.map(b => b.id));
      const newlyEarned = newBadges.filter(b => !prevIds.has(b.id));

      if (newlyEarned.length > 0) {
        newlyEarned.forEach(badge => showBadgeToast(badge));
      }

      prevBadgesRef.current = newBadges;
    } catch (error) {
      toast.error("Error fetching badge data.");
    }
  };

  const showBadgeToast = (badge: Badge) => {
    toast(
      <div style={{ display: "flex", gap: "10px", height: "60px" }}>
        <img
          src={badge.iconUrl}
          alt="Badge"
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "2px solid white",
          }}
        />
        <div>
          <p style={{ fontWeight: "bold", color: "white" }}>{badge.title}</p>
          <p style={{ color: "white" }}>{badge.description}</p>
        </div>
      </div>,
      {
        style: { backgroundColor: "#15b37e" },
        className: "customToast",
        onOpen: () => {
          try {
            const audio = new Audio("/sounds/success.mp3");
            audio.play().catch((e) => console.warn("Audio playback blocked:", e));
          } catch (e) {
            console.error("Audio error:", e);
          }
        },
      }
    );
  };

  return (
    <BadgeContext.Provider value={{ getMe }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error("BadgeContext must be used within a BadgeContextProvider");
  }
  return context;
};
