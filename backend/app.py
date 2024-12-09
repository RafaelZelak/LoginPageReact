from flask import Flask
from flask_cors import CORS
from extensions import socketio
from routes.LoginRoute import login_route
from routes.ChatRoute import chat_route  # Certifique-se de que o nome está correto

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(login_route, url_prefix="/login")
    app.register_blueprint(chat_route, url_prefix="/chat")
    socketio.init_app(app)
    return app

if __name__ == '__main__':
    app = create_app()
    socketio.run(app, debug=True)
