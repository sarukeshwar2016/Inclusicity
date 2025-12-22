import { joinVoiceRoom, leaveVoiceRoom, voiceSocket } from "../services/api";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Mic, MicOff, LogOut, Radio } from "lucide-react";

const rooms = ["movies", "music", "sports", "general"];

export default function UserVoiceRooms() {
  const currentRoom = useRef(null); // ✅ legal
  const localStream = useRef(null);
  const peers = useRef({});
  const speakingInterval = useRef(null);

  const { role } = useAuth();

  // ============================
  // STATE (NEW)
  // ============================
  const [roomUsers, setRoomUsers] = useState([]);
  const [speakingUsers, setSpeakingUsers] = useState({}); // sid -> boolean

  // ============================
  // START VOICE
  // ============================
  const startVoice = async (room) => {
    if (!localStream.current) {
      if (role === "user") {
        localStream.current = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        startSpeakingDetection(room);
      } else {
        // admin listen-only
        localStream.current = new MediaStream();
      }
    }
    currentRoom.current = room;
    joinVoiceRoom(room);
  };

  // ============================
  // STEP 1: MUTE / UNMUTE
  // ============================
  const muteMic = () => {
    if (!localStream.current || role !== "user") return;
    localStream.current.getAudioTracks().forEach(t => (t.enabled = false));
  };

  const unmuteMic = () => {
    if (!localStream.current || role !== "user") return;
    localStream.current.getAudioTracks().forEach(t => (t.enabled = true));
  };

  // ============================
  // STEP 2: LEAVE ROOM
  // ============================
  const leaveRoom = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(t => t.stop());
      localStream.current = null;
    }

    Object.values(peers.current).forEach(pc => pc.close());
    peers.current = {};

    if (speakingInterval.current) {
      clearInterval(speakingInterval.current);
    }
    currentRoom.current = null;
    leaveVoiceRoom();
  };

  // ============================
  // SPEAKING DETECTION (NEW)
  // ============================
  const startSpeakingDetection = (room) => {
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const micSource = audioCtx.createMediaStreamSource(localStream.current);

    micSource.connect(analyser);
    analyser.fftSize = 512;

    const data = new Uint8Array(analyser.frequencyBinCount);

    speakingInterval.current = setInterval(() => {
      analyser.getByteFrequencyData(data);
      const volume = data.reduce((a, b) => a + b, 0) / data.length;

      voiceSocket.emit("speaking", {
        room,
        isSpeaking: volume > 25,
      });
    }, 300);
  };

  // ============================
  // SAFE PEER CREATION
  // ============================
  const getOrCreatePeer = (id) => {
    if (peers.current[id]) return peers.current[id];
    if (!localStream.current) return null;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.current.getTracks().forEach(track =>
      pc.addTrack(track, localStream.current)
    );

    pc.ontrack = (e) => {
      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      document.body.appendChild(audio);
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        voiceSocket.emit("ice_candidate", {
          to: id,
          candidate: e.candidate,
        });
      }
    };

    peers.current[id] = pc;
    return pc;
  };

  // ============================
  // SOCKET EVENTS
  // ============================
  useEffect(() => {
    voiceSocket.on("room_users", ({ users }) => {
      setRoomUsers(users);
    });

    voiceSocket.on("user_left", ({ sid }) => {
      setRoomUsers(prev => prev.filter(u => u.sid !== sid));
    });

    voiceSocket.on("speaking", ({ sid, isSpeaking }) => {
      setSpeakingUsers(prev => ({ ...prev, [sid]: isSpeaking }));
    });

    voiceSocket.on("force_mute", ({ sid }) => {
      if (sid === voiceSocket.id && localStream.current) {
        localStream.current.getAudioTracks().forEach(t => (t.enabled = false));
        alert("You were muted by admin");
      }
    });

    voiceSocket.on("user_joined", async ({ sid }) => {
      const pc = getOrCreatePeer(sid);
      if (!pc) return;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      voiceSocket.emit("offer", { to: sid, offer });
    });

    voiceSocket.on("offer", async ({ from, offer }) => {
      const pc = getOrCreatePeer(from);
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      voiceSocket.emit("answer", { to: from, answer });
    });

    voiceSocket.on("answer", async ({ from, answer }) => {
      const pc = getOrCreatePeer(from);
      if (!pc) return;

      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    voiceSocket.on("ice_candidate", async ({ from, candidate }) => {
      const pc = getOrCreatePeer(from);
      if (!pc) return;

      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      return () => {
  voiceSocket.off("room_users");
  voiceSocket.off("user_left");
  voiceSocket.off("speaking");
  voiceSocket.off("force_mute");
  voiceSocket.off("user_joined");
  voiceSocket.off("offer");
  voiceSocket.off("answer");
  voiceSocket.off("ice_candidate");
};

    };
  }, []);

  // ============================
  // ADMIN MUTE ACTION
  // ============================
  const adminMuteUser = (sid) => {
    voiceSocket.emit("force_mute", { sid });
  };

  // ============================
  // UI
  // ============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">Voice Rooms</h1>
          </div>
          <p className="text-slate-600">Select a room to join the conversation</p>
        </div>

        {/* Room Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {rooms.map((r) => (
            <button
              key={r}
              onClick={() => startVoice(r)}
              className="bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-400 rounded-xl p-6 transition-all duration-200 shadow-sm hover:shadow-md group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                  <Radio className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-lg font-semibold text-slate-800 capitalize">
                  {r}
                </span>
                <span className="text-sm text-slate-500">Join room</span>
              </div>
            </button>
          ))}
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Active Users
            {roomUsers.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({roomUsers.length})
              </span>
            )}
          </h2>

          {roomUsers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Radio className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No users in room yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roomUsers.map((u) => (
                <div
                  key={u.sid}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                    speakingUsers[u.sid]
                      ? "border-green-400 bg-green-50 shadow-md"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {/* Speaking Indicator */}
                  {speakingUsers[u.sid] && (
                    <div className="absolute -top-1 -right-1">
                      <div className="relative">
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-slate-700 font-semibold">
                      {u.sid.slice(0, 8)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  {/* Speaking Status */}
                  <div className="flex items-center gap-2 mb-3">
                    {speakingUsers[u.sid] ? (
                      <>
                        <Mic className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">
                          Speaking
                        </span>
                      </>
                    ) : (
                      <>
                        <MicOff className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">Quiet</span>
                      </>
                    )}
                  </div>

                  {/* Admin Controls */}
                  {role === "admin" && u.role === "user" && (
                    <button
                      onClick={() => adminMuteUser(u.sid)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <MicOff className="w-4 h-4" />
                      Force Mute
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Controls</h2>
          <div className="flex flex-wrap gap-3">
            {role === "user" && (
              <>
                <button
                  onClick={muteMic}
                  className="flex-1 sm:flex-none bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  <MicOff className="w-5 h-5" />
                  Mute
                </button>
                <button
                  onClick={unmuteMic}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Mic className="w-5 h-5" />
                  Unmute
                </button>
              </>
            )}
            <button
              onClick={leaveRoom}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
