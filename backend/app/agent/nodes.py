from typing import List
from langchain_core.messages import SystemMessage, HumanMessage
from schema import AgentState, UserIntent
from config import llm, structured_llm
from prompt import system_prompt, order_system_prompt
from data import (
    get_all_items,
    get_discount_items,
    get_item_by_id,
    format_items_for_prompt,
    format_items_for_intent,
)


def get_data(state: AgentState):
    """Lấy dữ liệu ban đầu"""
    all_items = get_all_items()
    discount_items = get_discount_items()

    all_items_full_str = format_items_for_prompt(all_items)
    discount_items_str = format_items_for_prompt(discount_items)

    items_str = format_items_for_intent(all_items)

    return {
        "user_name": "Lê Hoàng",
        "all_items": [item.model_dump() for item in all_items],
        "discount_items": [item.model_dump() for item in discount_items],
        "current_cart": [],
        "items_str": items_str,
        "messages": [
            SystemMessage(
                content=system_prompt.format(
                    all_items=all_items_full_str, discount_items=discount_items_str
                )
            )
        ],
        "user_choice_messages": [
            SystemMessage(content=order_system_prompt.format(items_str=items_str))
        ],
    }


def greet_user(state: AgentState):
    """Chào khách hàng và giới thiệu các món giảm giá"""
    discount_names = [item["title"] for item in state["discount_items"]]
    request = HumanMessage(
        content=f"""Người dùng tên là {state["user_name"]}. 
Các món đang giảm giá: {", ".join(discount_names)}. 

Hãy:
1. Chào khách hàng thân thiện (đoán giới tính, gọi tên không gọi họ)
2. Giới thiệu các món đang giảm giá và hỏi họ muốn đặt gì."""
    )
    messages = state["messages"] + [request]
    response = llm.invoke(messages)
    print(f"\n🤖 Bot: {response.content}\n")
    return {"messages": messages + [response]}


def get_user_input(state: AgentState):
    """
    Lấy input từ người dùng.

    Khi chạy CLI: sử dụng input() như bình thường
    Khi chạy API: node này sẽ bị interrupt trước khi chạy,
    và user message sẽ được inject vào state từ bên ngoài.

    Trong trường hợp API, node này vẫn được gọi nhưng với state
    đã có user message (được thêm từ API handler).
    """
    # Kiểm tra xem có pending_user_input trong state không (từ API)
    if state.get("pending_user_input"):
        user_input = state["pending_user_input"]
        return {
            "messages": state["messages"] + [HumanMessage(content=user_input)],
            "pending_user_input": None,  # Clear sau khi sử dụng
        }

    # Fallback cho CLI mode
    user_input = input("👤 Bạn: ").strip()
    return {"messages": state["messages"] + [HumanMessage(content=user_input)]}


def parse_user_order(state: AgentState):
    """Xác định ý định của người dùng"""
    user_message = HumanMessage(content=state["messages"][-1].content)
    request = state["user_choice_messages"] + [user_message]

    try:
        # parsed là object UserIntent đơn lẻ
        # print(f"Parse user choice: {request}")
        parsed: UserIntent = structured_llm.invoke(request)

        print(
            f"[Debug] Parsed Intent: {parsed.intent}, Item ID: {parsed.item_id}, Quantity: {parsed.quantity}"
        )

        if parsed.intent == "BUY":
            # Check ID và Quantity chặt chẽ
            # Nếu thiếu 1 trong 2 thì coi như UNCLEAR để hỏi lại. Tại đôi khi LLM dở chứng, mặc dù điền quantity None nhưng vẫn phân loại là BUY
            if not parsed.item_id or not parsed.quantity:
                # print(
                #     "[Logic] Missing ID or Quantity for BUY intent -> Switching to UNCLEAR"
                # )
                return {"user_intent": "UNCLEAR", "user_choice_messages": request}

            item = get_item_by_id(parsed.item_id)
            if item:
                cart = state["current_cart"]
                price = item.price
                if item.discount:
                    price = int(item.price)

                cart.append(
                    {
                        "item_id": item.id,
                        "title": item.title,
                        "price": price,
                        "quantity": parsed.quantity,
                        "discount": item.discount,
                    }
                )
                return {
                    "user_intent": "BUY",
                    "user_choice_messages": request,
                    "current_cart": cart,
                }
            else:
                # ID trả về không tồn tại
                return {"user_intent": "UNCLEAR", "user_choice_messages": request}

        if parsed.intent == "NOT_BUY":
            return {"user_intent": "NOT_BUY", "user_choice_messages": request}

        return {"user_intent": "UNCLEAR", "user_choice_messages": request}

    except Exception as e:
        # print(f"[Error] Parsing failed: {e}")
        return {"user_intent": "UNCLEAR", "user_choice_messages": request}


def solve_unclear(state: AgentState):
    request = SystemMessage(
        content="Người dùng nhập món không tồn tại hoặc thiếu số lượng. Hãy hỏi lại để làm rõ. Không nói dài dòng thêm gì cả"
    )
    messages = state["messages"] + [request]

    # print(f"Solve unclear: {messages}")
    response = llm.invoke(messages)
    # print(f"\n🤖 Bot: {response.content}\n")
    return {
        "messages": state["messages"]
        + [response],  # Tại sao không thêm request, vì nó không cần thiết
        "user_choice_messages": state["user_choice_messages"]
        + [
            response
        ],  # Thêm cả response vì đôi lúc bot sẽ hỏi bạn muốn ăn cơm sườn nướng đúng không -> user: đúng-> hỗ trợ việc xác định intent
    }


def solve_buy(state: AgentState):
    # print("Come here solve_buy")
    request = HumanMessage(
        content="Hãy hỏi khách muốn mua gì trong các món đang có không"
    )
    messages = state["messages"] + [request]
    response = llm.invoke(messages)
    # print(f"\n🤖 Bot: {response.content}\n")
    return {
        "messages": state["messages"]
        + [response],  # Tương tự không cần thêm request vì không cần thiết
        "user_choice_messages": state["user_choice_messages"] + [request] + [response],
    }


def solve_not_buy(state: AgentState):
    if state["current_cart"] is None:
        request = SystemMessage(
            content="Khách hàng không muốn mua. Chào tạm biệt thân thiện và mời họ quay lại."
        )
    else:
        cart_lines = []
        total = 0
        if state["current_cart"]:
            for item in state["current_cart"]:
                subtotal = (
                    item["price"]
                    * item["quantity"]
                    * (1 - (item["discount"] or 0) / 100)
                )
                total += subtotal
                cart_lines.append(
                    f"- {item['title']} (ID:{item['item_id']}): {item['quantity']} x {item['price']:,}đ = {subtotal:,}đ"
                )
        cart_summary = "\n".join(cart_lines)
        if total > 0:
            cart_summary += f"\nTổng: {total:,}đ"
        request = SystemMessage(
            content=f"Khách hàng đã mua {cart_summary}. Với tổng tiền là {total:,}đ. BẠN CHỈ CẦN BẢO KHÁCH ĐẾN GIỎ HÀNG ĐỂ THANH TOÁN"
        )
    messages = state["messages"] + [request]
    response = llm.invoke(messages)
    # print(f"\n🤖 Bot: {response.content}\n")
    return {"messages": messages + [response]}
