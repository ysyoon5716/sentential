from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel

from app.auth import (
    COOKIE_NAME,
    create_access_token,
    get_current_user,
    verify_password,
)
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    password: str


@router.post("/login")
async def login(body: LoginRequest, response: Response):
    if not verify_password(body.password):
        return Response(status_code=401, content='{"detail":"Invalid password"}', media_type="application/json")
    token = create_access_token()
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return {"ok": True}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me", dependencies=[Depends(get_current_user)])
async def me():
    return {"authenticated": True}
