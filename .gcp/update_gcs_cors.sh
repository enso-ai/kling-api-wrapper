gsutil cors set cors.json gs://enso-playground-storage

echo "GCS updated, fetch current state for verification"

gsutil cors get gs://enso-playground-storage

