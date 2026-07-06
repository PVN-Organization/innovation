import aioboto3
from botocore.exceptions import ClientError
from loguru import logger

from app.core.config import settings


class MinioService:
    """Async S3-compatible file storage backed by MinIO."""

    def __init__(self) -> None:
        self._session = aioboto3.Session()

    @property
    def _s3_kwargs(self) -> dict[str, str]:
        return {
            "endpoint_url": settings.MINIO_ENDPOINT,
            "aws_access_key_id": settings.MINIO_ACCESS_KEY,
            "aws_secret_access_key": settings.MINIO_SECRET_KEY,
        }

    async def upload_file_stream(
        self,
        bucket_name: str,
        object_name: str,
        file_data: bytes,
        content_type: str,
    ) -> bool:
        """Stream file data to a MinIO bucket without blocking the event loop."""
        async with self._session.client("s3", **self._s3_kwargs) as client:
            await client.put_object(
                Bucket=bucket_name,
                Key=object_name,
                Body=file_data,
                ContentType=content_type,
            )
            logger.info("Uploaded {} to {}", object_name, bucket_name)
            return True

    async def generate_presigned_download_url(
        self,
        bucket_name: str,
        object_name: str,
        expires_in_seconds: int = 3600,
    ) -> str:
        """Create a temporary signed URL for secure file download."""
        async with self._session.client("s3", **self._s3_kwargs) as client:
            return await client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": object_name},
                ExpiresIn=expires_in_seconds,
            )

    async def ensure_bucket_exists(self, bucket_name: str) -> None:
        """Idempotent check — create the bucket if it does not exist yet."""
        async with self._session.client("s3", **self._s3_kwargs) as client:
            try:
                await client.head_bucket(Bucket=bucket_name)
            except ClientError:
                await client.create_bucket(Bucket=bucket_name)
                logger.info("Created MinIO bucket: {}", bucket_name)


minio_service = MinioService()
