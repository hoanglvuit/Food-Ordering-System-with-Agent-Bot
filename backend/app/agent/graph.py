from typing import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from schema import AgentState
from nodes import (
    get_data,
    greet_user,
    get_user_input,
    parse_user_order,
    solve_unclear,
    solve_buy,
    solve_not_buy,
)


def route_after_parse(
    state: AgentState,
) -> Literal["solve_buy", "solve_not_buy", "solve_unclear"]:
    intent = state.get("user_intent", "")
    if intent == "BUY":
        return "solve_buy"
    elif intent == "NOT_BUY":
        return "solve_not_buy"
    return "solve_unclear"


def build_graph():
    """
    Build the agent graph with original flow.
    Uses interrupt_before to pause at get_user_input node,
    allowing external input from either CLI or API.
    """
    workflow = StateGraph(AgentState)

    # Nodes - giữ nguyên như ban đầu
    workflow.add_node("get_data", get_data)
    workflow.add_node("greet_user", greet_user)
    workflow.add_node("get_user_input", get_user_input)
    workflow.add_node("parse_user_order", parse_user_order)
    workflow.add_node("solve_unclear", solve_unclear)
    workflow.add_node("solve_buy", solve_buy)
    workflow.add_node("solve_not_buy", solve_not_buy)

    # Edges - giữ nguyên luồng ban đầu
    workflow.add_edge(START, "get_data")
    workflow.add_edge("get_data", "greet_user")
    workflow.add_edge("greet_user", "get_user_input")
    workflow.add_edge("get_user_input", "parse_user_order")
    workflow.add_conditional_edges(
        "parse_user_order",
        route_after_parse,
        {
            "solve_unclear": "solve_unclear",
            "solve_buy": "solve_buy",
            "solve_not_buy": "solve_not_buy",
        },
    )
    workflow.add_edge("solve_unclear", "get_user_input")
    workflow.add_edge("solve_buy", "get_user_input")
    workflow.add_edge("solve_not_buy", END)

    # Add checkpointer for state persistence
    checkpointer = MemorySaver()

    # Compile với interrupt_before để dừng TRƯỚC khi chạy get_user_input
    # Điều này cho phép API/CLI inject user message vào state
    chain = workflow.compile(
        checkpointer=checkpointer, interrupt_before=["get_user_input"]
    )

    return chain


def build_graph_for_cli():
    """
    Build the graph for CLI usage (for backward compatibility).
    This version draws the graph and saves as PNG.
    """
    chain = build_graph()

    try:
        png_bytes = chain.get_graph().draw_mermaid_png()
        with open("graph.png", "wb") as f:
            f.write(png_bytes)
        print("Graph saved as graph.png")
    except Exception:
        pass  # Ignore if mermaid is not available

    return chain
