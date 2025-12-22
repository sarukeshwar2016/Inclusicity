import { voiceSocket, joinVoiceRoom } from "../services/api";

// expose to browser console
window.voiceSocket = voiceSocket;
window.joinVoiceRoom = joinVoiceRoom;

// socket debug logs
voiceSocket.on("connect", () => {
  console.log("✅ Socket connected:", voiceSocket.id);
});

voiceSocket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

voiceSocket.on("user_joined", (data) => {
  console.log("👤 USER JOINED:", data);
});

voiceSocket.on("offer", () => {
  console.log("📡 OFFER received");
});

voiceSocket.on("answer", () => {
  console.log("📨 ANSWER received");
});

voiceSocket.on("ice_candidate", () => {
  console.log("❄ ICE candidate received");
});
