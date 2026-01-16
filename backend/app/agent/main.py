from graph import build_graph


def main():
    print("=" * 50)
    print("🍜 CHATBOT BÁN HÀNG THỰC PHẨM")
    print("=" * 50)

    app = build_graph()

    # async for msg, metadata in app.astream(
    #     {"user_name": "Lê Hoàng"},
    #     stream_mode="messages",
    # ):
    #     if (
    #         metadata.get("ls_provider") == "google_genai"
    #         and metadata.get("langgraph_node") != "parse_user_order"
    #     ):
    #         print(metadata.get("langgraph_node"))
    #         print(msg.content, end="", flush=True)

    result = app.invoke({})

    print("\n" + "=" * 50)
    print("📋 KẾT QUẢ CUỐI CÙNG:")
    print("=" * 50)
    if result.get("current_cart"):
        print("\n🛒 Giỏ hàng:")
        for item in result["current_cart"]:
            print(f"   - {item['title']}: {item['quantity']} phần")
    else:
        print("\n   Không có đơn hàng nào.")


if __name__ == "__main__":
    # import asyncio

    # asyncio.run(main())
    main()
