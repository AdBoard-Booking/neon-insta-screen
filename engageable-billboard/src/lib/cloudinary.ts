import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(imageBuffer: Buffer, folder: string = 'billboard-submissions') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(imageBuffer);
  });
}

export async function createFramedImage(imageUrl: string, name: string, instagramHandle?: string) {
  const textOverlay = instagramHandle 
    ? `${name} @${instagramHandle}` 
    : name;

  const transformation = [
    // Base image transformations
    { width: 600, height: 600, crop: 'fill', gravity: 'face' },
    
    // Add frame overlay (you'll need to upload a frame image to Cloudinary)
    {
      overlay: 'billboard-frame', // Replace with your actual frame image public_id
      width: 700,
      height: 700,
      gravity: 'center',
      crop: 'scale'
    },
    
    // Add text overlay
    {
      overlay: {
        font_family: 'Arial',
        font_size: 24,
        font_weight: 'bold',
        text: textOverlay,
        text_align: 'center'
      },
      gravity: 'south',
      y: 50,
      color: 'white',
      background: 'rgba(0,0,0,0.7)',
      padding: 10
    },
    
    // Add hashtag
    {
      overlay: {
        font_family: 'Arial',
        font_size: 18,
        text: '#MyBillboardMoment',
        text_align: 'center'
      },
      gravity: 'south',
      y: 10,
      color: '#FFD700',
      background: 'rgba(0,0,0,0.5)',
      padding: 8
    }
  ];

  return cloudinary.url(imageUrl, {
    transformation,
    secure: true,
    quality: 'auto',
    fetch_format: 'auto'
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}