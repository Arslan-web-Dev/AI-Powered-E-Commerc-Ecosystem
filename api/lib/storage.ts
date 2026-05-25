import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './env';
import { logger } from './env';

// S3 Client configuration
const s3Client = new S3Client({
  region: env.awsRegion || 'us-east-1',
  credentials: {
    accessKeyId: env.awsAccessKeyId || '',
    secretAccessKey: env.awsSecretAccessKey || '',
  },
});

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
  bucket: string = env.awsBucket || 'nexusai-commerce'
): Promise<{ url: string; key: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const url = `https://${bucket}.s3.${env.awsRegion || 'us-east-1'}.amazonaws.com/${key}`;
    
    logger.info({ key, bucket }, 'File uploaded to S3');
    
    return { url, key };
  } catch (error) {
    logger.error({ error, key }, 'S3 upload error');
    throw new Error('Failed to upload file');
  }
}

export async function getFileUrl(
  key: string,
  expiresIn: number = 3600,
  bucket: string = env.awsBucket || 'nexusai-commerce'
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    logger.error({ error, key }, 'S3 get URL error');
    throw new Error('Failed to get file URL');
  }
}

export async function deleteFile(
  key: string,
  bucket: string = env.awsBucket || 'nexusai-commerce'
): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
    
    logger.info({ key, bucket }, 'File deleted from S3');
  } catch (error) {
    logger.error({ error, key }, 'S3 delete error');
    throw new Error('Failed to delete file');
  }
}

export function generateKey(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = filename.split('.').pop();
  return `${prefix}/${timestamp}-${random}.${extension}`;
}
