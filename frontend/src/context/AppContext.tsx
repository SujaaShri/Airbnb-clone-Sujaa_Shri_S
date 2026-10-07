"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, FilterState } from "@/types";
import { getUsers, getWishlistIds, toggleWishlist as apiToggleWishlist } from "@/lib/api";

export interface ToastItem {
  id: string;
  message: string;
  type?: "success" | "info" | "error";
}

const DEFAULT_FILTERS: FilterState = {
  category: "all",
  location: "",
  checkIn: "",
  checkOut: "",
  guests: 1,
  minPrice: null,
  maxPrice: null,
  propertyType: "any",
  bedrooms: null,
  amenities: [],
  sortBy: "default",
};

interface AppContextType {
  currentUser: User | null;
  users: User[];
  switchUser: (user: User) => void;
  wishlistIds: Set<number>;
  toggleWishlist: (listingId: number) => Promise<void>;
  toasts: ToastItem[];
  addToast: (message: string, type?: "success" | "info" | "error") => void;
  removeToast: (id: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (open: boolean) => void;
  isSearchExpanded: boolean;
  setIsSearchExpanded: (expanded: boolean) => void;
  totalBeforeTaxes: boolean;
  setTotalBeforeTaxes: (show: boolean) => void;
  currency: "INR" | "USD";
  setCurrency: (currency: "INR" | "USD") => void;
  formatPrice: (pricePerNight: number) => string;
  headerTab: "All" | "Homes" | "Experiences" | "Services";
  setHeaderTab: (tab: "All" | "Homes" | "Experiences" | "Services") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [totalBeforeTaxes, setTotalBeforeTaxes] = useState(false);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR"); // Default to INR to match user's screenshot
  const [headerTab, setHeaderTab] = useState<"All" | "Homes" | "Experiences" | "Services">("All");

  // Load demo users
  useEffect(() => {
    async function initUsers() {
      try {
        const uList = await getUsers();
        setUsers(uList);
        if (uList.length > 0) {
          const savedUserId = localStorage.getItem("airbnb_demo_user_id");
          const found = uList.find((u) => u.id === Number(savedUserId)) || uList[0];
          setCurrentUser(found);
        }
      } catch (err) {
        console.warn("Could not load users from backend", err);
        const fallback: User = {
          id: 1,
          name: "Alex Rivers",
          email: "alex.guest@airbnb-demo.com",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
          is_superhost: false,
          joined_year: 2021,
          role: "guest",
        };
        setUsers([fallback]);
        setCurrentUser(fallback);
      }
    }
    initUsers();
  }, []);

  // Sync wishlists when user changes
  useEffect(() => {
    if (!currentUser) return;
    async function syncWishlist() {
      try {
        const ids = await getWishlistIds(currentUser!.id);
        setWishlistIds(new Set(ids));
      } catch {
        // quiet fallback
      }
    }
    syncWishlist();
  }, [currentUser]);

  const switchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("airbnb_demo_user_id", user.id.toString());
    addToast(`Switched profile to ${user.name} (${user.role.toUpperCase()})`, "info");
  };

  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleWishlist = async (listingId: number) => {
    if (!currentUser) return;
    const isCurrentlyWishlisted = wishlistIds.has(listingId);

    // Optimistic UI update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyWishlisted) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });

    try {
      const res = await apiToggleWishlist(listingId, currentUser.id);
      addToast(res.message, res.is_wishlisted ? "success" : "info");
    } catch {
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyWishlisted) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });
      addToast("Failed to update wishlist", "error");
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const formatPrice = (pricePerNight: number) => {
    if (currency === "INR") {
      // If price stored is already in INR (>= 1000) or USD
      const inrAmount = pricePerNight < 1000 ? Math.round(pricePerNight * 85) : pricePerNight;
      return `₹${inrAmount.toLocaleString()}`;
    }
    const usdAmount = pricePerNight >= 1000 ? Math.round(pricePerNight / 85) : pricePerNight;
    return `$${usdAmount.toLocaleString()}`;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        wishlistIds,
        toggleWishlist,
        toasts,
        addToast,
        removeToast,
        filters,
        setFilters,
        resetFilters,
        isFilterModalOpen,
        setIsFilterModalOpen,
        isSearchExpanded,
        setIsSearchExpanded,
        totalBeforeTaxes,
        setTotalBeforeTaxes,
        currency,
        setCurrency,
        formatPrice,
        headerTab,
        setHeaderTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
