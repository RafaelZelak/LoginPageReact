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

Python (versão 3.7 ou superior)
Node.js (versão 12 ou superior)
npm ou yarn para gerenciar pacotes no frontend

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
pip install flask flask_cors
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

## Considerações
#### - Certifique-se de que o backend e o frontend estão rodando simultaneamente para que a aplicação funcione corretamente.
#### - As configurações de CORS já estão habilitadas no backend para permitir a comunicação com o React.

