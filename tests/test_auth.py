import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    """Test user registration."""
    response = await client.post(
        "/v2/u/signup",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password" not in data  # Password should not be returned


@pytest.mark.asyncio
async def test_register_duplicate_user(client: AsyncClient):
    """Test registration with duplicate email."""
    # First registration
    await client.post(
        "/v2/u/signup",
        json={
            "username": "testuser2",
            "email": "duplicate@example.com",
            "password": "testpass123"
        }
    )
    
    # Try to register again with same email
    response = await client.post(
        "/v2/u/signup",
        json={
            "username": "testuser3",
            "email": "duplicate@example.com",
            "password": "testpass123"
        }
    )
    
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_user(client: AsyncClient):
    """Test user login."""
    # First register a user
    await client.post(
        "/v2/u/signup",
        json={
            "username": "logintest",
            "email": "login@example.com",
            "password": "testpass123"
        }
    )
    
    # Now login
    response = await client.post(
        "/v2/u/login",
        data={
            "username": "logintest",
            "password": "testpass123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_with_email(client: AsyncClient):
    """Test user login with email."""
    # First register a user
    await client.post(
        "/v2/u/signup",
        json={
            "username": "emaillogin",
            "email": "emaillogin@example.com",
            "password": "testpass123"
        }
    )
    
    # Login with email
    response = await client.post(
        "/v2/u/login",
        data={
            "username": "emaillogin@example.com",  # Using email as username
            "password": "testpass123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    """Test login with wrong password."""
    # First register a user
    await client.post(
        "/v2/u/signup",
        json={
            "username": "wrongpass",
            "email": "wrongpass@example.com",
            "password": "correctpass"
        }
    )
    
    # Try to login with wrong password
    response = await client.post(
        "/v2/u/login",
        data={
            "username": "wrongpass",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient):
    """Test getting current user info."""
    # Register and login
    await client.post(
        "/v2/u/signup",
        json={
            "username": "currentuser",
            "email": "current@example.com",
            "password": "testpass123"
        }
    )
    
    login_response = await client.post(
        "/v2/u/login",
        data={
            "username": "currentuser",
            "password": "testpass123"
        }
    )
    
    token = login_response.json()["access_token"]
    
    # Get current user
    response = await client.get(
        "/v2/u/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "currentuser"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_current_user_unauthorized(client: AsyncClient):
    """Test getting current user without token."""
    response = await client.get("/v2/u/me")
    
    assert response.status_code == 401
