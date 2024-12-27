from flask import Blueprint, request, jsonify
from flask_socketio import emit, join_room
from extensions import socketio, db
from sqlalchemy.sql import text
import logging
import base64

log = logging.getLogger('werkzeug')
log.setLevel(logging.WARNING)

chat_route = Blueprint('chat_route', __name__)

def detect_image_type(image_bytes):
    # Certifique-se de que a entrada é do tipo bytes
    if isinstance(image_bytes, memoryview):
        image_bytes = image_bytes.tobytes()

    if image_bytes.startswith(b'\xFF\xD8\xFF'):
        return "jpeg"
    elif image_bytes.startswith(b'\x89PNG'):
        return "png"
    elif image_bytes[:6] in [b'GIF89a', b'GIF87a']:
        return "gif"
    elif image_bytes.startswith(b'BM'):
        return "bmp"
    elif image_bytes.startswith(b'RIFF') and b'WEBP' in image_bytes[:12]:
        return "webp"
    else:
        return "unknown"

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
            SELECT id, name, created_at, image
            FROM chat_rooms
            WHERE deleted = FALSE
            ORDER BY created_at DESC;
        """)
        result = db.session.execute(query).mappings()

        rooms = []

        for row in result:
            image_data = row['image']
            # Converte memoryview para bytes
            image_bytes = image_data.tobytes() if image_data else None
            image_type = detect_image_type(image_bytes) if image_bytes else None
            rooms.append({
                'id': row['id'],
                'name': row['name'],
                'created_at': row['created_at'],
                'image': 'data:image/{};base64,'.format(image_type) + base64.b64encode(image_bytes).decode('utf-8') if image_bytes else None,
                'image_type': image_type,
            })

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

@chat_route.route('/delete_message/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    try:
        query = text("""
            UPDATE chat_messages
            SET deleted = TRUE
            WHERE id = :message_id;
        """)
        db.session.execute(query, {'message_id': message_id})
        db.session.commit()
        return jsonify({'message': 'Mensagem marcada como deletada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Erro ao marcar mensagem {message_id} como deletada: {str(e)}")
        return jsonify({'error': str(e)}), 500

@chat_route.route('/edit_message/<int:message_id>', methods=['PUT'])
def edit_message(message_id):
    try:
        data = request.get_json()
        new_message = data.get('message', '').strip()

        if not new_message:
            return jsonify({'error': 'Mensagem não pode estar vazia'}), 400

        query = text("""
            UPDATE chat_messages
            SET message = :new_message
            WHERE id = :message_id AND deleted = FALSE
            RETURNING room_id;
        """)
        result = db.session.execute(query, {'new_message': new_message, 'message_id': message_id})
        db.session.commit()

        row = result.fetchone()
        if row:
            room_id = row['room_id']
            updated_message = {
                'id': message_id,
                'message': new_message,
                'room_id': room_id
            }
            # Emissão do evento para os clientes conectados à sala
            socketio.emit('message_edited', updated_message, to=f"room_{room_id}")

        return jsonify({'message': 'Mensagem atualizada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Erro ao editar mensagem {message_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@chat_route.route('/upload_image/<int:room_id>', methods=['POST'])
def upload_image(room_id):
    try:
        file = request.files['image']
        if not file:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400

        # Ler o arquivo como binário
        image_binary = file.read()

        # Atualizar a coluna `image` da sala
        query = text("""
            UPDATE chat_rooms
            SET image = :image
            WHERE id = :room_id;
        """)
        db.session.execute(query, {'image': image_binary, 'room_id': room_id})
        db.session.commit()

        return jsonify({'message': 'Imagem salva com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500