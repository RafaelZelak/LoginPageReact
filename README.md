# LoginPage
Este projeto é uma aplicação web com frontend em React e backend em Python usando Flask. Ele demonstra uma página de login com comunicação entre frontend e backend via API.

Estrutura do Projeto

```` bash
LoginPage/
│
├── frontend/    # React App
└── backend/     # Flask API
````

Pré-requisitos
Antes de começar, certifique-se de ter instalado:

 - Python (versão 3.7 ou superior)
 - Node.js (versão 12 ou superior)
 - PostgreSQL (versão 17 ou superior)
 - npm ou yarn para gerenciar pacotes no frontend

## Configuração do Backend (Python)
### 1 - Clone o repositório:
````bash
git clone https://github.com/RafaelZelak/LoginPageReact
cd LoginPage/backend
````
### 2 - Crie um ambiente virtual:

````bash
python -m venv .venv
````

### 3 - Ative o ambiente virtual:

#### No Windows
````bash
.venv\Scripts\activate
````
#### No Linux/Mac:
````bash
source .venv/bin/activate
````
### 4 - Instale as dependências:
````python
pip install -r requirements.txt
````

### 5 - Inicie o servidor Flask:
```` python
flask run
````

O backend estará disponível em http://localhost:5000.
###### O backand está servindo apenas como rota para os dados (API Rest), ao acessar o seu localhost na porta 5000 a página estará vazia, pois a interface gráfica não está sendo renderizada pelo Flask

## Configuração do Frontend (React)

### 1 - Acesse a pasta do frontend:
#### Caso ainda esteja na pasta do Backend volte para o diretório raiz do projeto
````bash
cd /frontend
````
### Instale as dependências (Node + React):
````bash
npm install
````
### 3 - Inicie o servidor de desenvolvimento:
````bash
npm start
````
O frontend estará disponível em http://localhost:3000
###### Na porta :3000 que será acessado a interface do sistema

### Considerações
#### - Certifique-se de que o backend e o frontend estão rodando simultaneamente para que a aplicação funcione corretamente.
#### - As configurações de CORS já estão habilitadas no backend para permitir a comunicação com o React.

# Database (PostgreSQL )
Para o Banco de Dados da aplicação, será utilizado o PostgreSQL

Caso esteja no Windows, antes de começar, configure o caminho do PostgreSQL no ambiente:
```` bash
set PATH=%PATH%;"C:\Program Files\PostgreSQL\<versão>\bin"
$Env:PATH += ";C:\Program Files\PostgreSQL\<versão>\bin"
````

## Criando a Database
### 1 - Abra o CLI do PostgreSQL

```` bash
psql -U postgres
````
### 2 - Crie o Banco de Dados

```` SQL
CREATE DATABASE gestao_negocio;
````
###### O nome no caso reflete ao sistema final, o meu está como "gestao_negocio" mas caso queira mudar basta alterar no backand também, na parte das credenciais do banco

### 2.1 - Verificar se o banco foi criado (opicional)
```` bash
\l
````
Caso o banco tenha sido criado o retorno será algo como

```` bash
       Name        |  Owner   | Encoding | Locale Provider |        Collate         |         Ctype          | Locale | ICU Rules |   Access privileges
 -------------------+----------+----------+-----------------+------------------------+------------------------+--------+-----------+-----------------------
 gestao_negocio    | postgres | UTF8     | libc            | Portuguese_Brazil.1252 | Portuguese_Brazil.1252 |        |           |
 ````
### 3 - Sair do Shell PostgreSQL`
```` SQL
\q
````

### 4 - Criar tabelas
Conecte-se ao banco usando o comando:
```` bash
psql -U postgres -d gestao_negocio
````
### 5 - Crie a Tabela `users`, `chat_messages` e `chat_rooms` 
No shell do PostgreSQL execute: </br>
Para a `Users`:

````SQL
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE
);
````
Para a `chat_messages`:

````SQL
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    room_id INT REFERENCES chat_rooms(id) ON DELETE CASCADE,
    deleted BOOLEAN DEFAULT FALSE
);
````

Para a `chat_rooms`
````SQL
CREATE TABLE chat_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
````
### 5.1 - Verificar se a tabela foi criada (opicional)
````SQL
\d users
````
O resuldado deve ser algo como
````SQL
                                       Table "public.users"
    Column    |          Type          | Collation | Nullable |              Default
--------------+------------------------+-----------+----------+-----------------------------------
 id           | integer                |           | not null | nextval('users_id_seq'::regclass)
 nome         | character varying(255) |           | not null |
 email        | character varying(255) |           | not null |
 senha        | character varying(255) |           | not null |
 tipo_usuario | character varying(50)  |           | not null |
 status       | boolean                |           | not null | true
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
    "users_email_key" UNIQUE CONSTRAINT, btree (email)

````

### 6 - Para teste, crie um user direto no banco (Opicional)
Neste caso a senha ficou como `12345` Deixei ela já criptografada para o sistema funcionar corretamente
````SQL
INSERT INTO users (nome, email, senha, tipo_usuario, status)
VALUES
('Admin', 'admin@email.com', '$2b$12$iG.djF4/FA3E1VqNOKQZruZFjx4d3RG7sHzR82S80dGgFE7pHTw2i', 'administrador', TRUE);
````

### 6.1 Consulte os dados:
````SQL
SELECT * FROM users;
````
O resuldado deve ser algo como
````SQL
 id | nome  |      email      | senha | tipo_usuario  | status
----+-------+-----------------+-------+---------------+--------
  1 | Admin | admin@email.com | $2b$1... | administrador | t
````
