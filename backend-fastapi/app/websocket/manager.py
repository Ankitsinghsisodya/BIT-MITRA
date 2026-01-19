"""
WebSocket connection manager for real-time features.
Follows FastAPI WebSocket documentation patterns.
"""
import json
from fastapi import WebSocket, WebSocketDisconnect


class ConnectionManager:
    """
    Manages WebSocket connections as per FastAPI documentation.
    
    Reference: https://fastapi.tiangolo.com/advanced/websockets/
    """
    
    def __init__(self):
        # Map user_id -> WebSocket connection
        self.active_connections: dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept and register a WebSocket connection."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        await self.broadcast_online_users()
    
    def disconnect(self, user_id: str):
        """Remove a WebSocket connection."""
        self.active_connections.pop(user_id, None)
    
    async def broadcast_online_users(self):
        """Broadcast list of online users to all connected clients."""
        online_users = list(self.active_connections.keys())
        await self.broadcast({"event": "online_users", "data": online_users})
    
    async def broadcast(self, message: dict):
        """Send a message to all connected clients."""
        for connection in self.active_connections.values():
            try:
                await connection.send_json(message)
            except Exception:
                pass
    
    async def send_personal_message(self, user_id: str, message: dict):
        """Send a message to a specific user."""
        if websocket := self.active_connections.get(user_id):
            try:
                await websocket.send_json(message)
            except Exception:
                pass
    
    async def send_message(self, user_id: str, message: dict):
        """Send a new chat message notification."""
        await self.send_personal_message(user_id, {"event": "new_message", "data": message})
    
    async def send_notification(self, user_id: str, notification: dict):
        """Send a notification to a user."""
        await self.send_personal_message(user_id, {"event": "notification", "data": notification})


# Singleton instance
manager = ConnectionManager()
