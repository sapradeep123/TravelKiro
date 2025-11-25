import boto3
import hashlib
import zipfile
import io
import os
from typing import List, BinaryIO, Optional, Tuple
from fastapi import UploadFile
from botocore.exceptions import ClientError
import tempfile
import shutil

from app.core.config import settings


class StorageService:
    """Service for handling file storage operations with S3/MinIO"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.s3_endpoint_url,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_key,
            region_name=settings.aws_region
        )
        self.bucket = settings.s3_bucket
    
    async def upload_file(self, file: UploadFile, storage_path: str) -> Tuple[int, str]:
        """
        Upload file to S3/MinIO
        Returns: (size_bytes, file_hash)
        """
        # Read file content
        content = await file.read()
        size_bytes = len(content)
        
        # Calculate hash
        file_hash = hashlib.sha256(content).hexdigest()
        
        # Upload to S3
        try:
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=storage_path,
                Body=content,
                ContentType=file.content_type or 'application/octet-stream'
            )
        except ClientError as e:
            raise Exception(f"Failed to upload file: {str(e)}")
        
        # Reset file pointer
        await file.seek(0)
        
        return size_bytes, file_hash
    
    async def download_file(self, storage_path: str) -> bytes:
        """Download file from S3/MinIO"""
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket,
                Key=storage_path
            )
            return response['Body'].read()
        except ClientError as e:
            raise Exception(f"Failed to download file: {str(e)}")
    
    async def delete_file(self, storage_path: str):
        """Delete file from S3/MinIO"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket,
                Key=storage_path
            )
        except ClientError as e:
            raise Exception(f"Failed to delete file: {str(e)}")
    
    async def extract_zip(self, zip_file: UploadFile) -> List[dict]:
        """
        Extract ZIP file and return list of files with their content
        Returns: List of {filename, content, size, path_parts}
        """
        extracted_files = []
        
        # Read ZIP content
        zip_content = await zip_file.read()
        
        try:
            with zipfile.ZipFile(io.BytesIO(zip_content)) as zf:
                for file_info in zf.filelist:
                    # Skip directories
                    if file_info.is_dir():
                        continue
                    
                    # Extract file
                    file_content = zf.read(file_info.filename)
                    
                    # Parse path
                    path_parts = file_info.filename.split('/')
                    filename = path_parts[-1]
                    folder_path = path_parts[:-1] if len(path_parts) > 1 else []
                    
                    extracted_files.append({
                        'filename': filename,
                        'content': file_content,
                        'size': len(file_content),
                        'folder_path': folder_path,
                        'original_path': file_info.filename
                    })
        except zipfile.BadZipFile:
            raise Exception("Invalid ZIP file")
        
        return extracted_files
    
    async def create_zip(self, files: List[dict]) -> bytes:
        """
        Create ZIP file from list of files
        files: List of {storage_path, filename, folder_path}
        Returns: ZIP file content as bytes
        """
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for file_info in files:
                try:
                    # Download file from S3
                    file_content = await self.download_file(file_info['storage_path'])
                    
                    # Construct path in ZIP
                    if file_info.get('folder_path'):
                        zip_path = f"{'/'.join(file_info['folder_path'])}/{file_info['filename']}"
                    else:
                        zip_path = file_info['filename']
                    
                    # Add to ZIP
                    zf.writestr(zip_path, file_content)
                except Exception as e:
                    print(f"Failed to add {file_info['filename']} to ZIP: {str(e)}")
                    continue
        
        zip_buffer.seek(0)
        return zip_buffer.read()
    
    async def get_file_url(self, storage_path: str, expires_in: int = 3600) -> str:
        """Generate presigned URL for file download"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': storage_path
                },
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            raise Exception(f"Failed to generate URL: {str(e)}")
    
    def file_exists(self, storage_path: str) -> bool:
        """Check if file exists in S3/MinIO"""
        try:
            self.s3_client.head_object(Bucket=self.bucket, Key=storage_path)
            return True
        except ClientError:
            return False


# Singleton instance
storage_service = StorageService()
