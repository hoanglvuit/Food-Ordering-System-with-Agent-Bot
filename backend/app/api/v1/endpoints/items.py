import os
import uuid
import shutil
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

UPLOAD_DIR = os.path.join(
    os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    ),
    "uploads",
)

# Ensure uploads directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=List[schemas.Item])
def read_items(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    name: str | None = None,  # Optional name filter
) -> Any:
    """
    Retrieve items. Public access.
    """
    if name:
        # Simple ilike filter
        items = (
            db.query(models.Item)
            .filter(models.Item.title.ilike(f"%{name}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )
    else:
        items = crud.item.get_multi(db, skip=skip, limit=limit)
    return items


@router.post("/", response_model=schemas.Item)
def create_item(
    *,
    db: Session = Depends(deps.get_db),
    title: str = Form(...),
    price: int = Form(...),
    description: Optional[str] = Form(None),
    discount: Optional[float] = Form(None),
    category: Optional[str] = Form(None),  # Comma-separated: "main_dish,dessert"
    flavour: Optional[str] = Form(None),  # Comma-separated: "spicy,sweet"
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new item with optional image upload. (Admin only)
    """
    image_url = None

    # Handle image upload
    if image and image.filename:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image type. Allowed: {', '.join(allowed_types)}",
            )

        # Generate unique filename
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # Store relative path for database
        image_url = f"/uploads/{unique_filename}"

    # Parse category and flavour from comma-separated strings
    category_list = None
    if category:
        category_list = [c.strip() for c in category.split(",") if c.strip()]

    flavour_list = None
    if flavour:
        flavour_list = [f.strip() for f in flavour.split(",") if f.strip()]

    # Create item schema
    item_in = schemas.ItemCreate(
        title=title,
        price=price,
        description=description,
        discount=discount,
        category=category_list,
        flavour=flavour_list,
        image_url=image_url,
    )

    item = crud.item.create(db, obj_in=item_in)
    return item


@router.put("/{item_id}", response_model=schemas.Item)
def update_item(
    *,
    db: Session = Depends(deps.get_db),
    item_id: int,
    title: Optional[str] = Form(None),
    price: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    discount: Optional[float] = Form(None),
    category: Optional[str] = Form(None),  # Comma-separated
    flavour: Optional[str] = Form(None),  # Comma-separated
    is_active: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update an item. (Admin only)
    """
    item = crud.item.get(db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Build update data
    update_data = {}

    if title is not None:
        update_data["title"] = title
    if price is not None:
        update_data["price"] = price
    if description is not None:
        update_data["description"] = description
    if discount is not None:
        update_data["discount"] = discount
    if is_active is not None:
        update_data["is_active"] = is_active

    # Parse category and flavour
    if category is not None:
        if category.strip():
            update_data["category"] = [
                c.strip() for c in category.split(",") if c.strip()
            ]
        else:
            update_data["category"] = []

    if flavour is not None:
        if flavour.strip():
            update_data["flavour"] = [
                f.strip() for f in flavour.split(",") if f.strip()
            ]
        else:
            update_data["flavour"] = []

    # Handle new image upload
    if image and image.filename:
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image type. Allowed: {', '.join(allowed_types)}",
            )

        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        update_data["image_url"] = f"/uploads/{unique_filename}"

    # Update item
    updated_item = crud.item.update(db, db_obj=item, obj_in=update_data)
    return updated_item


@router.delete("/{item_id}", response_model=schemas.Item)
def delete_item(
    *,
    db: Session = Depends(deps.get_db),
    item_id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete an item. (Admin only)
    """
    item = crud.item.get(db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item = crud.item.remove(db, id=item_id)
    return item


@router.get("/{id}", response_model=schemas.Item)
def read_item(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get item by ID.
    """
    item = crud.item.get(db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
