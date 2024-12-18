from flask import Blueprint, request, jsonify
from flask_socketio import emit
from extensions import socketio, db
from services.ChatService import ChatService
import logging
from sqlalchemy.sql import text

log = logging.getLogger('werkzeug')
log.setLevel(logging.WARNING)

# Define o blueprint para as rotas de chat
chat_route = Blueprint('chat_route', __name__)

# Rota para carregar mensagens
@chat_route.route('/load_messages', methods=['GET'])
def load_messages():
    try:
        messages = ChatService.get_messages()
        return jsonify(messages), 200
    except Exception as e:
        logging.error(f"Erro ao carregar mensagens: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Evento de socket para enviar mensagens
@socketio.on('send_message')
def handle_send_message(data):
    user_id = data.get('user_id')
    message = data.get('message', '')
    room_id = data.get('room_id')

    if not user_id or not message.strip() or not room_id:
        return emit('error', {'message': 'Dados inválidos'}, broadcast=False)

    try:
        # Salva a mensagem no banco de dados
        result = ChatService.save_message(user_id, message, room_id)
        new_message = {
            'id': result[0],
            'created_at': result[1],
            'username': data.get('username', 'Usuário'),
            'message': message,
            'room_id': room_id,
        }
        emit('receive_message', new_message, broadcast=True)
    except Exception as e:
        emit('error', {'message': str(e)}, broadcast=False)

# Rota para criar uma sala
@chat_route.route('/create_room', methods=['POST', 'OPTIONS'])
def create_room():
    if request.method == 'OPTIONS':
        return jsonify({}), 200  # Resposta para preflight request

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

# Rota para listar salas existentes
@chat_route.route('/list_rooms', methods=['GET'])
@chat_route.route('/rooms', methods=['GET'])  # Compatibilidade com rota esperada no frontend
def list_rooms():
    try:
        # Recupera todas as salas do banco de dados que não estão deletadas
        query = text("""
            SELECT id, name, created_at
            FROM chat_rooms
            WHERE deleted = FALSE
            ORDER BY created_at DESC;
        """)
        result = db.session.execute(query)
        # Corrigindo o formato do resultado
        rooms = [dict(row._mapping) for row in result]  # Uso de `._mapping` para obter os dados corretamente
        return jsonify(rooms), 200
    except Exception as e:
        logging.error(f"Erro ao listar salas: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Rota para deletar uma sala
@chat_route.route('/delete_room/<int:room_id>', methods=['DELETE'])
def delete_room(room_id):
    try:
        query = text("""
            UPDATE chat_rooms
            SET deleted = TRUE
            WHERE id = :room_id;
        """)
        db.session.execute(query, {'room_id': room_id})
        db.session.commit()
        return jsonify({'message': 'Sala deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Erro ao deletar sala: {str(e)}")
        return jsonify({'error': str(e)}), 500

@chat_route.route('/room/<int:room_id>/messages', methods=['GET'])
def get_room_messages(room_id):
    try:
        # Consulta SQL para buscar mensagens, incluindo o nome do usuário
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
        # Usa `.mappings()` para garantir que o resultado seja um dicionário
        result = db.session.execute(query, {'room_id': room_id}).mappings().all()

        # Mapeia os resultados para o formato JSON esperado
        messages = [
            {
                'id': row['id'],
                'user_id': row['user_id'],
                'message': row['message'],
                'created_at': row['created_at'],
                'room_id': row['room_id'],
                'username': row['username'],  # Inclui o nome do usuário
            }
            for row in result
        ]
        return jsonify(messages), 200
    except Exception as e:
        logging.error(f"Erro ao carregar mensagens da sala {room_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500