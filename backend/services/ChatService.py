from extensions import db
from sqlalchemy import text

class ChatService:
    @staticmethod
    def save_message(user_id, message):
        query = text("""
            INSERT INTO chat_messages (user_id, message)
            VALUES (:user_id, :message)
            RETURNING id, created_at;
        """)
        result = db.session.execute(query, {"user_id": user_id, "message": message})
        db.session.commit()
        return result.fetchone()

    @staticmethod
    def get_messages():
        query = text("""
            SELECT c.id, c.message, c.created_at, u.nome as username
            FROM chat_messages c
            INNER JOIN users u ON c.user_id = u.id
            WHERE c.deleted = FALSE
            ORDER BY c.created_at ASC;
        """)
        result = db.session.execute(query)
        return [dict(row._mapping) for row in result.fetchall()]
