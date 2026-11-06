#!/usr/bin/env python3
"""Create a local-only S3 release catalog and a clearly fake download artifact."""

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import boto3
from botocore.config import Config


ENDPOINT = os.environ.get("MOTO_ENDPOINT", "http://127.0.0.1:5000")
BUCKET = "cispar-local-releases"
FIXTURE = Path(__file__).parent / "fixtures" / "README.txt"
OBJECT_KEY = "fixtures/cispar-agent-linux-amd64-test-fixture.txt"


def main() -> None:
    endpoint = urlparse(ENDPOINT)
    if endpoint.scheme != "http" or endpoint.hostname not in {"localhost", "127.0.0.1"} or endpoint.port != 5000:
        raise ValueError("This seeder only accepts local Moto on HTTP loopback port 5000")
    payload = FIXTURE.read_bytes()
    client = boto3.client(
        "s3",
        endpoint_url=ENDPOINT,
        region_name="us-east-1",
        aws_access_key_id="moto",
        aws_secret_access_key="moto",
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )

    buckets = {entry["Name"] for entry in client.list_buckets().get("Buckets", [])}
    if BUCKET not in buckets:
        client.create_bucket(Bucket=BUCKET)

    # The bucket is reachable only through the loopback-bound Moto container.
    # This public-read policy exists solely so the browser can fetch its test manifest.
    client.put_bucket_policy(
        Bucket=BUCKET,
        Policy=json.dumps(
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "AllowLocalBrowserReads",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{BUCKET}/releases.json",
                    }
                ],
            }
        ),
    )

    client.put_bucket_cors(
        Bucket=BUCKET,
        CORSConfiguration={
            "CORSRules": [
                {
                    "AllowedOrigins": ["http://localhost:5173", "http://127.0.0.1:5173"],
                    "AllowedMethods": ["GET", "HEAD"],
                    "AllowedHeaders": ["*"],
                    "ExposeHeaders": ["ETag", "Content-Length"],
                    "MaxAgeSeconds": 300,
                }
            ]
        },
    )
    client.put_object(
        Bucket=BUCKET,
        Key=OBJECT_KEY,
        Body=payload,
        ContentType="text/plain; charset=utf-8",
        ContentDisposition='attachment; filename="cispar-agent-local-moto-fixture.txt"',
    )
    url = client.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET, "Key": OBJECT_KEY},
        ExpiresIn=3600,
    )
    manifest = {
        "releases": [
            {
                "id": "ubuntu-x64-local-moto-fixture",
                "os": "linux",
                "arch": "x64",
                "label": "Ubuntu Server LTS · x64 (fixture Moto; no instalar)",
                "requirements": "Artefacto de prueba local; no es un instalador CISPAR.",
                "version": "0.0.0-local-moto",
                "url": url,
                "sha256": hashlib.sha256(payload).hexdigest(),
                "sizeBytes": len(payload),
                "publishedAt": datetime.now(timezone.utc).isoformat(),
                "channel": "beta",
                "available": True,
            }
        ]
    }
    client.put_object(
        Bucket=BUCKET,
        Key="releases.json",
        Body=json.dumps(manifest, indent=2).encode(),
        ContentType="application/json",
        CacheControl="no-store",
    )
    print(f"Seeded local Moto bucket s3://{BUCKET}/releases.json")
    print(f"Fake test fixture SHA-256: {hashlib.sha256(payload).hexdigest()}")
    print("This fixture is not an installer and must not be installed or published.")


if __name__ == "__main__":
    main()
