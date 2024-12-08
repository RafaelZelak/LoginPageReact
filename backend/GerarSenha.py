#Usar apenas para testes!

import bcrypt

def hash_password(password: str) -> str:
    """
    Recebe uma senha e retorna sua versão criptografada.
    """
    salt = bcrypt.gensalt()  # Gera um salt único
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')  # Converte o hash para string

def verify_password(password: str, hashed: str) -> bool:
    """
    Verifica se uma senha corresponde ao hash armazenado.
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Teste
if __name__ == "__main__":
    senha = "12345"
    hash_gerado = hash_password(senha)

    print(f"Senha original: {senha}")
    print(f"Hash gerado: {hash_gerado}")

    # Verificando a senha
    senha_valida = "12345"
    senha_invalida = "senhaErrada456"

    print(f"Senha válida (deve ser True): {verify_password(senha_valida, hash_gerado)}")
    print(f"Senha inválida (deve ser False): {verify_password(senha_invalida, hash_gerado)}")
