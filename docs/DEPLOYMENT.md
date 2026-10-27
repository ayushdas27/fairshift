# FairShift Production Deployment Guide

This guide details deploying FairShift to **Vercel Serverless Production** and **Google Cloud Run** with **Cloud SQL (PostgreSQL)** and **Secret Manager**.

---

## 1. Live Vercel Production Deployment
- **Production URL:** [https://fairshift-sandy.vercel.app](https://fairshift-sandy.vercel.app)
- **Deployment URL:** [https://fairshift-12tshl38a-ayushdps2020-4199s-projects.vercel.app](https://fairshift-12tshl38a-ayushdps2020-4199s-projects.vercel.app)
- **Health Check Endpoint:** `https://fairshift-sandy.vercel.app/health`
- **Configuration:** `vercel.json` maps frontend static assets from `frontend/package.json` (`@vercel/static-build`) and routes `/api/v1/*`, `/health`, and `/docs` to `@vercel/python` via `api/index.py`.

Deploy command:
```bash
npx vercel --prod --yes
```

---

## 2. Google Cloud Run Deployment
- Google Cloud Platform (GCP) project with billing enabled.
- Google Cloud CLI (`gcloud`) installed and authenticated.
- Docker or Google Cloud Build.

---

## 2. Step-by-Step Deployment Procedure

### Step 1: Set Project & Enable Required Services
```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

### Step 2: Provision Cloud SQL for PostgreSQL
```bash
gcloud sql instances create fairshift-pg \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

gcloud sql databases create fairshift_db --instance=fairshift-pg

gcloud sql users create fs_user \
  --instance=fairshift-pg \
  --password=YOUR_STRONG_PASSWORD
```

### Step 3: Store Sensitive Configuration in Secret Manager
```bash
echo -n "postgresql://fs_user:YOUR_STRONG_PASSWORD@/fairshift_db?host=/cloudsql/YOUR_PROJECT_ID:us-central1:fairshift-pg" | \
  gcloud secrets create fairshift-db-url --data-file=-

echo -n "$(openssl rand -hex 32)" | \
  gcloud secrets create fairshift-secret-key --data-file=-
```

### Step 4: Build and Deploy to Cloud Run using Cloud Build
```bash
# Build the container directly in Google Cloud Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/fairshift:latest

# Deploy to Cloud Run with Cloud SQL connection & Secret injection
gcloud run deploy fairshift \
  --image gcr.io/YOUR_PROJECT_ID/fairshift:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets DATABASE_URL=fairshift-db-url:latest,SECRET_KEY=fairshift-secret-key:latest \
  --add-cloudsql-instances YOUR_PROJECT_ID:us-central1:fairshift-pg \
  --set-env-vars APP_ENV=production,PORT=8080
```

### Step 5: Verify Deployment
Once deployed, Cloud Run outputs the service URL (e.g. `https://fairshift-xyz-uc.a.run.app`).
Verify the deployment with:
```bash
curl -f https://fairshift-xyz-uc.a.run.app/health
```
