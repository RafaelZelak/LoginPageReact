from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

# Instância do Socket.IO
socketio = SocketIO(cors_allowed_origins="*")

# Instância do SQLAlchemy
db = SQLAlchemy()
