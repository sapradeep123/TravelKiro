"""
Seed script to create sample users and documents for testing DocFlow
"""
import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import httpx
from datetime import datetime

# API base URL
API_BASE = "http://localhost:8000/v2"

# Sample users to create
SAMPLE_USERS = [
    {
        "email": "admin@docflow.com",
        "username": "admin",
        "password": "admin123"
    },
    {
        "email": "john.doe@docflow.com",
        "username": "johndoe",
        "password": "password123"
    },
    {
        "email": "jane.smith@docflow.com",
        "username": "janesmith",
        "password": "password123"
    },
    {
        "email": "manager@docflow.com",
        "username": "manager",
        "password": "password123"
    }
]

# Sample documents metadata
SAMPLE_DOCUMENTS = [
    {
        "name": "Project_Requirements.pdf",
        "tags": ["project", "requirements", "important"],
        "custom_metadata": {
            "Department": "Engineering",
            "Project": "DocFlow",
            "Priority": "High",
            "Status": "Active"
        },
        "comments": [
            "This document outlines the core requirements for the project.",
            "Please review and provide feedback by end of week."
        ]
    },
    {
        "name": "Meeting_Notes_2024.md",
        "tags": ["meeting", "notes", "2024"],
        "custom_metadata": {
            "Meeting_Date": "2024-11-14",
            "Attendees": "5",
            "Duration": "60 minutes"
        },
        "comments": [
            "Key decisions made during the meeting.",
            "Action items assigned to team members."
        ]
    },
    {
        "name": "API_Documentation.docx",
        "tags": ["api", "documentation", "technical"],
        "custom_metadata": {
            "Version": "1.0.0",
            "Author": "Development Team",
            "Last_Updated": "2024-11-14"
        },
        "comments": [
            "Complete API reference guide.",
            "Includes authentication and all endpoints."
        ]
    },
    {
        "name": "Budget_Report_2024.xlsx",
        "tags": ["finance", "budget", "report", "2024"],
        "custom_metadata": {
            "Fiscal_Year": "2024",
            "Department": "Finance",
            "Approved": "Yes"
        },
        "comments": [
            "Q4 budget analysis.",
            "Review required before submission."
        ]
    },
    {
        "name": "Design_Mockups.png",
        "tags": ["design", "ui", "mockups"],
        "custom_metadata": {
            "Designer": "Jane Smith",
            "Tool": "Figma",
            "Status": "Approved"
        },
        "comments": [
            "Initial design concepts.",
            "Ready for development handoff."
        ]
    },
    {
        "name": "User_Guide.pdf",
        "tags": ["documentation", "user-guide", "help"],
        "custom_metadata": {
            "Target_Audience": "End Users",
            "Language": "English",
            "Pages": "45"
        },
        "comments": [
            "Comprehensive user guide.",
            "Includes screenshots and step-by-step instructions."
        ]
    },
    {
        "name": "Security_Audit_Report.pdf",
        "tags": ["security", "audit", "compliance"],
        "custom_metadata": {
            "Auditor": "Security Team",
            "Date": "2024-11-10",
            "Status": "Completed"
        },
        "comments": [
            "Security assessment completed.",
            "All issues have been addressed."
        ]
    },
    {
        "name": "Database_Schema.sql",
        "tags": ["database", "schema", "sql", "technical"],
        "custom_metadata": {
            "Database": "PostgreSQL",
            "Version": "15",
            "Tables": "12"
        },
        "comments": [
            "Complete database schema.",
            "Includes all tables and relationships."
        ]
    }
]


async def create_user(client, user_data):
    """Create a user account"""
    try:
        response = await client.post(f"{API_BASE}/u/signup", json=user_data)
        if response.status_code == 201:
            print(f"✅ Created user: {user_data['email']}")
            return True
        else:
            print(f"⚠️  User {user_data['email']} might already exist: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating user {user_data['email']}: {e}")
        return False


async def login_user(client, email, password, username):
    """Login and get access token"""
    try:
        response = await client.post(
            f"{API_BASE}/u/login",
            data={"username": username, "password": password}  # Using form data
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
        return None
    except Exception as e:
        print(f"❌ Error logging in {email}: {e}")
        return None


async def create_sample_file(filename, content):
    """Create a sample file"""
    file_path = Path("scripts/sample_files") / filename
    file_path.parent.mkdir(exist_ok=True)
    file_path.write_text(content)
    return file_path


async def upload_document(client, token, file_path, doc_meta):
    """Upload a document with metadata"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Read file
        with open(file_path, "rb") as f:
            files = {"files": (file_path.name, f, "application/octet-stream")}
            
            # Upload file
            response = await client.post(
                f"{API_BASE}/upload",
                headers=headers,
                files=files
            )
            
            if response.status_code == 201:
                uploaded_docs = response.json()
                if isinstance(uploaded_docs, list) and len(uploaded_docs) > 0:
                    doc = uploaded_docs[0]
                    doc_id = doc.get("id")
                    doc_name = doc.get("name")
                    
                    # Update metadata with tags and custom metadata
                    update_data = {}
                    if doc_meta.get("tags"):
                        update_data["tags"] = doc_meta["tags"]
                    if doc_meta.get("custom_metadata"):
                        update_data["custom_metadata"] = doc_meta["custom_metadata"]
                    
                    if update_data:
                        await client.put(
                            f"{API_BASE}/metadata/{doc_name}",
                            headers=headers,
                            json=update_data
                        )
                    
                    # Add comments
                    if doc_meta.get("comments") and doc_id:
                        for comment_text in doc_meta["comments"]:
                            await client.post(
                                f"{API_BASE}/documents/{doc_id}/comments",
                                headers=headers,
                                json={"comment": comment_text}
                            )
                    
                    print(f"✅ Uploaded: {doc_meta['name']}")
                    return doc_id
        return None
    except Exception as e:
        print(f"❌ Error uploading {doc_meta['name']}: {e}")
        return None


async def main():
    """Main seeding function"""
    print("🌱 Starting DocFlow Data Seeding...")
    print("=" * 50)
    
    # Create sample files directory
    sample_dir = Path("scripts/sample_files")
    sample_dir.mkdir(exist_ok=True)
    
    # Create sample file contents
    file_contents = {
        "Project_Requirements.pdf": "Project Requirements Document\n\n1. User Authentication\n2. Document Management\n3. File Upload/Download\n4. Search and Filter\n5. Comments and Tags",
        "Meeting_Notes_2024.md": "# Meeting Notes - November 2024\n\n## Agenda\n- Project status update\n- Next steps\n- Action items\n\n## Decisions\n- Approved new features\n- Assigned tasks to team",
        "API_Documentation.docx": "API Documentation\n\nEndpoints:\n- POST /v2/u/register\n- POST /v2/u/login\n- GET /v2/metadata\n- POST /v2/upload",
        "Budget_Report_2024.xlsx": "Budget Report 2024\n\nQ1: $100,000\nQ2: $120,000\nQ3: $110,000\nQ4: $130,000\n\nTotal: $460,000",
        "Design_Mockups.png": "Design Mockups\n\nUI Components:\n- Dashboard\n- Document List\n- Upload Modal\n- Detail View",
        "User_Guide.pdf": "User Guide\n\nChapter 1: Getting Started\nChapter 2: Uploading Documents\nChapter 3: Managing Files\nChapter 4: Sharing Documents",
        "Security_Audit_Report.pdf": "Security Audit Report\n\nFindings:\n- All systems secure\n- No vulnerabilities found\n- Recommendations implemented",
        "Database_Schema.sql": "-- Database Schema\n\nCREATE TABLE users (...);\nCREATE TABLE document_metadata (...);\nCREATE TABLE document_comments (...);"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Step 1: Create users
        print("\n📝 Creating users...")
        for user in SAMPLE_USERS:
            await create_user(client, user)
        
        # Step 2: Login as admin and upload documents
        print("\n📤 Logging in as admin and uploading documents...")
        admin_token = await login_user(client, SAMPLE_USERS[0]["email"], SAMPLE_USERS[0]["password"], SAMPLE_USERS[0]["username"])
        
        if admin_token:
            headers = {"Authorization": f"Bearer {admin_token}"}
            
            for doc_meta in SAMPLE_DOCUMENTS:
                # Create sample file
                filename = doc_meta["name"]
                content = file_contents.get(filename, f"Sample content for {filename}")
                file_path = await create_sample_file(filename, content)
                
                # Upload document
                await upload_document(client, admin_token, file_path, doc_meta)
            
            # Create a document in trash
            print("\n🗑️  Creating document in trash...")
            trash_file = await create_sample_file("Deleted_Document.txt", "This document is in trash")
            await upload_document(client, admin_token, trash_file, {
                "name": "Deleted_Document.txt",
                "tags": ["deleted"],
                "custom_metadata": {"Status": "Deleted"}
            })
            
            # Get the document and delete it
            try:
                response = await client.get(f"{API_BASE}/metadata?limit=100", headers=headers)
                if response.status_code == 200:
                    docs = response.json().get("documents of ", [])
                    for doc in docs:
                        if doc.get("name") == "Deleted_Document.txt":
                            await client.delete(f"{API_BASE}/{doc['name']}", headers=headers)
                            print("✅ Created document in trash")
                            break
            except Exception as e:
                print(f"⚠️  Could not create trash document: {e}")
        
        # Step 3: Login as other users and create some documents
        print("\n👥 Creating documents for other users...")
        for user in SAMPLE_USERS[1:3]:  # john and jane
            token = await login_user(client, user["email"], user["password"], user["username"])
            if token:
                # Create a few documents for each user
                user_docs = SAMPLE_DOCUMENTS[:2]  # First 2 documents
                for doc_meta in user_docs:
                    filename = doc_meta["name"]
                    content = file_contents.get(filename, f"Sample content for {filename}")
                    file_path = await create_sample_file(f"{user['username']}_{filename}", content)
                    
                    doc_meta_copy = doc_meta.copy()
                    doc_meta_copy["name"] = f"{user['username']}_{filename}"
                    await upload_document(client, token, file_path, doc_meta_copy)
    
    print("\n" + "=" * 50)
    print("✅ Seeding completed!")
    print("\n📋 Test Users Created:")
    for user in SAMPLE_USERS:
        print(f"   Email: {user['email']}")
        print(f"   Password: {user['password']}")
    print("\n📄 Sample documents uploaded with:")
    print("   - Tags")
    print("   - Custom metadata")
    print("   - Comments")
    print("\n🚀 You can now test the application!")


if __name__ == "__main__":
    asyncio.run(main())

