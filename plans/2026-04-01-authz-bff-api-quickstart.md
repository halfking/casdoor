# Authz BFF API Quickstart

## Endpoints

- POST /api/bff/resolve-permissions
- POST /api/bff/check-data-scope
- GET /api/bff/tenant-tree

## 1) Resolve permissions

Request:

```json
{
  "tenant": "built-in",
  "subject": "built-in/admin",
  "checks": [
    "/management/users",
    "/management/roles",
    "/management/permissions"
  ]
}
```

Response (example):

```json
{
  "status": "ok",
  "data": {
    "tenant": "built-in",
    "subject": "built-in/admin",
    "results": [
      {"resource": "/management/users", "allowed": true, "matchedPolicy": "api-permission"},
      {"resource": "/management/roles", "allowed": true, "matchedPolicy": "api-permission"}
    ],
    "traceId": "random-id"
  }
}
```

## 2) Check data scope

Request:

```json
{
  "tenant": "built-in",
  "subject": "built-in/admin",
  "resourceType": "user",
  "operation": "read",
  "recordContext": {}
}
```

Response (example):

```json
{
  "status": "ok",
  "data": {
    "allowed": true,
    "scopeFilter": {"tenant": "built-in"},
    "fieldRules": [],
    "obligations": [],
    "matchedPolicy": "api-permission",
    "traceId": "random-id"
  }
}
```

## 3) Get tenant tree

Request:

```http
GET /api/bff/tenant-tree?owner=built-in
```

Response (example):

```json
{
  "status": "ok",
  "data": {
    "items": [
      {"tenant": "built-in", "displayName": "Built In", "owner": "built-in"}
    ],
    "traceId": "random-id"
  }
}
```

## Notes

- Non-global admin users are restricted to their own tenant.
- subject must belong to caller tenant unless caller is global admin.
- These APIs currently use `api-permission` as matched policy source.
