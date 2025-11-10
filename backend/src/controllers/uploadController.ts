import { Request, Response } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export class UploadController {
  async uploadPackageImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ 
          error: 'No files uploaded',
          message: 'Please select at least one image to upload'
        });
      }

      const uploadDir = path.join(__dirname, '../../uploads/packages');
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const urls: string[] = [];

      // Process each image with sharp
      for (const file of files) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const filename = `${uniqueSuffix}-${nameWithoutExt}.jpg`;
        const filepath = path.join(uploadDir, filename);

        // Compress and optimize image
        await sharp(file.buffer)
          .resize(1920, 1080, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85, 
            progressive: true 
          })
          .toFile(filepath);

        urls.push(`${baseUrl}/uploads/packages/${filename}`);
      }

      res.status(200).json({ 
        success: true, 
        urls,
        count: urls.length,
        message: `Successfully uploaded and optimized ${urls.length} image(s)`
      });
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error instanceof Error) {
        res.status(500).json({ 
          error: 'Upload failed',
          message: error.message
        });
      } else {
        res.status(500).json({ 
          error: 'Upload failed',
          message: 'An unexpected error occurred during upload'
        });
      }
    }
  }
}

export default new UploadController();
