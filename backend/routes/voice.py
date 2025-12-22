from flask import request
from flask_socketio import SocketIO, join_room, leave_room, emit
from routes.auth import decode_jwt

socketio = SocketIO(cors_allowed_origins="*")

ALLOWED_ROOMS = ["movies", "music", "sports", "general"]

# ============================
# IN-MEMORY ROOM STATE
# ============================
room_users = {}        # room -> { sid: {role} }
muted_users = set()    # sids muted by admin

# ============================
# JOIN ROOM (PRESENCE)
# ============================
@socketio.on("join_room")
def join_voice(data):
    token = data.get("token")
    room = data.get("room")

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

    # init room
    room_users.setdefault(room, {})
    room_users[room][request.sid] = {
        "role": user.get("role")
    }

    # notify others
    emit(
        "user_joined",
        {
            "sid": request.sid,
            "role": user.get("role")
        },
        room=room,
        include_self=False
    )

    # send updated presence list
    emit(
        "room_users",
        {
            "users": [
                {"sid": sid, "role": info["role"]}
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

    if room in room_users and request.sid in room_users[room]:
        del room_users[room][request.sid]

        emit(
            "user_left",
            {"sid": request.sid},
            room=room
        )

        emit(
            "room_users",
            {
                "users": [
                    {"sid": sid, "role": info["role"]}
                    for sid, info in room_users[room].items()
                ]
            },
            room=room
        )

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

    emit(
        "force_mute",
        {"sid": target_sid},
        to=target_sid
    )

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
