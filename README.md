
## Elegant Tex Deployment

Guideline to deploy Elegant tex management portal.
# Restore Backup
```bash
docker exec -i 5d6266b1eacb sh -c 'exec mysql -ujafrultripto -pEwu@2013368037 elegant_tex' < ./.db-dumps/mysql-elegant_tex.sql > output.md
