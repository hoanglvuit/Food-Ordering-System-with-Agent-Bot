from data import (
    get_all_items,
    get_discount_items,
    get_item_by_id,
    format_items_for_prompt,
    format_items_for_intent,
)


def test_get_all_items():
    items = get_all_items()
    print(f"Total items: {len(items)}")
    for item in items[:3]:
        print(item)


def test_get_discount_items():
    items = get_discount_items()
    print("Discount items:")
    for item in items:
        print(item.title, item.discount)


def test_get_item_by_id():
    print(f"Item with id 1:")
    item = get_item_by_id(1)
    print(item)


def test_format():
    items = get_all_items()
    print(format_items_for_prompt(items))
    print(format_items_for_intent(items))


if __name__ == "__main__":
    test_get_all_items()
    test_get_discount_items()
    test_get_item_by_id()
    test_format()
