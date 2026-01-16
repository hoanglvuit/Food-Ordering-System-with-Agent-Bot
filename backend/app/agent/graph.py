from typing import Literal
from langgraph.graph import StateGraph, START, END
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
    workflow = StateGraph(AgentState)

    # Nodes
    workflow.add_node("get_data", get_data)
    workflow.add_node("greet_user", greet_user)
    workflow.add_node("get_user_input", get_user_input)
    workflow.add_node("parse_user_order", parse_user_order)
    workflow.add_node("solve_unclear", solve_unclear)
    workflow.add_node("solve_buy", solve_buy)
    workflow.add_node("solve_not_buy", solve_not_buy)

    # Edges
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

    chain = workflow.compile()
    png_bytes = chain.get_graph().draw_mermaid_png()

    with open("graph.png", "wb") as f:
        f.write(png_bytes)

    print("Graph saved as graph.png")

    return chain
