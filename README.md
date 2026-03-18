# Kanban App

Aplicação de gerenciamento de tarefas no estilo Kanban, inspirada no Trello. Desenvolvida com React no frontend e NestJS no backend, com suporte a múltiplos quadros, drag and drop, checklists e datas de vencimento.

## 🚀 Demo

- **Frontend:** [kanban-jcnwq7ap5-albert-vitors-projects.vercel.app](https://kanban-app-one-sigma.vercel.app/login)

---

## ✨ Funcionalidades

- Autenticação com JWT (login e cadastro)
- Múltiplos quadros por usuário
- Colunas e cartões com drag and drop
- Reordenação de colunas e cartões com persistência
- Modal de detalhes do cartão
- Checklist com barra de progresso
- Data de vencimento com alerta visual
- Busca de cartões em tempo real
- Layout responsivo

---

## 🛠 Stack

### Frontend
- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- React Router DOM
- @dnd-kit (drag and drop)
- Axios

### Backend
- Node.js + NestJS
- TypeScript
- Prisma ORM v7
- PostgreSQL
- JWT (Passport.js)
- bcryptjs

### Infraestrutura
- **Frontend:** Vercel
- **Backend:** Railway
- **Banco de dados:** PostgreSQL (Railway)

---

## 🔀 Fluxo de versionamento

O projeto foi desenvolvido em fases, cada uma em sua própria branch:

| Branch | Descrição |
|--------|-----------|
| `feat/fase-1-setup` | Setup NestJS, React, Prisma e Tailwind |
| `feat/fase-2-auth` | Autenticação JWT (backend + frontend) |
| `feat/fase-3-boards` | CRUD de quadros |
| `feat/fase-4-kanban` | Colunas, cartões e drag and drop |
| `feat/fase-5-extras` | Checklist, datas e busca |
| `feat/deploy` | Configuração de deploy |

---

## 📡 Endpoints da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Fazer login |

### Boards
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/boards` | Listar quadros |
| POST | `/boards` | Criar quadro |
| GET | `/boards/:id` | Buscar quadro com colunas e cartões |
| PATCH | `/boards/:id` | Atualizar quadro |
| DELETE | `/boards/:id` | Excluir quadro |

### Columns
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/columns` | Criar coluna |
| PATCH | `/columns/:id` | Atualizar coluna |
| DELETE | `/columns/:id` | Excluir coluna |
| PATCH | `/columns/reorder/:boardId` | Reordenar colunas |

### Cards
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/cards` | Criar cartão |
| PATCH | `/cards/:id` | Atualizar cartão |
| DELETE | `/cards/:id` | Excluir cartão |
| PATCH | `/cards/:id/move` | Mover cartão entre colunas |
| POST | `/cards/:id/checklist` | Adicionar item ao checklist |
| PATCH | `/cards/checklist/:id` | Atualizar item do checklist |
| DELETE | `/cards/checklist/:id` | Remover item do checklist |

---

## 📝 Licença

MIT