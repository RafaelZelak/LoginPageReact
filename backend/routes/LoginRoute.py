from flask import Blueprint, request, jsonify
from services.LoginService import authenticate_user

login_route = Blueprint('login', __name__)

@login_route.route('', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    result = authenticate_user(email, password)

    if result.get("success"):
        return jsonify(result), 200
    else:
        return jsonify(result), 401
