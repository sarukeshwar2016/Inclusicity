import { joinVoiceRoom, leaveVoiceRoom, voiceSocket } from "../services/api";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Mic, MicOff, LogOut, Radio, Users, Volume2, UserPlus, UserMinus, Headphones } from "lucide-react";
import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";
import { motion } from 'framer-motion';

const rooms = ["movies", "music", "sports", "general"];

const roomDescriptions = {
  movies: "Discuss latest films, classics & reviews",
  music: "Share songs, artists, playlists & vibes",
  sports: "Live commentary, debates & match talk",
  general: "Casual chat, hangout & everything else",
};

const roomGradients = {
  movies: "from-red-400 to-orange-500",
  music: "from-purple-400 to-pink-500",
  sports: "from-green-400 to-emerald-500",
  general: "from-blue-400 to-indigo-500",
};

export default function UserVoiceRooms() {
  const { user, role } = useAuth();

  const currentRoom = useRef(null);
  const localStream = useRef(null);
  const peers = useRef({});
  const speakingInterval = useRef(null);
  const remoteAudios = useRef({});
  const audioCtxRef = useRef(null);

  const [roomUsers, setRoomUsers] = useState([]);
  const [speakingUsers, setSpeakingUsers] = useState({});
  const [activeRoom, setActiveRoom] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [roomCounts, setRoomCounts] = useState({
    movies: 0,
    music: 0,
    sports: 0,
    general: 0,
  });

  const currentUserSid = voiceSocket.id;
  const isCurrentUserSpeaking = currentUserSid ? speakingUsers[currentUserSid] : false;

  // ============================
  // TOAST NOTIFICATION
  // ============================
  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // ============================
  // JOIN ROOM
  // ============================
  const startVoice = async (room) => {
    if (!user) return;
    if (currentRoom.current === room) return;
    if (currentRoom.current) leaveRoom();

    if (!localStream.current && role === "user") {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.current.getAudioTracks().forEach((t) => (t.enabled = true));
        setIsMuted(false);
        startSpeakingDetection(room);
      } catch (err) {
        console.error("Mic access denied:", err);
        alert("Microphone access is required to join voice rooms.");
        return;
      }
    }

    currentRoom.current = room;
    setActiveRoom(room);

    const displayName =
      user.name || user.username || user.email?.split("@")[0] || "Guest";

    joinVoiceRoom(room, displayName, role);
    addNotification(`Joined ${room.charAt(0).toUpperCase() + room.slice(1)} room`, "success");
  };

  // ============================
  // TOGGLE MUTE
  // ============================
  const toggleMute = () => {
    if (!localStream.current || role !== "user") return;
    const enabled = isMuted;
    localStream.current.getAudioTracks().forEach((t) => (t.enabled = enabled));
    setIsMuted(!enabled);
    addNotification(enabled ? "Microphone unmuted" : "Microphone muted", "info");
  };

  // ============================
  // LEAVE ROOM
  // ============================
  const leaveRoom = () => {
    if (!currentRoom.current) return;

    const roomToLeave = currentRoom.current;
    addNotification(`Left ${roomToLeave.charAt(0).toUpperCase() + roomToLeave.slice(1)} room`, "info");

    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => t.stop());
      localStream.current = null;
    }

    Object.values(peers.current).forEach((pc) => pc.close());
    peers.current = {};

    Object.values(remoteAudios.current).forEach((audio) => {
      audio.srcObject = null;
      audio.remove();
    });
    remoteAudios.current = {};

    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    if (speakingInterval.current) {
      clearInterval(speakingInterval.current);
      speakingInterval.current = null;
    }

    currentRoom.current = null;
    setActiveRoom(null);
    setRoomUsers([]);
    setIsMuted(true);

    // Reset count for left room
    setRoomCounts((prev) => ({ ...prev, [roomToLeave]: 0 }));

    leaveVoiceRoom({ room: roomToLeave });
  };

  // ============================
  // SPEAKING DETECTION
  // ============================
  const startSpeakingDetection = (room) => {
    if (audioCtxRef.current) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    const analyser = audioCtx.createAnalyser();
    const micSource = audioCtx.createMediaStreamSource(localStream.current);

    micSource.connect(analyser);
    analyser.fftSize = 512;
    const data = new Uint8Array(analyser.frequencyBinCount);

    speakingInterval.current = setInterval(() => {
      if (!audioCtxRef.current) return;
      analyser.getByteFrequencyData(data);
      const volume = data.reduce((a, b) => a + b, 0) / data.length;

      voiceSocket.emit("speaking", {
        room,
        isSpeaking: volume > 25,
      });
    }, 300);
  };

  // ============================
  // PEER CONNECTION
  // ============================
  const getOrCreatePeer = (id) => {
    if (peers.current[id]) return peers.current[id];
    if (!localStream.current) return null;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.current.getTracks().forEach((track) =>
      pc.addTrack(track, localStream.current)
    );

    pc.ontrack = (e) => {
      if (remoteAudios.current[id]) remoteAudios.current[id].remove();
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      remoteAudios.current[id] = audio;
      document.body.appendChild(audio);
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        voiceSocket.emit("ice_candidate", { to: id, candidate: e.candidate });
      }
    };

    peers.current[id] = pc;
    return pc;
  };

  // ============================
  // SOCKET LISTENERS
  // ============================
  useEffect(() => {
    const handleRoomUsers = ({ users }) => {
      const previousUsers = roomUsers;
      setRoomUsers(users);

      // Update count for the current active room
      if (activeRoom) {
        setRoomCounts((prev) => ({
          ...prev,
          [activeRoom]: users.length,
        }));
      }

      // Join notification for others
      if (activeRoom && users.length > previousUsers.length) {
        const newUser = users.find((u) => !previousUsers.some((old) => old.sid === u.sid));
        if (newUser && newUser.sid !== currentUserSid) {
          addNotification(`${newUser.name} joined`, "join");
        }
      }
    };

    const handleUserLeft = ({ sid }) => {
      const leftUser = roomUsers.find((u) => u.sid === sid);
      if (leftUser && sid !== currentUserSid) {
        addNotification(`${leftUser.name} left`, "leave");
      }

      setRoomUsers((prev) => prev.filter((u) => u.sid !== sid));

      if (activeRoom) {
        setRoomCounts((prev) => ({
          ...prev,
          [activeRoom]: Math.max(0, (prev[activeRoom] || 0) - 1),
        }));
      }

      if (peers.current[sid]) {
        peers.current[sid].close();
        delete peers.current[sid];
      }
      if (remoteAudios.current[sid]) {
        remoteAudios.current[sid].remove();
        delete remoteAudios.current[sid];
      }
    };

    voiceSocket.on("room_users", handleRoomUsers);
    voiceSocket.on("user_left", handleUserLeft);
    voiceSocket.on("speaking", ({ sid, isSpeaking }) => {
      setSpeakingUsers((prev) => ({ ...prev, [sid]: isSpeaking }));
    });
    voiceSocket.on("force_mute", ({ sid }) => {
      if (sid === voiceSocket.id && localStream.current) {
        localStream.current.getAudioTracks().forEach((t) => (t.enabled = false));
        setIsMuted(true);
        addNotification("You were muted by an admin", "warning");
      }
    });
    voiceSocket.on("user_joined", async ({ sid }) => {
      if (peers.current[sid]) return;
      const pc = getOrCreatePeer(sid);
      if (!pc || pc.signalingState !== "stable") return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      voiceSocket.emit("offer", { to: sid, offer });
    });
    voiceSocket.on("offer", async ({ from, offer }) => {
      const pc = getOrCreatePeer(from);
      if (!pc || pc.signalingState !== "stable") return;
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      voiceSocket.emit("answer", { to: from, answer });
    });
    voiceSocket.on("answer", async ({ from, answer }) => {
      const pc = peers.current[from];
      if (!pc || pc.signalingState !== "have-local-offer") return;
      await pc.setRemoteDescription(answer);
    });
    voiceSocket.on("ice_candidate", async ({ from, candidate }) => {
      const pc = peers.current[from];
      if (!pc) return;
      await pc.addIceCandidate(candidate);
    });

    return () => {
      if (currentRoom.current) {
        leaveRoom();
      }
      voiceSocket.off("room_users", handleRoomUsers);
      voiceSocket.off("user_left", handleUserLeft);
      voiceSocket.off("speaking");
      voiceSocket.off("force_mute");
      voiceSocket.off("user_joined");
      voiceSocket.off("offer");
      voiceSocket.off("answer");
      voiceSocket.off("ice_candidate");
    };
  }, []);

  const adminMuteUser = (sid) => {
    voiceSocket.emit("force_mute", { sid });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 relative">
      <Navbar />
      <div className="flex pt-16">
        <SideBar />
        
        {/* Main content with dynamic margin to avoid sidebar overlap */}
        <motion.div
          className="flex-1"
          animate={{ marginLeft: '240px' }}  // Matches open sidebar width
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <div className="px-6 py-12 max-w-7xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur px-8 py-4 rounded-full mb-8 shadow-xl">
                <Radio className="text-purple-600 animate-pulse" size={36} />
                <span className="text-2xl font-bold text-purple-900">Live Voice Chat</span>
              </div>
              <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                Join a Voice Room
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Hang out and talk in real-time. Discuss movies, share music, debate sports, or just chill.
              </p>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {rooms.map((r) => {
                const count = roomCounts[r] || 0;
                const isActive = activeRoom === r;

                return (
                  <button
                    key={r}
                    onClick={() => startVoice(r)}
                    disabled={isActive}
                    className={`group relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                      isActive ? "ring-4 ring-purple-500" : ""
                    }`}
                  >
                    <div className={`h-full bg-gradient-to-br ${roomGradients[r]} p-8 text-white flex flex-col justify-between`}>
                      <div>
                        <Headphones className="mx-auto mb-6" size={60} />
                        <h3 className="text-2xl font-bold capitalize mb-4">{r}</h3>
                        <p className="text-base opacity-90 leading-relaxed">
                          {roomDescriptions[r]}
                        </p>
                      </div>

                      <div className="mt-8">
                        <div className="bg-white/20 backdrop-blur px-5 py-3 rounded-full mb-4">
                          <span className="font-bold text-xl">{count}</span>
                          <span className="ml-2">live</span>
                        </div>

                        {count > 0 && (
                          <div className="absolute top-4 right-4">
                            <span className="relative flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                            </span>
                          </div>
                        )}

                        {isActive ? (
                          <div className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold">
                            You're Here 🎉
                          </div>
                        ) : (
                          <div className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold opacity-0 group-hover:opacity-100 transition">
                            Join Room →
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tip */}
            <div className="text-center">
              <p className="text-gray-600 bg-white/70 backdrop-blur px-6 py-3 rounded-full inline-block shadow">
                💡 Click a room to join instantly!
              </p>
            </div>

            {/* Active Room */}
            {activeRoom && (
              <div className="mt-20 bg-white rounded-3xl shadow-2xl p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <span className="bg-green-100 text-green-800 px-5 py-2 rounded-full font-bold flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      LIVE
                    </span>
                    <div>
                      <h3 className="text-3xl font-bold">
                        {activeRoom.charAt(0).toUpperCase() + activeRoom.slice(1)} Room
                      </h3>
                      <p className="text-gray-600 mt-1">{roomDescriptions[activeRoom]}</p>
                    </div>
                  </div>
                  <span className="text-xl font-semibold text-gray-700">
                    {roomUsers.length} participants
                  </span>
                </div>

                {roomUsers.length === 0 ? (
                  <div className="text-center py-16">
                    <Radio className="mx-auto text-gray-300 mb-6" size={80} />
                    <p className="text-2xl text-gray-600 font-medium">You're the first one here!</p>
                    <p className="text-gray-500 mt-3">Wait for others to join</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roomUsers.map((u) => (
                      <div
                        key={u.sid}
                        className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                          speakingUsers[u.sid]
                            ? "border-green-400 bg-green-50 shadow-xl"
                            : "border-gray-200 bg-gray-50"
                        } ${u.sid === currentUserSid ? "ring-4 ring-blue-300" : ""}`}
                      >
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl">
                            {(u.name || "??").trim().split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                          </div>
                          {speakingUsers[u.sid] && (
                            <>
                              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>
                              <span className="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-50"></span>
                            </>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {u.name || "Anonymous"}
                            {u.sid === currentUserSid && <span className="text-blue-600 text-sm ml-2">(You)</span>}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{u.sid.slice(0, 8)}</p>
                        </div>

                        {role === "admin" && u.role === "user" && u.sid !== currentUserSid && (
                          <button
                            onClick={() => adminMuteUser(u.sid)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Mute
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Controls */}
      {activeRoom && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t px-6 py-5 shadow-2xl">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              {role === "user" && (
                <>
                  <button
                    onClick={toggleMute}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition ${
                      isMuted
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    {isMuted ? "Muted" : "Speaking"}
                  </button>

                  {!isMuted && (
                    <div className="flex items-end gap-1 h-8">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`w-1 bg-green-500 rounded-full transition-all duration-300 ${
                            isCurrentUserSpeaking ? "h-8" : "h-3"
                          }`}
                          style={{
                            animation: isCurrentUserSpeaking ? "wave 1.2s ease-in-out infinite" : "none",
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className={`flex items-center gap-2 ${isCurrentUserSpeaking ? "text-green-600" : "text-gray-500"}`}>
                    <div className={`w-3 h-3 rounded-full ${isCurrentUserSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                    <span className="font-medium">
                      {isCurrentUserSpeaking ? "You are speaking" : "Quiet"}
                    </span>
                  </div>
                </>
              )}
              <div className="text-gray-600">
                <span className="font-medium">Room:</span> {activeRoom}
              </div>
            </div>

            <button
              onClick={leaveRoom}
              className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition"
            >
              <LogOut size={20} />
              Leave Room
            </button>
          </div>
        </div>
      )}

      {activeRoom && <div className="pb-28" />}

      {/* Toasts */}
      <div className="fixed top-20 right-6 space-y-3 z-50">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white font-medium animate-slide-in-right ${
              notif.type === "join" ? "bg-green-600" :
              notif.type === "leave" ? "bg-orange-600" :
              notif.type === "success" ? "bg-blue-600" :
              notif.type === "warning" ? "bg-red-600" :
              "bg-gray-800"
            }`}
          >
            {notif.type === "join" && <UserPlus size={20} />}
            {notif.type === "leave" && <UserMinus size={20} />}
            <span>{notif.message}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { height: 0.75rem; }
          50% { height: 2rem; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.4s ease-out; }
      `}</style>
    </div>
  );
}