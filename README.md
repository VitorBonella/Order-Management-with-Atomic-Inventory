# 🍔 Takeat — Gerenciamento de Pedidos com Estoque Atômico

Sistema POS para restaurantes com controle de estoque baseado em **Ficha Técnica**, garantindo atomicidade nas operações de pedido.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | Node.js + Express + Sequelize ORM |
| Banco | PostgreSQL |
| Frontend | React |

## Como Rodar

### Subindo o Banco com Docker 

```bash
# Na raiz do projeto
docker-compose up -d
# PostgreSQL disponível em localhost:5432
```

### Backend

```bash
cd backend
npm install

# Configure o arquivo .env.example

# Sync no banco e popula com dados iniciais
npm run seed

# Inicia o servidor
npm run dev
# Servidor em: http://localhost:3333
```

Arquivo .env.example
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=takeat
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3333
```
### Frontend

```bash
cd takeat-frontend
npm install
npm run dev
# App em: http://localhost:5173
```

> **Proxy**: o frontend usa proxy configurado no `vite.config.js` para `/api` → `http://localhost:3333`

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/products` | Lista produtos com ficha técnica |
| GET | `/api/inputs` | Lista insumos com estoque atual |
| POST | `/api/orders` | Cria pedido (validação + decremento atômico) |
| GET | `/api/orders` | Lista pedidos com itens |

### POST /api/orders — Payload

```json
{
  "table_number": 5,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 5, "quantity": 1 }
  ]
}
```

### Resposta de erro (estoque insuficiente) — HTTP 422

```json
{
  "success": false,
  "error": "Estoque insuficiente para um ou mais ingredientes.",
  "stock_errors": [
    {
      "input_id": 2,
      "input_name": "Carne Bovina 150g",
      "available": 1,
      "needed": 4
    }
  ]
}
```

---

## Lógica de Negócio — Atomicidade

O `OrderService` garante que **tudo ou nada** é persistido:

1. Inicia uma **transaction** Sequelize
2. Carrega os produtos com suas fichas técnicas (JOINs)
3. Agrega o consumo total de ingredientes do pedido inteiro
4. Aplica **SELECT ... FOR UPDATE** (row-level lock) em cada insumo
5. Verifica se o estoque é suficiente para **todos** os ingredientes
6. Se qualquer ingrediente falhar → **ROLLBACK total**
7. Se todos passarem → decrementa estoques + cria Order + OrderItems → **COMMIT**

---

## Desafio Extra — Offline-First / Queue

### Estratégia implementada

- **Detecção de rede**: via `navigator.onLine` + eventos `online`/`offline`
- **Fila persistida**: `localStorage` com chave `order_queue`
- **Auto-sincronização**: ao voltar online, processa a fila automaticamente
- **Tratamento de conflito tardio**: se ao sincronizar um pedido enfileirado o backend retornar erro de estoque (HTTP 422), ele é avisado via mensagem de erro no carrinho

