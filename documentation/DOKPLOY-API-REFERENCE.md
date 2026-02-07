# Dokploy API Reference for Verbum Lucis

Complete API endpoint reference for programmatic Dokploy management.

---

## Authentication

All requests require the API key in the Authorization header:

```bash
Authorization: Bearer IZrOXWFMbypiYRCQYImeFZFAfLWCjevvVpIdymbmZPsLDWqofeoPyCTcdzBVUObW
```

### Example Request

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:3000/api/projects
```

---

## Base URL

```
http://your-dokploy-instance:3000/api
```

### Local Development
```
http://localhost:3000/api
```

### Production (if exposed)
```
https://your-dokploy-domain.com/api
```

---

## Projects

### List Projects

```bash
GET /projects
```

**Response:**
```json
{
  "data": [
    {
      "projectId": "proj_abc123",
      "name": "Verbum Lucis",
      "description": "Italian Catholic spiritual portal"
    }
  ]
}
```

### Create Project

```bash
POST /projects
Content-Type: application/json

{
  "name": "Verbum Lucis",
  "description": "Italian Catholic spiritual portal"
}
```

**Response:**
```json
{
  "projectId": "proj_abc123",
  "name": "Verbum Lucis",
  "description": "Italian Catholic spiritual portal"
}
```

### Get Project Details

```bash
GET /projects/{projectId}
```

**Response:**
```json
{
  "projectId": "proj_abc123",
  "name": "Verbum Lucis",
  "description": "Italian Catholic spiritual portal",
  "createdAt": "2026-02-07T10:00:00Z",
  "services": [
    {
      "id": "svc_123",
      "name": "verbum-lucis-production",
      "type": "docker-compose"
    }
  ]
}
```

### Delete Project

```bash
DELETE /projects/{projectId}
```

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

---

## Docker Compose Services

### Create Docker Compose Service

```bash
POST /projects/{projectId}/docker-compose
Content-Type: application/json

{
  "name": "verbum-lucis-production",
  "dockerComposeFile": "version: '3.8'\nservices:\n  app:\n    image: node:20\n...",
  "environment": {
    "DB_PASSWORD": "secure_password_123",
    "SITE_URL": "https://verbumlucis.it",
    "NODE_ENV": "production"
  },
  "sourceType": "docker-compose"
}
```

**Response:**
```json
{
  "id": "dc_abc123",
  "projectId": "proj_abc123",
  "name": "verbum-lucis-production",
  "status": "created",
  "environment": {
    "DB_PASSWORD": "***",
    "SITE_URL": "https://verbumlucis.it",
    "NODE_ENV": "production"
  }
}
```

### Get Docker Compose Service

```bash
GET /docker-compose/{dockerComposeId}
```

**Response:**
```json
{
  "id": "dc_abc123",
  "projectId": "proj_abc123",
  "name": "verbum-lucis-production",
  "status": "running",
  "healthStatus": "healthy",
  "containers": [
    {
      "name": "verbum-lucis-app",
      "status": "running",
      "healthStatus": "healthy"
    },
    {
      "name": "verbum-lucis-db",
      "status": "running",
      "healthStatus": "healthy"
    }
  ],
  "createdAt": "2026-02-07T10:00:00Z"
}
```

### List Services in Project

```bash
GET /projects/{projectId}/services
```

### Deploy Docker Compose Service

```bash
POST /docker-compose/{dockerComposeId}/deploy
```

**Optional Request Body:**
```json
{
  "rebuild": true,
  "pullLatest": true
}
```

**Response:**
```json
{
  "deploymentId": "dep_abc123",
  "status": "deploying",
  "message": "Deployment started"
}
```

### Stop Docker Compose Service

```bash
POST /docker-compose/{dockerComposeId}/stop
```

### Restart Docker Compose Service

```bash
POST /docker-compose/{dockerComposeId}/restart
```

### Update Environment Variables

```bash
PUT /docker-compose/{dockerComposeId}/environment
Content-Type: application/json

{
  "DB_PASSWORD": "new_secure_password",
  "SITE_URL": "https://verbumlucis.it"
}
```

### Delete Docker Compose Service

```bash
DELETE /docker-compose/{dockerComposeId}
```

---

## Deployments

### Get Deployment Status

```bash
GET /deployments/{deploymentId}
```

**Response:**
```json
{
  "deploymentId": "dep_abc123",
  "status": "success",
  "startedAt": "2026-02-07T10:05:00Z",
  "completedAt": "2026-02-07T10:15:00Z",
  "logs": "[INFO] Building Docker image...\n[INFO] Pulling image...\n[SUCCESS] Deployment completed"
}
```

### List Deployments

```bash
GET /docker-compose/{dockerComposeId}/deployments
```

**Query Parameters:**
- `limit`: Number of results (default: 10)
- `offset`: Number to skip (default: 0)

**Response:**
```json
{
  "data": [
    {
      "deploymentId": "dep_abc123",
      "status": "success",
      "startedAt": "2026-02-07T10:05:00Z"
    }
  ],
  "total": 5
}
```

### Get Deployment Logs

```bash
GET /deployments/{deploymentId}/logs
```

**Query Parameters:**
- `tail`: Last N lines (default: 100)

**Response:**
```json
{
  "logs": "[INFO] Starting deployment...\n[INFO] Building services...\n[SUCCESS] Done"
}
```

---

## Backups (PostgreSQL)

### Create Backup

```bash
POST /docker-compose/{dockerComposeId}/backup
Content-Type: application/json

{
  "description": "Pre-production backup"
}
```

**Response:**
```json
{
  "backupId": "bak_abc123",
  "status": "creating",
  "description": "Pre-production backup"
}
```

### List Backups

```bash
GET /docker-compose/{dockerComposeId}/backups
```

**Response:**
```json
{
  "data": [
    {
      "backupId": "bak_abc123",
      "status": "completed",
      "size": "125MB",
      "createdAt": "2026-02-07T10:00:00Z"
    }
  ]
}
```

### Restore from Backup

```bash
POST /backups/{backupId}/restore
```

**Response:**
```json
{
  "status": "restoring",
  "message": "Restore operation started"
}
```

### Delete Backup

```bash
DELETE /backups/{backupId}
```

---

## Logs & Monitoring

### Get Service Logs

```bash
GET /docker-compose/{dockerComposeId}/logs
```

**Query Parameters:**
- `tail`: Last N lines (default: 100)
- `since`: Timestamp (ISO 8601)
- `until`: Timestamp (ISO 8601)

**Response:**
```json
{
  "logs": "2026-02-07T10:00:00Z app[1234]: Server listening on port 4321\n..."
}
```

### Get Container Logs

```bash
GET /containers/{containerId}/logs
```

### Get Real-time Metrics

```bash
GET /docker-compose/{dockerComposeId}/metrics
```

**Response:**
```json
{
  "cpu": 15.5,
  "memory": {
    "used": 512,
    "total": 2048
  },
  "network": {
    "in": 1024000,
    "out": 512000
  }
}
```

---

## Common API Workflows

### Workflow 1: Complete Deployment from Scratch

```bash
#!/bin/bash

API_KEY="your-api-key"
DOKPLOY_URL="http://localhost:3000/api"

# 1. Create project
PROJECT=$(curl -s -X POST "$DOKPLOY_URL/projects" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Verbum Lucis"}')
PROJECT_ID=$(echo $PROJECT | jq -r '.projectId')

# 2. Create Docker Compose service
COMPOSE=$(curl -s -X POST "$DOKPLOY_URL/projects/$PROJECT_ID/docker-compose" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "production",
    "dockerComposeFile": "...",
    "environment": {"DB_PASSWORD": "..."}
  }')
COMPOSE_ID=$(echo $COMPOSE | jq -r '.id')

# 3. Deploy
curl -s -X POST "$DOKPLOY_URL/docker-compose/$COMPOSE_ID/deploy" \
  -H "Authorization: Bearer $API_KEY"

# 4. Monitor
while true; do
  STATUS=$(curl -s -H "Authorization: Bearer $API_KEY" \
    "$DOKPLOY_URL/docker-compose/$COMPOSE_ID" | jq -r '.healthStatus')
  echo "Status: $STATUS"
  [ "$STATUS" = "healthy" ] && break
  sleep 5
done

echo "Deployment complete!"
```

### Workflow 2: Update Environment Variables and Redeploy

```bash
#!/bin/bash

API_KEY="your-api-key"
DOKPLOY_URL="http://localhost:3000/api"
COMPOSE_ID="dc_abc123"

# Update environment
curl -s -X PUT "$DOKPLOY_URL/docker-compose/$COMPOSE_ID/environment" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "DB_PASSWORD": "new-password",
    "NODE_ENV": "production"
  }'

# Redeploy
curl -s -X POST "$DOKPLOY_URL/docker-compose/$COMPOSE_ID/deploy" \
  -H "Authorization: Bearer $API_KEY"

echo "Environment updated and redeployed"
```

### Workflow 3: Backup and Restore

```bash
#!/bin/bash

API_KEY="your-api-key"
DOKPLOY_URL="http://localhost:3000/api"
COMPOSE_ID="dc_abc123"

# Create backup
BACKUP=$(curl -s -X POST "$DOKPLOY_URL/docker-compose/$COMPOSE_ID/backup" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"description": "Pre-maintenance backup"}')
BACKUP_ID=$(echo $BACKUP | jq -r '.backupId')

echo "Backup created: $BACKUP_ID"

# Wait for backup to complete
while true; do
  STATUS=$(curl -s -H "Authorization: Bearer $API_KEY" \
    "$DOKPLOY_URL/backups/$BACKUP_ID" | jq -r '.status')
  [ "$STATUS" = "completed" ] && break
  sleep 5
done

# Restore if needed
# curl -s -X POST "$DOKPLOY_URL/backups/$BACKUP_ID/restore" \
#   -H "Authorization: Bearer $API_KEY"

echo "Backup completed successfully"
```

### Workflow 4: Monitor Deployment Progress

```bash
#!/bin/bash

API_KEY="your-api-key"
DOKPLOY_URL="http://localhost:3000/api"
DEPLOYMENT_ID="dep_abc123"

# Get deployment status
STATUS=$(curl -s -H "Authorization: Bearer $API_KEY" \
  "$DOKPLOY_URL/deployments/$DEPLOYMENT_ID" | jq '.')

echo "Deployment Status:"
echo "$STATUS" | jq '.status'

# Get logs
echo ""
echo "Deployment Logs:"
curl -s -H "Authorization: Bearer $API_KEY" \
  "$DOKPLOY_URL/deployments/$DEPLOYMENT_ID/logs" | jq -r '.logs'
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "error": "Invalid or missing API key",
  "statusCode": 401
}
```

**404 Not Found**
```json
{
  "error": "Project not found",
  "statusCode": 404
}
```

**400 Bad Request**
```json
{
  "error": "Invalid request body",
  "statusCode": 400,
  "details": "Required field 'name' is missing"
}
```

**500 Server Error**
```json
{
  "error": "Internal server error",
  "statusCode": 500,
  "requestId": "req_abc123"
}
```

---

## Rate Limiting

Dokploy API typically has these limits:
- **Requests per minute:** 60
- **Concurrent requests:** 5
- **Deployment size limit:** 100MB

Monitor `X-RateLimit-*` headers in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1644234600
```

---

## Testing API Calls

### Using curl

```bash
# Set variables
API_KEY="your-api-key"
DOKPLOY_URL="http://localhost:3000/api"

# List projects
curl -H "Authorization: Bearer $API_KEY" "$DOKPLOY_URL/projects" | jq

# Create project
curl -X POST "$DOKPLOY_URL/projects" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}' | jq
```

### Using httpie

```bash
# Install: pip install httpie

http http://localhost:3000/api/projects \
  Authorization:"Bearer $API_KEY"

http POST http://localhost:3000/api/projects \
  Authorization:"Bearer $API_KEY" \
  name="Test" \
  description="Test project"
```

### Using Postman

1. Set base URL: `http://localhost:3000/api`
2. Create environment variable: `API_KEY` = your key
3. Add header: `Authorization: Bearer {{API_KEY}}`
4. Import endpoints from this reference

---

## Webhook Integration (if available)

Some Dokploy versions support webhooks for:
- Deployment started
- Deployment completed
- Deployment failed
- Container health changed

Check Dokploy documentation for webhook endpoint format.

---

## Rate Limiting Best Practices

```bash
#!/bin/bash

# Simple rate limiter for API calls
rate_limit() {
  local delay=1  # seconds between requests
  echo "Request $(date)"
  sleep $delay
}

API_KEY="your-api-key"
DOKPLOY_URL="http://localhost:3000/api"

# Process multiple items with rate limiting
for id in {1..10}; do
  curl -s -H "Authorization: Bearer $API_KEY" \
    "$DOKPLOY_URL/projects/proj_$id" | jq '.'
  rate_limit
done
```

---

## Version Notes

- **Dokploy v0.26+:** Full Docker Compose support
- **Dokploy v0.25:** Basic project management
- **Dokploy v0.20:** Limited API endpoints

This reference is for **Dokploy v0.26+**

---

## Additional Resources

- Official API Docs: https://docs.dokploy.com/api
- GitHub Issues: https://github.com/Dokploy/dokploy/issues
- Community Discussions: https://github.com/Dokploy/dokploy/discussions

---

**Last Updated:** 2026-02-07

For the Verbum Lucis deployment, focus on:
1. **Projects** - Create and manage projects
2. **Docker Compose** - Deploy services
3. **Deployments** - Monitor deployment status
4. **Backups** - Automated database backups


Dokploy API
 1.0.0 
OAS 3.0
Endpoints for dokploy

https://vps.eternalservices.ca/api/settings.getOpenApiDocument
Servers

https://vps.eternalservices.ca/api

Authorize
admin


POST
/admin.setupMonitoring


docker


GET
/docker.getContainers



POST
/docker.restartContainer



GET
/docker.getConfig



GET
/docker.getContainersByAppNameMatch



GET
/docker.getContainersByAppLabel



GET
/docker.getStackContainersByAppName



GET
/docker.getServiceContainersByAppName


compose


POST
/compose.create



GET
/compose.one



POST
/compose.update



POST
/compose.delete



POST
/compose.cleanQueues



POST
/compose.killBuild



GET
/compose.loadServices



GET
/compose.loadMountsByService



POST
/compose.fetchSourceType



POST
/compose.randomizeCompose



POST
/compose.isolatedDeployment



GET
/compose.getConvertedCompose



POST
/compose.deploy



POST
/compose.redeploy



POST
/compose.stop



POST
/compose.start



GET
/compose.getDefaultCommand



POST
/compose.refreshToken



POST
/compose.deployTemplate



GET
/compose.templates



GET
/compose.getTags



POST
/compose.disconnectGitProvider



POST
/compose.move



POST
/compose.processTemplate



POST
/compose.import



POST
/compose.cancelDeployment


registry


POST
/registry.create



POST
/registry.remove



POST
/registry.update



GET
/registry.all



GET
/registry.one



POST
/registry.testRegistry



POST
/registry.testRegistryById


cluster


GET
/cluster.getNodes



POST
/cluster.removeWorker



GET
/cluster.addWorker



GET
/cluster.addManager


user


GET
/user.all



GET
/user.one



GET
/user.get



GET
/user.haveRootAccess



GET
/user.getBackups



GET
/user.getServerMetrics



POST
/user.update



GET
/user.getUserByToken



GET
/user.getMetricsToken



POST
/user.remove



POST
/user.assignPermissions



GET
/user.getInvitations



GET
/user.getContainerMetrics



POST
/user.generateToken



POST
/user.deleteApiKey



POST
/user.createApiKey



GET
/user.checkUserOrganizations



POST
/user.sendInvitation


domain


POST
/domain.create



GET
/domain.byApplicationId



GET
/domain.byComposeId



POST
/domain.generateDomain



GET
/domain.canGenerateTraefikMeDomains



POST
/domain.update



GET
/domain.one



POST
/domain.delete



POST
/domain.validateDomain


destination


POST
/destination.create



POST
/destination.testConnection



GET
/destination.one



GET
/destination.all



POST
/destination.remove



POST
/destination.update


backup


POST
/backup.create



GET
/backup.one



POST
/backup.update



POST
/backup.remove



POST
/backup.manualBackupPostgres



POST
/backup.manualBackupMySql



POST
/backup.manualBackupMariadb



POST
/backup.manualBackupCompose



POST
/backup.manualBackupMongo



POST
/backup.manualBackupWebServer



GET
/backup.listBackupFiles


deployment


GET
/deployment.all



GET
/deployment.allByCompose



GET
/deployment.allByServer



GET
/deployment.allByType



POST
/deployment.killProcess


mounts


POST
/mounts.create



POST
/mounts.remove



GET
/mounts.one



POST
/mounts.update



GET
/mounts.allNamedByApplicationId


certificates


POST
/certificates.create



GET
/certificates.one



POST
/certificates.remove



GET
/certificates.all


settings


GET
/settings.getWebServerSettings



POST
/settings.reloadServer



POST
/settings.cleanRedis



POST
/settings.reloadRedis



POST
/settings.reloadTraefik



POST
/settings.toggleDashboard



POST
/settings.cleanUnusedImages



POST
/settings.cleanUnusedVolumes



POST
/settings.cleanStoppedContainers



POST
/settings.cleanDockerBuilder



POST
/settings.cleanDockerPrune



POST
/settings.cleanAll



POST
/settings.cleanMonitoring



POST
/settings.saveSSHPrivateKey



POST
/settings.assignDomainServer



POST
/settings.cleanSSHPrivateKey



POST
/settings.updateDockerCleanup



GET
/settings.readTraefikConfig



POST
/settings.updateTraefikConfig



GET
/settings.readWebServerTraefikConfig



POST
/settings.updateWebServerTraefikConfig



GET
/settings.readMiddlewareTraefikConfig



POST
/settings.updateMiddlewareTraefikConfig



POST
/settings.getUpdateData



POST
/settings.updateServer



GET
/settings.getDokployVersion



GET
/settings.getReleaseTag



GET
/settings.readDirectories



POST
/settings.updateTraefikFile



GET
/settings.readTraefikFile



GET
/settings.getIp



POST
/settings.updateServerIp



GET
/settings.getOpenApiDocument



GET
/settings.readTraefikEnv



POST
/settings.writeTraefikEnv



GET
/settings.haveTraefikDashboardPortEnabled



GET
/settings.haveActivateRequests



POST
/settings.toggleRequests



GET
/settings.isCloud



GET
/settings.isUserSubscribed



GET
/settings.health



POST
/settings.setupGPU



GET
/settings.checkGPUStatus



POST
/settings.updateTraefikPorts



GET
/settings.getTraefikPorts



POST
/settings.updateLogCleanup



GET
/settings.getLogCleanupStatus



GET
/settings.getDokployCloudIps


security


POST
/security.create



GET
/security.one



POST
/security.delete



POST
/security.update


redirects


POST
/redirects.create



GET
/redirects.one



POST
/redirects.delete



POST
/redirects.update


port


POST
/port.create



GET
/port.one



POST
/port.delete



POST
/port.update


project


POST
/project.create



GET
/project.one



GET
/project.all



POST
/project.remove



POST
/project.update



POST
/project.duplicate


application


POST
/application.create



GET
/application.one



POST
/application.reload



POST
/application.delete



POST
/application.stop



POST
/application.start



POST
/application.redeploy



POST
/application.saveEnvironment



POST
/application.saveBuildType



POST
/application.saveGithubProvider



POST
/application.saveGitlabProvider



POST
/application.saveBitbucketProvider



POST
/application.saveGiteaProvider



POST
/application.saveDockerProvider



POST
/application.saveGitProvider



POST
/application.disconnectGitProvider



POST
/application.markRunning



POST
/application.update



POST
/application.refreshToken



POST
/application.deploy



POST
/application.cleanQueues



POST
/application.killBuild



GET
/application.readTraefikConfig



POST
/application.updateTraefikConfig



GET
/application.readAppMonitoring



POST
/application.move



POST
/application.cancelDeployment


mysql


POST
/mysql.create



GET
/mysql.one



POST
/mysql.start



POST
/mysql.stop



POST
/mysql.saveExternalPort



POST
/mysql.deploy



POST
/mysql.changeStatus



POST
/mysql.reload



POST
/mysql.remove



POST
/mysql.saveEnvironment



POST
/mysql.update



POST
/mysql.move



POST
/mysql.rebuild


postgres


POST
/postgres.create



GET
/postgres.one



POST
/postgres.start



POST
/postgres.stop



POST
/postgres.saveExternalPort



POST
/postgres.deploy



POST
/postgres.changeStatus



POST
/postgres.remove



POST
/postgres.saveEnvironment



POST
/postgres.reload



POST
/postgres.update



POST
/postgres.move



POST
/postgres.rebuild


redis


POST
/redis.create



GET
/redis.one



POST
/redis.start



POST
/redis.reload



POST
/redis.stop



POST
/redis.saveExternalPort



POST
/redis.deploy



POST
/redis.changeStatus



POST
/redis.remove



POST
/redis.saveEnvironment



POST
/redis.update



POST
/redis.move



POST
/redis.rebuild


mongo


POST
/mongo.create



GET
/mongo.one



POST
/mongo.start



POST
/mongo.stop



POST
/mongo.saveExternalPort



POST
/mongo.deploy



POST
/mongo.changeStatus



POST
/mongo.reload



POST
/mongo.remove



POST
/mongo.saveEnvironment



POST
/mongo.update



POST
/mongo.move



POST
/mongo.rebuild


mariadb


POST
/mariadb.create



GET
/mariadb.one



POST
/mariadb.start



POST
/mariadb.stop



POST
/mariadb.saveExternalPort



POST
/mariadb.deploy



POST
/mariadb.changeStatus



POST
/mariadb.remove



POST
/mariadb.saveEnvironment



POST
/mariadb.reload



POST
/mariadb.update



POST
/mariadb.move



POST
/mariadb.rebuild


sshRouter

gitProvider


GET
/gitProvider.getAll



POST
/gitProvider.remove


bitbucket


POST
/bitbucket.create



GET
/bitbucket.one



GET
/bitbucket.bitbucketProviders



GET
/bitbucket.getBitbucketRepositories



GET
/bitbucket.getBitbucketBranches



POST
/bitbucket.testConnection



POST
/bitbucket.update


github


GET
/github.one



GET
/github.getGithubRepositories



GET
/github.getGithubBranches



GET
/github.githubProviders



POST
/github.testConnection



POST
/github.update


gitlab


POST
/gitlab.create



GET
/gitlab.one



GET
/gitlab.gitlabProviders



GET
/gitlab.getGitlabRepositories



GET
/gitlab.getGitlabBranches



POST
/gitlab.testConnection



POST
/gitlab.update


gitea


POST
/gitea.create



GET
/gitea.one



GET
/gitea.giteaProviders



GET
/gitea.getGiteaRepositories



GET
/gitea.getGiteaBranches



POST
/gitea.testConnection



POST
/gitea.update



GET
/gitea.getGiteaUrl


previewDeployment


GET
/previewDeployment.all



POST
/previewDeployment.delete



GET
/previewDeployment.one



POST
/previewDeployment.redeploy


notification


POST
/notification.createSlack



POST
/notification.updateSlack



POST
/notification.testSlackConnection



POST
/notification.createTelegram



POST
/notification.updateTelegram



POST
/notification.testTelegramConnection



POST
/notification.createDiscord



POST
/notification.updateDiscord



POST
/notification.testDiscordConnection



POST
/notification.createEmail



POST
/notification.updateEmail



POST
/notification.testEmailConnection



POST
/notification.remove



GET
/notification.one



GET
/notification.all



POST
/notification.receiveNotification



POST
/notification.createGotify



POST
/notification.updateGotify



POST
/notification.testGotifyConnection



POST
/notification.createNtfy



POST
/notification.updateNtfy



POST
/notification.testNtfyConnection



POST
/notification.createCustom



POST
/notification.updateCustom



POST
/notification.testCustomConnection



POST
/notification.createLark



POST
/notification.updateLark



POST
/notification.testLarkConnection



GET
/notification.getEmailProviders


sshKey


POST
/sshKey.create



POST
/sshKey.remove



GET
/sshKey.one



GET
/sshKey.all



POST
/sshKey.generate



POST
/sshKey.update


server


POST
/server.create



GET
/server.one



GET
/server.getDefaultCommand



GET
/server.all



GET
/server.count



GET
/server.withSSHKey



GET
/server.buildServers



POST
/server.setup



GET
/server.validate



GET
/server.security



POST
/server.setupMonitoring



POST
/server.remove



POST
/server.update



GET
/server.publicIp



GET
/server.getServerTime



GET
/server.getServerMetrics


stripe


GET
/stripe.getProducts



POST
/stripe.createCheckoutSession



POST
/stripe.createCustomerPortalSession



GET
/stripe.canCreateMoreServers



GET
/stripe.getInvoices


swarm


GET
/swarm.getNodes



GET
/swarm.getNodeInfo



GET
/swarm.getNodeApps


ai


GET
/ai.one



GET
/ai.getModels



POST
/ai.create



POST
/ai.update



GET
/ai.getAll



GET
/ai.get



POST
/ai.delete



POST
/ai.suggest



POST
/ai.deploy


organization


POST
/organization.create



GET
/organization.all



GET
/organization.one



POST
/organization.update



POST
/organization.delete



GET
/organization.allInvitations



POST
/organization.removeInvitation



POST
/organization.updateMemberRole



POST
/organization.setDefault


schedule


POST
/schedule.create



POST
/schedule.update



POST
/schedule.delete



GET
/schedule.list



GET
/schedule.one



POST
/schedule.runManually


rollback


POST
/rollback.delete



POST
/rollback.rollback


volumeBackups


GET
/volumeBackups.list



POST
/volumeBackups.create



GET
/volumeBackups.one



POST
/volumeBackups.delete



POST
/volumeBackups.update



POST
/volumeBackups.runManually


environment


POST
/environment.create



GET
/environment.one



GET
/environment.byProjectId



POST
/environment.remove



POST
/environment.update



POST
/environment.duplicate


