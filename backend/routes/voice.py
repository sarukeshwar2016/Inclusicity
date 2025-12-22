from flask import request
from flask_socketio import SocketIO, join_room, leave_room, emit
from routes.auth import decode_jwt

socketio = SocketIO(cors_allowed_origins="*")

ALLOWED_ROOMS = ["movies", "music", "sports", "general"]

# ============================
# JOIN ROOM
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

    if user.get("role") != "user":
        emit("error", {"msg": "Only users allowed"})
        return

    join_room(room)

    emit(
        "user_joined",
        {"sid": request.sid},
        room=room,
        include_self=False
    )

# ============================
# LEAVE ROOM
# ============================
@socketio.on("leave_room")
def leave_voice(data):
    leave_room(data.get("room"))

# ============================
# WEBRTC SIGNALING
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
