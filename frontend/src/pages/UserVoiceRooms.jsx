import { joinVoiceRoom, leaveVoiceRoom, voiceSocket } from "../services/api";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Mic, MicOff, LogOut, Radio } from "lucide-react";

const rooms = ["movies", "music", "sports", "general"];

export default function UserVoiceRooms() {
  const currentRoom = useRef(null);
  const localStream = useRef(null);
  const peers = useRef({});
  const speakingInterval = useRef(null);
  
  const remoteAudios = useRef({});
  const audioCtxRef = useRef(null);

  const { role } = useAuth();

  const [roomUsers, setRoomUsers] = useState([]);
  const [speakingUsers, setSpeakingUsers] = useState({});
  const [activeRoom, setActiveRoom] = useState(null);

  const startVoice = async (room) => {
    if (currentRoom.current === room) return;

    if (currentRoom.current) {
      leaveRoom();
    }

    if (!localStream.current) {
      if (role === "user") {
        try {
          localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
          startSpeakingDetection(room);
        } catch (err) {
          console.error("Mic access denied:", err);
          return;
        }
      } else {
        localStream.current = new MediaStream();
      }
    }

    currentRoom.current = room;
    setActiveRoom(room);
    joinVoiceRoom(room);
  };

  const muteMic = () => {
    if (!localStream.current || role !== "user") return;
    localStream.current.getAudioTracks().forEach(t => (t.enabled = false));
  };

  const unmuteMic = () => {
    if (!localStream.current || role !== "user") return;
    localStream.current.getAudioTracks().forEach(t => (t.enabled = true));
  };

  const leaveRoom = () => {
    if (!currentRoom.current) return;

    // Save room name before clearing ref
    const roomToLeave = currentRoom.current;

    if (localStream.current) {
      localStream.current.getTracks().forEach(t => t.stop());
      localStream.current = null;
    }

    Object.values(peers.current).forEach(pc => pc.close());
    peers.current = {};

    Object.values(remoteAudios.current).forEach(audio => {
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
    
    // FIX: Pass the room name so backend cleanup works instantly
    leaveVoiceRoom({ room: roomToLeave }); 
  };

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
      if (remoteAudios.current[id]) {
        remoteAudios.current[id].remove();
      }

      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      audio.dataset.peer = id;

      remoteAudios.current[id] = audio;
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

  useEffect(() => {
    voiceSocket.on("room_users", ({ users }) => {
      setRoomUsers(users);
    });

    voiceSocket.on("user_left", ({ sid }) => {
      setRoomUsers(prev => prev.filter(u => u.sid !== sid));
      
      if (peers.current[sid]) {
        peers.current[sid].close();
        delete peers.current[sid];
      }

      if (remoteAudios.current[sid]) {
        remoteAudios.current[sid].srcObject = null;
        remoteAudios.current[sid].remove();
        delete remoteAudios.current[sid];
      }
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
      if (peers.current[sid]) return;

      const pc = getOrCreatePeer(sid);
      if (!pc || pc.signalingState !== "stable") return;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      voiceSocket.emit("offer", { to: sid, offer });
    });

    voiceSocket.on("offer", async ({ from, offer }) => {
      const pc = getOrCreatePeer(from);
      if (!pc) return;
      if (pc.signalingState !== "stable") return;
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
      leaveRoom();
      voiceSocket.off("room_users");
      voiceSocket.off("user_left");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flex justify-center items-center gap-2 text-slate-900">
            <Radio className="text-blue-600" /> Voice Rooms
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {rooms.map(r => (
            <button
              key={r}
              onClick={() => startVoice(r)}
              className={`p-6 border-2 rounded-xl transition ${
                activeRoom === r
                  ? "bg-blue-100 border-blue-500 shadow-inner"
                  : "bg-white hover:bg-blue-50 border-slate-200 shadow-sm"
              }`}
            >
              <Radio className={`mx-auto mb-2 ${activeRoom === r ? "text-blue-700" : "text-blue-600"}`} />
              <p className={`capitalize font-semibold ${activeRoom === r ? "text-blue-900" : "text-slate-700"}`}>{r}</p>
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="font-bold mb-4 text-slate-800">Active Users ({roomUsers.length})</h2>
          <div className="space-y-2">
            {roomUsers.map(u => (
              <div key={u.sid} className={`flex justify-between items-center p-3 rounded-lg border transition ${speakingUsers[u.sid] ? 'border-green-400 bg-green-50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${speakingUsers[u.sid] ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                  <span className="font-mono text-slate-700">{u.sid.slice(0, 8)}</span>
                </div>
                {role === "admin" && u.role === "user" && (
                  <button
                    onClick={() => adminMuteUser(u.sid)}
                    className="text-red-500 text-sm font-bold hover:text-red-700"
                  >
                    Mute User
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between border-t-4 border-blue-500">
          <div className="flex gap-4">
            {role === "user" && (
              <>
                <button onClick={muteMic} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold transition">
                  <MicOff size={18} /> Mute
                </button>
                <button onClick={unmuteMic} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md transition">
                  <Mic size={18} /> Unmute
                </button>
              </>
            )}
          </div>
          <button onClick={leaveRoom} className="flex items-center gap-2 px-5 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-lg transition">
            <LogOut size={18} /> Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}