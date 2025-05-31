import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { User } from "../types/User";
import axiosInstance from "../axios/axios";
import { useUserContext } from "./UserContext";

export interface BadgeContextType {
  getMe: () => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const BadgeContextProvider = ({ children }: { children: React.ReactNode }) => {
  const {currentUser } = useUserContext();
  const [currentUserUpdated, setCurrentUserUpdated] = useState<User | undefined>(undefined);

  const lengthRef = useRef<number>(currentUser?.badges?.length || 0);

  const getMe = async () => {
    try {
      const response = await axiosInstance.get("/me");
      setCurrentUserUpdated(response.data);
      console.log("Updated User:", response.data);
    } catch (error) {
      toast.error("Error fetching user data.");
    }
  };

  useEffect(() => {
    const updatedBadges = currentUserUpdated?.badges ?? [];
    const newLength = updatedBadges.length;
    const prevLength = lengthRef.current;

    const isNewBadgeAdded = newLength > prevLength;

    if (isNewBadgeAdded) {
      const lastBadge = updatedBadges.at(-1);
      if (lastBadge) {
        toast(
          <div style={{ display: "flex", gap: "10px", height: "60px" }}>
            <img
              src={lastBadge.iconUrl}
              alt="Badge"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "2px solid white",
              }}
            />
            <div>
              <p style={{ fontWeight: "bold", color: "white" }}>{lastBadge.title}</p>
              <p style={{ color: "white" }}>{lastBadge.description}</p>
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
      }
    }

    // her durumda güncelle
    lengthRef.current = newLength;
  }, [currentUserUpdated?.badges]);

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
