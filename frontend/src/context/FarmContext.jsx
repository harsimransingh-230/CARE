import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback
} from "react";
import React from "react";

import api from "../api";
import { useAuth } from "./AuthContext";

const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const { user } = useAuth();

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(
    () => localStorage.getItem("buffalocare_farm_id") || ""
  );
  const [loadingFarms, setLoadingFarms] = useState(false);
  const [farmError, setFarmError] = useState("");

  // Support MongoDB _id and regular id
  const userId = user?._id || user?.id || user?.userId || "";

  // Fetch farms from backend
  const refreshFarms = useCallback(async (preferredId = "") => {
    if (!userId) {
      setFarms([]);
      setSelectedFarmId("");
      localStorage.removeItem("buffalocare_farm_id");
      setFarmError("");
      return [];
    }

    setLoadingFarms(true);
    setFarmError("");

    try {
      const { data } = await api.get("/farms");

      const nextFarms = Array.isArray(data.farms)
        ? data.farms
        : [];

      setFarms(nextFarms);

      // Restore previously selected farm
      const savedId =
        preferredId ||
        localStorage.getItem("buffalocare_farm_id") ||
        "";

      const chosenFarm =
        nextFarms.find(
          (farm) => String(farm._id) === String(savedId)
        ) || nextFarms[0];

      const nextId = chosenFarm?._id || "";

      setSelectedFarmId(nextId);

      if (nextId) {
        localStorage.setItem("buffalocare_farm_id", nextId);
      } else {
        localStorage.removeItem("buffalocare_farm_id");
      }

      return nextFarms;

    } catch (error) {
      console.error("Failed to fetch farms:", error);

      setFarms([]);
      setSelectedFarmId("");

      setFarmError(
        error.message ||
        "Unable to load farms. Please try again."
      );

      return [];

    } finally {
      setLoadingFarms(false);
    }
  }, [userId]);

  // Load farms whenever the logged-in user changes
  useEffect(() => {
    refreshFarms();
  }, [refreshFarms]);

  // Select a farm
  const selectFarm = useCallback((id) => {
    setSelectedFarmId(id);

    if (id) {
      localStorage.setItem("buffalocare_farm_id", id);
    } else {
      localStorage.removeItem("buffalocare_farm_id");
    }
  }, []);

  // Get currently selected farm
  const selectedFarm =
    farms.find(
      (farm) => String(farm._id) === String(selectedFarmId)
    ) || null;

  const value = useMemo(() => ({
    farms,
    selectedFarm,
    selectedFarmId,
    selectFarm,
    refreshFarms,
    loadingFarms,
    farmError
  }), [
    farms,
    selectedFarm,
    selectedFarmId,
    selectFarm,
    refreshFarms,
    loadingFarms,
    farmError
  ]);

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
}

// Custom hook
export function useFarm() {
  const context = useContext(FarmContext);

  if (!context) {
    throw new Error(
      "useFarm must be used within FarmProvider"
    );
  }

  return context;
}
