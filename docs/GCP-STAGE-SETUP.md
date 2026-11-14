# Preparar el deploy de Landing a Cloud Run

Este procedimiento configura el proyecto personal de demo `cispar-demo-axel-20261113` para que el workflow de GitHub publique únicamente los pushes a `stage`. No usa Firebase ni llaves JSON. No ejecutar el deploy antes de confirmar un límite mensual de gasto y habilitar billing.

## 1. Verificar identidad y preparar variables locales

```bash
gcloud auth list
gcloud config set project cispar-demo-axel-20261113
PROJECT_ID=cispar-demo-axel-20261113
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
REGION=us-central1
DEPLOYER_SA=cispar-landing-stage-deployer
RUNTIME_SA=cispar-landing-stage-runtime
POOL_ID=github-actions
PROVIDER_ID=landing-stage
```

Confirma que `gcloud auth list` muestre la cuenta personal `axeliparrea17@gmail.com` como activa. No uses perfiles ni credenciales de Kashio.

## 2. Habilitar APIs y crear identidades

Una vez autorizado el presupuesto y billing, ejecuta:

```bash
gcloud services enable \
  iamcredentials.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  --project "$PROJECT_ID"

gcloud iam service-accounts create "$DEPLOYER_SA" --project "$PROJECT_ID"
gcloud iam service-accounts create "$RUNTIME_SA" --project "$PROJECT_ID"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$DEPLOYER_SA@$PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/run.sourceDeveloper
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$DEPLOYER_SA@$PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/serviceusage.serviceUsageConsumer
gcloud iam service-accounts add-iam-policy-binding \
  "$RUNTIME_SA@$PROJECT_ID.iam.gserviceaccount.com" \
  --project "$PROJECT_ID" \
  --member="serviceAccount:$DEPLOYER_SA@$PROJECT_ID.iam.gserviceaccount.com" \
  --role=roles/iam.serviceAccountUser
```

## 3. Restringir GitHub OIDC a este repo y a `stage`

```bash
gcloud iam workload-identity-pools create "$POOL_ID" \
  --project "$PROJECT_ID" --location=global \
  --display-name='GitHub Actions for CISPAR Landing'

gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project "$PROJECT_ID" --location=global \
  --workload-identity-pool="$POOL_ID" \
  --display-name='CISPAR Landing stage branch' \
  --issuer-uri='https://token.actions.githubusercontent.com' \
  --attribute-mapping='google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref' \
  --attribute-condition="assertion.repository == 'Cispar-siem/Landing-page' && assertion.ref == 'refs/heads/stage'"

gcloud iam service-accounts add-iam-policy-binding \
  "$DEPLOYER_SA@$PROJECT_ID.iam.gserviceaccount.com" \
  --project "$PROJECT_ID" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/attribute.repository/Cispar-siem/Landing-page"
```

## 4. Configurar variables del repositorio GitHub

```bash
gh variable set GCP_PROJECT_ID --repo Cispar-siem/Landing-page --body "$PROJECT_ID"
gh variable set GCP_REGION --repo Cispar-siem/Landing-page --body "$REGION"
gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER --repo Cispar-siem/Landing-page \
  --body "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/providers/$PROVIDER_ID"
gh variable set GCP_SERVICE_ACCOUNT --repo Cispar-siem/Landing-page \
  --body "$DEPLOYER_SA@$PROJECT_ID.iam.gserviceaccount.com"
gh variable set GCP_RUNTIME_SERVICE_ACCOUNT --repo Cispar-siem/Landing-page \
  --body "$RUNTIME_SA@$PROJECT_ID.iam.gserviceaccount.com"
```

El job seguirá omitido hasta que existan estas variables. Con ellas configuradas, un push validado a `stage` ejecuta Cloud Run source deploy; GitHub Actions no mantiene llaves de servicio. Las variables existentes `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_PLATFORM_API_URL` se leen en el paso de build si aplican al demo.

El proyecto debe tener billing activo para desplegar Cloud Run/Cloud Build. Cloud Run puede escalar a cero y el servicio se limita a una instancia, pero eso no fija un techo de gasto mensual. Consultar el presupuesto en Cloud Billing antes del primer deploy.
