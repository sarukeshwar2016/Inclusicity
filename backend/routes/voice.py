from flask import request
from flask_socketio import SocketIO, join_room, leave_room, emit
from routes.auth import decode_jwt

socketio = SocketIO(cors_allowed_origins="*")

ALLOWED_ROOMS = ["movies", "music", "sports", "general"]

# ============================
# IN-MEMORY ROOM STATE
# ============================
room_users = {}        # room -> { sid: {name, role} }
muted_users = set()    # sids muted by admin

# ============================
# JOIN ROOM (PRESENCE)
# ============================
@socketio.on("join_room")
def join_voice(data):
    token = data.get("token")
    room = data.get("room")
    display_name = data.get("name", "Guest")  # <-- Now accepting and using name

    if not token or room not in ALLOWED_ROOMS:
        emit("error", {"msg": "Invalid request"})
        return

    try:
        user = decode_jwt(token)
    except Exception:
        emit("error", {"msg": "Invalid token"})
        return

    if user.get("role") not in ["user", "admin"]:
        emit("error", {"msg": "Unauthorized role"})
        return

    join_room(room)

    # Initialize room if needed
    room_users.setdefault(room, {})

    # Store user with name and role
    room_users[room][request.sid] = {
        "name": display_name,
        "role": user.get("role")
    }

    # Notify others (for WebRTC peer setup)
    emit(
        "user_joined",
        {"sid": request.sid},
        room=room,
        include_self=False
    )

    # Send full updated user list WITH NAMES to everyone (including self)
    emit(
        "room_users",
        {
            "users": [
                {
                    "sid": sid,
                    "name": info["name"],
                    "role": info["role"]
                }
                for sid, info in room_users[room].items()
            ]
        },
        room=room
    )


# ============================
# LEAVE ROOM (PRESENCE)
# ============================
@socketio.on("leave_room")
def leave_voice(data):
    room = data.get("room")

    if room not in room_users or request.sid not in room_users[room]:
        return

    # Remove user
    del room_users[room][request.sid]

    # Notify others that user left
    emit("user_left", {"sid": request.sid}, room=room)

    # Send updated list
    remaining_users = room_users.get(room, {})
    emit(
        "room_users",
        {
            "users": [
                {
                    "sid": sid,
                    "name": info["name"],
                    "role": info["role"]
                }
                for sid, info in remaining_users.items()
            ]
        },
        room=room
    )

    # Clean up empty room
    if not remaining_users:
        del room_users[room]

    leave_room(room)


# ============================
# SPEAKING INDICATOR
# ============================
@socketio.on("speaking")
def speaking_event(data):
    room = data.get("room")
    is_speaking = data.get("isSpeaking", False)

    emit(
        "speaking",
        {
            "sid": request.sid,
            "isSpeaking": is_speaking
        },
        room=room,
        include_self=False
    )


# ============================
# ADMIN FORCE MUTE
# ============================
@socketio.on("force_mute")
def force_mute(data):
    target_sid = data.get("sid")
    if not target_sid:
        return

    muted_users.add(target_sid)
    emit("force_mute", {"sid": target_sid}, to=target_sid)


# ============================
# WEBRTC SIGNALING (UNCHANGED)
# ============================
@socketio.on("offer")
def handle_offer(data):
    emit("offer", {
        "from": request.sid,
        "offer": data["offer"]
    }, to=data["to"])


@socketio.on("answer")
def handle_answer(data):
    emit("answer", {
        "from": request.sid,
        "answer": data["answer"]
    }, to=data["to"])


@socketio.on("ice_candidate")
def handle_ice(data):
    emit("ice_candidate", {
        "from": request.sid,
        "candidate": data["candidate"]
    }, to=data["to"])