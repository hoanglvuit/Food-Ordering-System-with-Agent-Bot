from graph import build_graph_for_cli
from langchain_core.messages import HumanMessage


async def main():
    print("=" * 50)
    print("🍜 CHATBOT BÁN HÀNG THỰC PHẨM")
    print("=" * 50)

    app = build_graph_for_cli()
    thread_id = "cli-session"
    config = {"configurable": {"thread_id": thread_id}}

    # First run: Initialize and greet
    print("\n🤖 Bot: ", end="", flush=True)
    async for msg, metadata in app.astream(
        {},
        config=config,
        stream_mode="messages",
    ):
        if (
            metadata.get("ls_provider") == "google_genai"
            and metadata.get("langgraph_node") != "parse_user_order"
        ):
            print(msg.content, end="", flush=True)
    print("\n")

    # Conversation loop
    while True:
        user_input = input("👤 Bạn: ").strip()
        if not user_input:
            continue
        if user_input.lower() in ["quit", "exit", "thoát"]:
            print("👋 Tạm biệt!")
            break

        # Get current state and add user message
        current_state = app.get_state(config)
        messages = current_state.values.get("messages", [])
        user_choice_messages = current_state.values.get("user_choice_messages", [])

        # Update state with user message and set entry point to parse_user_order
        user_msg = HumanMessage(content=user_input)

        print("\n🤖 Bot: ", end="", flush=True)
        async for msg, metadata in app.astream(
            {
                "messages": messages + [user_msg],
                "user_choice_messages": user_choice_messages + [user_msg],
            },
            config=config,
            stream_mode="messages",
        ):
            if (
                metadata.get("ls_provider") == "google_genai"
                and metadata.get("langgraph_node") != "parse_user_order"
            ):
                print(msg.content, end="", flush=True)
        print("\n")

        # Check if conversation ended (solve_not_buy was executed)
        state = app.get_state(config)
        if state.values.get("user_intent") == "NOT_BUY":
            break


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
