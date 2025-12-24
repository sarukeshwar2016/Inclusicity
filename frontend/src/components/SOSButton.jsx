// src/components/SOSButton.jsx
import { useState } from "react";
import { voiceSocket } from "../services/api"; // Reuse your existing socket
import { AlertCircle } from "lucide-react";

export default function SOSButton() {
  const [alertSent, setAlertSent] = useState(false);

  const sendSOS = () => {
    if (alertSent) return;

    // Emit SOS alert to server
    voiceSocket.emit("sos_alert", {
      message: "Emergency SOS triggered!",
      userId: localStorage.getItem("userId") || "unknown", // or from AuthContext
      timestamp: new Date().toISOString(),
    });

    setAlertSent(true);
    alert("🚨 Emergency alert sent to admin! Help is on the way."); // Fallback

    // Reset after 30 seconds
    setTimeout(() => setAlertSent(false), 30000);
  };

  return (
    <button
      onClick={sendSOS}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-red-600 px-8 py-6 text-2xl font-bold text-white shadow-2xl transition-all hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 ${
        alertSent ? "animate-pulse" : ""
      }`}
      aria-label="Emergency SOS Button – Click for immediate help"
    >
      <AlertCircle size={36} />
      SOS
    </button>
  );
}