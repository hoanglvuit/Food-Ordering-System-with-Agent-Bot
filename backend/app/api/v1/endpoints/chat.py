import sys
import os

# Add agent directory to path so we can import from it
agent_dir = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
    "agent",
)
sys.path.insert(0, agent_dir)

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
import json

from graph import build_graph

router = APIRouter()

# Global graph instance with checkpointer
_graph = None


def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


def escape_sse_content(content: str) -> str:
    """
    Escape content for SSE format.
    Replace newlines with a placeholder that can be restored on frontend.
    """
    return content.replace("\n", "\\n").replace("\r", "\\r")


class ChatRequest(BaseModel):
    message: str
    thread_id: str
    is_first_message: bool = False  # True if this is the start of a new conversation


class ChatResponse(BaseModel):
    response: str
    thread_id: str


@router.post("/message")
async def chat_message(request: ChatRequest):
    """
    Handle a chat message and return a streaming response.

    - If is_first_message is True, initialize the conversation and return greeting.
    - Otherwise, inject user message and continue the graph.

    After solve_not_buy, if current_cart has items, we send a special message
    with cart data so frontend can add items to localStorage cart.
    """
    graph = get_graph()
    config = {"configurable": {"thread_id": request.thread_id}}

    async def generate():
        if request.is_first_message:
            # First message: Initialize and run until interrupt (before get_user_input)
            async for msg, metadata in graph.astream(
                {},
                config=config,
                stream_mode="messages",
            ):
                if (
                    metadata.get("ls_provider") == "google_genai"
                    and metadata.get("langgraph_node") != "parse_user_order"
                ):
                    escaped = escape_sse_content(msg.content)
                    yield f"data: {escaped}\n\n"
        else:
            # Subsequent messages: Update state with user input and resume
            try:
                # Inject user input into state and resume from where we stopped
                graph.update_state(config, {"pending_user_input": request.message})

                # Resume execution - this will run get_user_input (which reads pending_user_input)
                # then parse_user_order, then solve_*, then stop before get_user_input again
                async for msg, metadata in graph.astream(
                    None,  # None means resume from interrupt
                    config=config,
                    stream_mode="messages",
                ):
                    if (
                        metadata.get("ls_provider") == "google_genai"
                        and metadata.get("langgraph_node") != "parse_user_order"
                    ):
                        escaped = escape_sse_content(msg.content)
                        yield f"data: {escaped}\n\n"

            except Exception as e:
                print(f"[Error] Chat error: {e}")
                yield f"data: [ERROR] {str(e)}\n\n"
                return

        # Check if conversation ended (solve_not_buy was executed) and has cart items
        try:
            state = graph.get_state(config)
            if state.values.get("user_intent") == "NOT_BUY":
                current_cart = state.values.get("current_cart", [])
                if current_cart and len(current_cart) > 0:
                    # Send cart data as special message for frontend to process
                    cart_data = json.dumps(current_cart, ensure_ascii=False)
                    yield f"data: [CART_DATA]{cart_data}\n\n"
        except Exception as e:
            print(f"[Error] Failed to check cart: {e}")

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.post("/reset")
async def reset_chat(thread_id: str):
    """Reset a chat session by clearing its state."""
    return {"status": "ok", "message": "Please use a new thread_id to start fresh."}
