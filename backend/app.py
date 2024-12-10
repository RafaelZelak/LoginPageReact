from flask import Flask
from flask_cors import CORS
from extensions import socketio, db
from routes.LoginRoute import login_route
from routes.ChatRoute import chat_route
from config import DB_CONFIG

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configuração do banco de dados
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
        f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicialização das extensões
    db.init_app(app)
    socketio.init_app(app)

    # Registro das rotas
    app.register_blueprint(login_route, url_prefix="/login")
    app.register_blueprint(chat_route, url_prefix="/chat")

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()  # Garante que as tabelas sejam criadas
    socketio.run(app, debug=True)
