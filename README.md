# 🍔 Food Shop with AI Agent

A modern, full-stack food ordering system integrated with an intelligent AI Consultant. This project demonstrates how to build a robust interaction layer using **LangGraph** and **Google Gemini** to create a natural, context-aware shopping assistant.

## ✨ Features

-   **Smart AI Consultant**: A chatbot that understands intent, recommends products, handles orders, and answers questions.
-   **Full Menu & Ordering**: browsing products, managing cart, and placing orders.
-   **Admin Dashboard**: Manage products, vouchers, and shipping rules.
-   **Discount System**: Dynamic pricing and voucher support.
-   **Real-time Interaction**: Streaming responses for a fluid chat experience.

## DEMO
https://private-user-images.githubusercontent.com/176000683/536920566-b7dc275f-8312-45bc-a9e7-f52aeaecc3d6.mp4?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3Njg1ODQwOTAsIm5iZiI6MTc2ODU4Mzc5MCwicGF0aCI6Ii8xNzYwMDA2ODMvNTM2OTIwNTY2LWI3ZGMyNzVmLTgzMTItNDViYy1hOWU3LWY1MmFlYWVjYzNkNi5tcDQ_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwMTE2JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDExNlQxNzE2MzBaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT01YzJlYjA1MDRmNDFjNjBlZjE4M2M1M2IwMzIzNTQ3ZDJjNmI1YzM5NWM4NDgwNDA3Y2UzMDJiMDcwODEzZWJhJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.ZCSKurVRbthcT804OYaNAsC49PHyeb1kDE1HswrVpSA

## 🛠 Tech Stack

### Backend
-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (High performance, easy to use)
-   **Database**: PostgreSQL
-   **ORM**: SQLAlchemy + Alembic (Migrations)
-   **AI & Logic**:
    -   **LangChain**: Base abstractions for LLMs.
    -   **LangGraph**: State orchestration for the agent.
    -   **Google Gemini 2.0 Flash**: The brain of the agent.

### Frontend
-   **Framework**: [React](https://react.dev/) (Vite)
-   **Styling**: TailwindCSS (Modern, responsive design)
-   **State Management**: React Hooks & Context

---

## 🤖 The AI Clerk (Agent Deep Dive)

The core highlight of this project is the **AI Agent**, designed not just to "chat" but to "act". It serves as a virtual waiter/consultant that can browse the database and take orders.

### 🧠 Why it stands out

1.  **Cyclic Workflow (State Machine)**:
    Unlike simple linear chains, this agent uses **LangGraph** to define a cyclic graph. It can "Loop" back to ask clarifying questions, handle invalid inputs, or continue the conversation naturally without losing context.
    -   *Flow*: `Listen` -> `Interpret` -> `Act` -> `Loop`

2.  **Efficiency with Gemini 2.0 Flash**:
    We prove that **Good Engineering > Massive Models**. By using Gemini 2.0 Flash (a lightweight model), combined with strict prompting and structured data, we achieve extremely fast, accurate, and cost-effective performance.

3.  **Structured Output (Deterministic Actions)**:
    We don't rely on the LLM to just "guess" JSON. We use **Structured Output** with Pydantic models (`UserIntent`) to force the LLM to return strict data:
    ```python
    class UserIntent(BaseModel):
        intent: Literal["BUY", "NOT_BUY", "UNCLEAR"]
        item_id: Optional[int]
        quantity: Optional[int]
    ```
    This ensures the code *always* knows exactly what the user wants to buy and how much, or if they are just chatting.

4.  **Prompt Engineering & Dynamic Context**:
    -   **System Prompts**: Carefully crafted to handle Vietnamese cultural nuances (calling customers by name, polite phrasing).
    -   **Context Injection**: The agent doesn't hallucinate menu items. Before every turn, we inject the *real-time* list of available products and discounts from the database into the prompt.

### 🔄 Agent Workflow

![Workflow](https://github.com/hoanglvuit/Food-Ordering-System-with-Assistant-Agent/blob/main/backend/app/agent/graph.png)


The underlying graph operates as follows:

1.  **`greet_user`**: Starts the session, presenting discounts.
2.  **`get_user_input`**: Pauses execution (via `interrupt_before`) to wait for user input from the WebSocket/API.
3.  **`parse_user_order`**: Analyzes the input using the `UserIntent` schema.
    -   If **BUY**: Validates ID/Quantity -> Adds to `current_cart` -> Routes to `solve_buy`.
    -   If **NOT_BUY**: Routes to `solve_not_buy`.
    -   If **UNCLEAR**: Routes to `solve_unclear`.
4.  **Solvers (`solve_*`)**: execute the business logic (confirming order, asking for clarification) and then **loop back** to `get_user_input` to continue the conversation.

## 🚀 Getting Started

### Prerequisites
-   Python 3.10+
-   Node.js 18+
-   PostgreSQL

### Installation

1.  **Backend**:
    ```bash
    cd backend
    python -m venv .venv
    source .venv/bin/activate  # or .venv\Scripts\activate on Windows
    pip install -r requirements.txt
    # Configure .env with DATABASE_URL and GOOGLE_API_KEY
    uvicorn app.main:app --reload
    ```

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```