import { useState } from "react";
import { sosAPI } from "../services/api";
import { AlertCircle } from "lucide-react";

export default function SOSButton() {
  console.log("🆘 SOSButton rendered");

  const [alertSent, setAlertSent] = useState(false);

  const sendSOS = async () => {
    console.log("🆘 SOS button clicked");

    if (alertSent) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to send SOS");
      return;
    }

    try {
      console.log("🆘 Sending SOS API request");

      await sosAPI.send({
        message: "Emergency SOS triggered!",
      });

      setAlertSent(true);
      alert("🚨 Emergency alert sent!");

      setTimeout(() => setAlertSent(false), 30000);
    } catch (err) {
      console.error("🆘 SOS error:", err);
      alert("Failed to send SOS");
    }
  };

  return (
    <button
      onClick={sendSOS}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-red-600 px-8 py-6 text-2xl font-bold text-white shadow-2xl hover:bg-red-700 ${
        alertSent ? "animate-pulse" : ""
      }`}
      aria-label="Emergency SOS Button"
    >
      <AlertCircle size={36} />
      SOS
    </button>
  );
}
