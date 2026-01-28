#!/bin/bash
set -e
set -o pipefail

# Injected via CronJob env
export PGPASSWORD=$DB_PASSWORD
FILENAME="backup-$(date +%Y%m%d%H%M).sql.gz"
GCS_DESTINATION="gs://${BUCKET_NAME}/${K8S_NAMESPACE}/${FILENAME}"

echo "--- Starting Backup for Namespace: $K8S_NAMESPACE ---"

# Dump -> Gzip -> Temp file
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" | gzip > "/tmp/$FILENAME"

echo "Uploading to $GCS_DESTINATION..."
gsutil cp "/tmp/$FILENAME" "$GCS_DESTINATION"

echo "Backup Successful: $FILENAME"