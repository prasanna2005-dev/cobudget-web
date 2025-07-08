import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const dietaryOptions = ["Diabetes", "Gluten-Free", "Vegan", "High Protein"];

export default function Profile() {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchPreferences = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setSelected(snap.data().preferences || []);
      }
    };
    fetchPreferences();
  }, []);

  const handleSubmit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return alert("User not logged in");
    await setDoc(doc(db, "users", uid), { preferences: selected }, { merge: true });
    alert("Preferences saved!");
  };

  const handleToggle = (option) => {
    setSelected(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Set Your Dietary Preferences</h2>
      <div className="space-y-2">
        {dietaryOptions.map(option => (
          <label key={option} className="block">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => handleToggle(option)}
            />{" "}
            {option}
          </label>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save Preferences
      </button>
    </div>
  );
}

