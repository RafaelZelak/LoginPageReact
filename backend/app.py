from flask import Flask
from flask_cors import CORS
from routes.LoginRoute import login_route

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(login_route, url_prefix="/login")
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
