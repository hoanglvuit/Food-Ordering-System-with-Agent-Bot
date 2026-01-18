from pyasn1.type.univ import Any
from typing import List, TypedDict, Literal, Optional
from pydantic import BaseModel, Field
import enum


class Flavour(str, enum.Enum):
    spicy = "spicy"
    sour = "sour"
    sweet = "sweet"
    salty = "salty"
    bitter = "bitter"


class ItemCategory(str, enum.Enum):
    main_dish = "main_dish"
    dessert = "dessert"
    drink = "drink"
    side = "side"


class Item(BaseModel):
    id: int
    title: str
    price: int  # VND
    is_active: bool = True
    discount: Optional[float] = None
    category: Optional[List[str]] = None
    flavour: Optional[List[str]] = None


class UserIntent(BaseModel):
    """Output structure cho việc xác định thông tin món mà user mong muốn"""

    intent: Literal["BUY", "NOT_BUY", "UNCLEAR"] = Field(
        description="Ý định của người dùng: BUY (muốn mua), NOT_BUY (từ chối), UNCLEAR (không rõ ràng)",
    )
    item_id: Optional[int] = Field(
        default=None,
        description="ID món ăn mà người dùng muốn đặt. None nếu không có hoặc không hợp lệ.",
    )
    quantity: Optional[int] = Field(default=None, description="Số lượng món ăn.")


class CartItem(TypedDict):
    item_id: int
    title: str
    price: int
    quantity: int


class AgentState(TypedDict):
    user_id: Optional[int]  # ID của user hiện tại (nếu đã login)
    user_name: str  # Dùng để chào hỏi
    all_items: List[dict]  # Dùng để tư vấn các món (nếu cần)
    discount_items: List[dict]  # Dùng để tư vấn các món đang giảm giá lúc ban đầu
    items_str: List[
        Any
    ]  # Danh sách các món (chỉ gồm id và name) cho việc xác định intent
    current_cart: List[CartItem] | None = (
        None  # Giỏ hàng hiện tại. Nơi lưu trữ các món mà người mua đang đặt
    )
    messages: List  # Conversation history
    user_intent: Optional[str] = None
    user_choice_messages: (
        List  # Conversation history nhưng dành cho việc xác định intent
    )
    pending_user_input: Optional[str] = None  # Input từ frontend/API
    # intent_items_str: str
