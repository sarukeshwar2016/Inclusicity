from flask import request
from flask_socketio import SocketIO, join_room, leave_room, emit
from routes.auth import decode_jwt

socketio = SocketIO(cors_allowed_origins="*", async_mode="eventlet")

ALLOWED_ROOMS = ["movies", "music", "sports", "general"]

# room -> {sid: {"name": str, "role": str}}
room_users = {}

@socketio.on("join_room")
def handle_join(data):
    token = data.get("token")
    room = data.get("room")

    if not token or room not in ALLOWED_ROOMS:
        emit("error", {"msg": "Invalid request"})
        return

    try:
        payload = decode_jwt(token)
        name = payload.get("name") or payload.get("username") or payload.get("email", "Guest").split("@")[0]
        role = payload.get("role", "user")
    except Exception as e:
        print("JWT decode error:", e)
        emit("error", {"msg": "Invalid token"})
        return

    sid = request.sid
    join_room(room)

    if room not in room_users:
        room_users[room] = {}

    was_first = len(room_users[room]) == 0
    room_users[room][sid] = {"name": name, "role": role}

    user_list = [
        {"sid": s, "name": info["name"], "role": info["role"]}
        for s, info in room_users[room].items()
    ]
    emit("room_users", {"users": user_list}, room=room)

    if not was_first:
        emit("user_joined", {"sid": sid}, room=room, include_self=False)

    for existing_sid in room_users[room]:
        if existing_sid != sid:
            emit("user_joined", {"sid": existing_sid}, to=sid)

    print(f"User {name} ({sid}) joined {room}. Total: {len(user_list)}")

@socketio.on("leave_room")
def handle_leave(data):
    room = data.get("room")
    sid = request.sid

    if room in room_users and sid in room_users[room]:
        name = room_users[room][sid]["name"]
        del room_users[room][sid]

        emit("user_left", {"sid": sid}, room=room)

        user_list = [
            {"sid": s, "name": info["name"], "role": info["role"]}
            for s, info in room_users[room].items()
        ]
        emit("room_users", {"users": user_list}, room=room)

        if not room_users[room]:
            del room_users[room]

        print(f"User {name} ({sid}) left {room}. Remaining: {len(user_list)}")

    leave_room(room)

@socketio.on("speaking")
def handle_speaking(data):
    room = data.get("room")
    is_speaking = data.get("isSpeaking", False)
    emit("speaking", {"sid": request.sid, "isSpeaking": is_speaking}, room=room, include_self=False)

@socketio.on("offer")
def handle_offer(data):
    to = data.get("to")
    if to:
        emit("offer", {"from": request.sid, "offer": data["offer"]}, to=to)

@socketio.on("answer")
def handle_answer(data):
    to = data.get("to")
    if to:
        emit("answer", {"from": request.sid, "answer": data["answer"]}, to=to)

@socketio.on("ice_candidate")
def handle_ice(data):
    to = data.get("to")
    if to:
        emit("ice_candidate", {"from": request.sid, "candidate": data["candidate"]}, to=to)

@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    for room in list(room_users.keys()):
        if sid in room_users[room]:
            name = room_users[room][sid]["name"]
            del room_users[room][sid]

            emit("user_left", {"sid": sid}, room=room)

            user_list = [
                {"sid": s, "name": info["name"], "role": info["role"]}
                for s, info in room_users[room].items()
            ]
            emit("room_users", {"users": user_list}, room=room)

            if not room_users[room]:
                del room_users[room]

            print(f"Disconnect: {name} ({sid}) from {room}")

@socketio.on("sos_alert")
def handle_sos_alert(data):
    username = data.get("username", "Unknown User")
    role = data.get("role", "unknown")
    message = data.get("message")
    timestamp = data.get("timestamp")

    print("\n" + "=" * 80)
    print("🚨🚨🚨 EMERGENCY SOS ALERT 🚨🚨🚨")
    print(f"   User: {username}")
    print(f"   Role: {role}")
    print(f"   Message: {message}")
    print(f"   Time: {timestamp}")
    print("=" * 80 + "\n")
