from flask import Flask, request, jsonify
from flask_cors import CORS
from extensions import socketio, db
from routes.LoginRoute import login_route
from routes.ChatRoute import chat_route
from config import DB_CONFIG
from werkzeug.security import generate_password_hash
from flask.blueprints import Blueprint

# Blueprint para a rota de cadastro
signup_route = Blueprint("signup_route", __name__)

# Modelo de usuário para o banco de dados
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

@signup_route.route("/SignupForm", methods=["POST"])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Nenhum dado enviado"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "Todos os campos são obrigatórios"}), 400

    # Verifica se o e-mail já existe
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "E-mail já cadastrado"}), 400

    # Criptografa a senha
    hashed_password = generate_password_hash(password)

    # Cria o novo usuário
    new_user = User(name=name, email=email, password=hashed_password)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Usuário cadastrado com sucesso"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao cadastrar usuário: {str(e)}"}), 500

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configuração do banco de dados
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@"
        f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Inicialização das extensões
    db.init_app(app)
    socketio.init_app(app)

    # Registro das rotas
    app.register_blueprint(login_route, url_prefix="/login")
    app.register_blueprint(chat_route, url_prefix="/chat")
    app.register_blueprint(signup_route, url_prefix="/signup")  # Nova rota de cadastro

    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()  # Garante que as tabelas sejam criadas
    socketio.run(app, debug=True)
