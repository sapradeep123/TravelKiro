"""
Quick script to create a test user for login testing
"""
import asyncio
import httpx

API_BASE = "http://localhost:8000/v2"

async def create_test_user():
    """Create a test user"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Create admin user
        user_data = {
            "email": "admin@docflow.com",
            "username": "admin",
            "password": "admin123"
        }
        
        try:
            response = await client.post(f"{API_BASE}/u/signup", json=user_data)
            if response.status_code == 201:
                print(f"[OK] Created user: {user_data['email']}")
                print(f"   Username: {user_data['username']}")
                print(f"   Password: {user_data['password']}")
                return True
            else:
                print(f"[WARN] User might already exist: {response.text}")
                return False
        except Exception as e:
            print(f"[ERROR] Error: {e}")
            return False

if __name__ == "__main__":
    print("Creating test user...")
    asyncio.run(create_test_user())
    print("\nYou can now login with:")
    print("  Email/Username: admin@docflow.com or admin")
    print("  Password: admin123")

