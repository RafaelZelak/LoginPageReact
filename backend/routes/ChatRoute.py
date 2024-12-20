from flask import Blueprint, request, jsonify
from flask_socketio import emit, join_room
from extensions import socketio, db
from sqlalchemy.sql import text
import logging

log = logging.getLogger('werkzeug')
log.setLevel(logging.WARNING)

chat_route = Blueprint('chat_route', __name__)

@chat_route.route('/room/<int:room_id>/messages', methods=['GET'])
def get_room_messages(room_id):
    try:
        query = text("""
            SELECT
                c.id,
                c.user_id,
                c.message,
                c.created_at,
                c.room_id,
                u.nome AS username
            FROM chat_messages c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.room_id = :room_id AND c.deleted = FALSE
            ORDER BY c.created_at ASC;
        """)
        result = db.session.execute(query, {'room_id': room_id}).mappings().all()
        messages = [
            {
                'id': row['id'],
                'user_id': row['user_id'],
                'message': row['message'],
                'created_at': row['created_at'],
                'room_id': row['room_id'],
                'username': row['username'],
            }
            for row in result
        ]
        return jsonify(messages), 200
    except Exception as e:
        return jsonify({'error': f"Erro ao carregar mensagens: {str(e)}"}), 500

@socketio.on('join_room')
def handle_join_room(data):
    room_id = data.get('room_id')
    if room_id:
        join_room(f"room_{room_id}")
        print(f"[SOCKET.IO] Usuário entrou na sala room_{room_id}.")

@socketio.on('send_message')
def handle_send_message(data):
    user_id = data.get('user_id')
    message = data.get('message', '').strip()
    room_id = data.get('room_id')

    if not user_id or not message or not room_id:
        emit('error', {'message': 'Dados inválidos'}, broadcast=False)
        print("[SOCKET.IO] Dados inválidos ao enviar mensagem.")
        return

    try:
        query = text("""
            INSERT INTO chat_messages (user_id, message, room_id, deleted)
            VALUES (:user_id, :message, :room_id, FALSE)
            RETURNING id, created_at;
        """)
        result = db.session.execute(query, {'user_id': user_id, 'message': message, 'room_id': room_id})
        db.session.commit()

        row = result.fetchone()
        new_message = {
            'id': row[0],
            'created_at': row[1].isoformat(),
            'username': data.get('username', 'Usuário'),
            'message': message,
            'room_id': room_id,
        }

        print(f"[SOCKET.IO] Emitindo mensagem para sala room_{room_id}: {new_message}")
        emit('receive_message', new_message, to=f"room_{room_id}")
    except Exception as e:
        db.session.rollback()
        print(f"[SOCKET.IO] Erro ao processar mensagem: {str(e)}")
        emit('error', {'message': str(e)}, broadcast=False)

@chat_route.route('/create_room', methods=['POST', 'OPTIONS'])
def create_room():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Nome da sala é obrigatório'}), 400

    try:
        query = text("""
            INSERT INTO chat_rooms (name, deleted)
            VALUES (:name, FALSE)
            RETURNING id, name, created_at;
        """)
        result = db.session.execute(query, {'name': data['name']})
        db.session.commit()

        room = result.fetchone()
        return jsonify({
            'id': room['id'],
            'name': room['name'],
            'created_at': room['created_at']
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@chat_route.route('/list_rooms', methods=['GET'])
@chat_route.route('/rooms', methods=['GET'])
def list_rooms():
    try:
        query = text("""
            SELECT id, name, created_at
            FROM chat_rooms
            WHERE deleted = FALSE
            ORDER BY created_at DESC;
        """)
        result = db.session.execute(query)
        rooms = [dict(row._mapping) for row in result]
        return jsonify(rooms), 200
    except Exception as e:
        logging.error(f"Erro ao listar salas: {str(e)}")
        return jsonify({'error': str(e)}), 500

@chat_route.route('/delete_room/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    try:
        query_room = text("""
            UPDATE chat_rooms
            SET deleted = TRUE
            WHERE id = :room_id;
        """)
        db.session.execute(query_room, {'room_id': room_id})

        query_messages = text("""
            UPDATE chat_messages
            SET deleted = TRUE
            WHERE room_id = :room_id;
        """)
        db.session.execute(query_messages, {'room_id': room_id})

        db.session.commit()
        return jsonify({'message': 'Sala e mensagens associadas deletadas com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Erro ao deletar sala {room_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500
