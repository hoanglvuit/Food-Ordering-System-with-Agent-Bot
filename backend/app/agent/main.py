from graph import build_graph


async def main():
    print("=" * 50)
    print("🍜 CHATBOT BÁN HÀNG THỰC PHẨM")
    print("=" * 50)

    app = build_graph()

    async for msg, metadata in app.astream(
        {},
        stream_mode="messages",
    ):
        if (
            metadata.get("ls_provider") == "google_genai"
            and metadata.get("langgraph_node") != "parse_user_order"
        ):
            print(msg.content, end="", flush=True)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
    # main()
