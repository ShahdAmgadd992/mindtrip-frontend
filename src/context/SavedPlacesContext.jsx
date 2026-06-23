import React, { createContext, useContext, useState, useEffect } from "react";

const SavedPlacesContext = createContext();

export const SavedPlacesProvider = ({ children }) => {
  const [savedPlaces, setSavedPlaces] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedPlaces")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));
  }, [savedPlaces]);

  const toggleSaved = (place) => {
    setSavedPlaces((prev) => {
      const exists = prev.find((p) => p.id === place.id);
      return exists ? prev.filter((p) => p.id !== place.id) : [...prev, place];
    });
  };

  const isSaved = (id) => savedPlaces.some((p) => p.id === id);

  return (
    <SavedPlacesContext.Provider value={{ savedPlaces, toggleSaved, isSaved }}>
      {children}
    </SavedPlacesContext.Provider>
  );
};

export const useSavedPlaces = () => {
  const context = useContext(SavedPlacesContext);
  console.log("🧠 useSavedPlaces called, context:", context); // ← أضيفي دي
  return context;
};
