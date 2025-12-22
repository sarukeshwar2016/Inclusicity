import { joinVoiceRoom, voiceSocket } from "../services/api";
import { useRef } from "react";

const rooms = ["movies", "music", "sports", "general"];

export default function UserVoiceRooms() {
  const localStream = useRef(null);
  const peers = useRef({}); // socketId -> RTCPeerConnection

  // ============================
  // START VOICE
  // ============================
  const startVoice = async (room) => {
    // get mic first (important)
    if (!localStream.current) {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    }

    joinVoiceRoom(room);
  };

  // ============================
  // SAFE PEER CREATION
  // ============================
  const getOrCreatePeer = (id) => {
    if (peers.current[id]) {
      return peers.current[id];
    }

    if (!localStream.current) {
      console.error("Local stream not ready");
      return null;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // add local tracks
    localStream.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.current);
    });

    // receive remote audio
    pc.ontrack = (e) => {
      console.log("Remote audio track received");

      const audio = document.createElement("audio");
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      audio.controls = true; // helps debug autoplay issues
      document.body.appendChild(audio);
    };

    // send ICE candidates
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

  // someone joined → create offer
  voiceSocket.off("user_joined").on("user_joined", async ({ sid }) => {
    const pc = getOrCreatePeer(sid);
    if (!pc) return;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    voiceSocket.emit("offer", {
      to: sid,
      offer,
    });
  });

  // receive offer → answer
  voiceSocket.off("offer").on("offer", async ({ from, offer }) => {
    const pc = getOrCreatePeer(from);
    if (!pc) return;

    await pc.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    voiceSocket.emit("answer", {
      to: from,
      answer,
    });
  });

  // receive answer
  voiceSocket.off("answer").on("answer", async ({ from, answer }) => {
    const pc = getOrCreatePeer(from);
    if (!pc) return;

    await pc.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  });

  // receive ICE
  voiceSocket.off("ice_candidate").on("ice_candidate", async ({ from, candidate }) => {
    const pc = getOrCreatePeer(from);
    if (!pc) return;

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn("ICE add error (safe to ignore sometimes):", err);
    }
  });

  // ============================
  // UI
  // ============================
  return (
    <div>
      <h2>Voice Rooms</h2>

      {rooms.map((r) => (
        <button key={r} onClick={() => startVoice(r)}>
          Join {r}
        </button>
      ))}
    </div>
  );
}
