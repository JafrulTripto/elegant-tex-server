
## Elegant Tex Deployment

Guideline to deploy Elegant tex management portal.
# Build Application Container (Development)
```bash
docker build --no-cache --build-arg DEVELOPMENT=true -t tripzin/elegant-tex-app:dev .
```
# Build Application Container (Production)
```bash
docker build --no-cache --build-arg DEVELOPMENT=false -t tripzin/elegant-tex-app:v1.0.0 .
```

# Run Docker Containers
```bash
docker-compose up -d
```

# Restore Backup
```bash
docker exec -i 5d6266b1eacb sh -c 'exec mysql -ujafrultripto -pEwu@2013368037 elegant_tex' < ./.db-dumps/mysql-elegant_tex.sql
```
