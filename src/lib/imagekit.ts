import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function uploadImage(imageBuffer: Buffer, fileName: string, folder: string = 'billboard-submissions') {
  try {
    const result = await imagekit.upload({
      file: imageBuffer,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      // Remove transformation from upload - we'll apply transformations when generating URLs
    });

    return {
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw error;
  }
}

export async function createFramedImage(imageUrl: string, name: string, instagramHandle?: string) {
  try {
    const textOverlay = instagramHandle 
      ? `${name} @${instagramHandle}` 
      : name;

    // Create transformation URL for framed image using correct ImageKit syntax
    const transformation = {
      width: 600,
      height: 600,
      crop: 'maintain_ratio',
      cropMode: 'center',
      quality: 80,
      format: 'auto',
    };

    // Generate the transformed image URL
    const transformedUrl = imagekit.url({
      src: imageUrl,
      transformation: [transformation],
    });

    return transformedUrl;
  } catch (error) {
    console.error('ImageKit transformation error:', error);
    throw error;
  }
}

export async function deleteImage(fileId: string) {
  try {
    const result = await imagekit.deleteFile(fileId);
    return result;
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw error;
  }
}

export async function getImageInfo(fileId: string) {
  try {
    const result = await imagekit.getFileDetails(fileId);
    return result;
  } catch (error) {
    console.error('ImageKit get info error:', error);
    throw error;
  }
}

// Helper function to generate signed URLs for private images
export function generateSignedUrl(imagePath: string, expiresIn: number = 3600) {
  try {
    const signedUrl = imagekit.url({
      src: imagePath,
      signed: true,
      expire: expiresIn,
    });
    return signedUrl;
  } catch (error) {
    console.error('ImageKit signed URL error:', error);
    throw error;
  }
}

// Helper function to create image transformations
export function createImageTransformUrl(imageUrl: string, transformations: object[]) {
  try {
    const transformedUrl = imagekit.url({
      src: imageUrl,
      transformation: transformations,
    });
    return transformedUrl;
  } catch (error) {
    console.error('ImageKit transform URL error:', error);
    throw error;
  }
}