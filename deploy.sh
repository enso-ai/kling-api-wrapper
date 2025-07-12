gcloud run deploy kling-client-next \
    --source . \
    --region us-west1 \
    --build-service-account "projects/pure-lantern-394915/serviceAccounts/cloud-build@pure-lantern-394915.iam.gserviceaccount.com" \
    --service-account "playground@pure-lantern-394915.iam.gserviceaccount.com" \
    --set-secrets="OPENAI_API_KEY=playground-openai-secret:latest,KLING_KEYS=kling-api-keys:latest"
