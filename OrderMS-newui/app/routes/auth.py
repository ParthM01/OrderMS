from fastapi import APIRouter, Request, Form, Depends

from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi import Response,HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from app.models.user import User
from app.database.session import get_db
from app.schemas.user import ResetPasswordRequest ,UserAddressUpdate

router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@router.post("/register")
async def register(
    firstName: str = Form(...),
    lastName: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    confirmPassword: str = Form(...),
    db: Session = Depends(get_db)
):
    if password != confirmPassword:
        return {"error": "Passwords do not match"}

    user = User(
        first_name=firstName,
        last_name=lastName,
        mobile_number=phone,
        password=password,
        customer_id=str(uuid4())[:8],
        internal_id=str(uuid4())
    )
    try:
        db.add(user)
        db.commit()
        response = RedirectResponse(url="/login", status_code=303)
        return response
    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={"message": "Registration failed: " + str(e)}
        ) 

@router.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    print("✔ Login route hit")
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/login")
def login(
    mobile_number: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.mobile_number == mobile_number,
        User.password == password
    ).first()

    if user:
        # Return user data in response
        response = JSONResponse(content={
            "message": "Login successful",
            "user": {
                "first_name": user.first_name,
                "id": user.id
            }
        })
        response.set_cookie(key="logged_in", value="true", httponly=True)
        print("✔ Login successful")
        return response

    return JSONResponse(content={"detail": "Invalid credentials"}, status_code=401)

@router.get("/logout")
def logout():
    response = RedirectResponse(url="/", status_code=302)
    response.delete_cookie(key="logged_in")
    return response


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    print(req)
    user = db.query(User).filter(User.mobile_number == req.phone).first()
    if user:
        user.password = req.newPassword
        db.add(user)
        db.commit()
        return JSONResponse(content={"message": "Password reset successful"})
    return JSONResponse(content={"detail": "Invalid credentials"}, status_code=401)



@router.get("/api/user/addresses")
def get_user_saved_address(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.address
    
    
@router.post("/api/user/address")
async def save_user_address(payload: UserAddressUpdate, db: Session = Depends(get_db)):
    print("Received payload:", payload)

    id = payload.id
    if not id:
        raise HTTPException(status_code=400, detail="Phone is required in userDetails")

    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.address = []

    new_address = payload.address.model_dump()
    print("Appending address:", new_address)

    # Optional: prevent duplicates based on 'id'
    if not any(addr.get("id") == new_address.get("id") for addr in user.address):
        user.address.append(new_address)
    else:
        print("Duplicate address ID. Skipping append.")

    db.commit()

    return JSONResponse(content={"message": "Address saved successfully", "addresses": user.address})
