# Examen Practico: Working in the Cloud (COM610)
**Estudiante:** Jhamil Cristian Chiltoa Sanchez  
**Repositorio:** https://github.com/Jhamil1017/com610-2do-parcial-jhamil  
**URL Publica de la API (EC2 + Nginx):** http://52.15.218.54  

## 1. Arquitectura y Seguridad en AWS (us-east-2)
- **EC2 (`ec2-api-jhamil-chiltoa` - `52.15.218.54`):** Ejecuta el contenedor Docker de la API Node.js/Express enlazado exclusivamente en `127.0.0.1:3000`, expuesto a Internet unicamente a traves de Nginx como proxy inverso en el puerto `80`.
- **Amazon RDS MySQL (`rds-libros-jhamil-chiltoa`):** Base de datos `libros_db` sin acceso publico (`Publicly Accessible: No`). Su Security Group (`rds-jhamil-chiltoa`) permite trafico en el puerto `3306` unicamente desde el Security Group de EC2 (`sg-0c7564114079755fd`).
- **Gestion de Secretos:** Credenciales de RDS y llave SSH administradas mediante GitHub Secrets (`GHCR_TOKEN`, `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`) y archivo `.env` externo en EC2 (`--env-file`).

## 2. Endpoints de la API REST (`/libros`)
- `GET /health` -> Estado del servicio y version desplegada (`200`)
- `GET /libros` -> Lista todos los libros (`200`, `500`)
- `GET /libros/:id` -> Consulta un libro por ID (`200`, `404`, `500`)
- `POST /libros` -> Crea un libro con validacion de campos (`201`, `400`, `500`)
- `PUT /libros/:id` -> Actualiza un libro existente (`200`, `400`, `404`, `500`)
- `DELETE /libros/:id` -> Elimina un libro (`200`, `404`, `500`)

## 3. Pipeline CI/CD y Rollback Automatico
1. **CI (`ci.yml` y Job `test`):** Ejecuta pruebas unitarias y de integracion con Jest y Supertest (`tests/libros.test.js`) aisladas de RDS.
2. **Build & Push (`build-and-push`):** Construye la imagen Docker (`node:20-alpine`) y la publica en GitHub Container Registry (`ghcr.io/jhamil1017/api-libros-com610`) etiquetada con el SHA del commit y `latest`.
3. **Deploy y Rollback (`deploy`):** Despliega el contenedor en EC2 respaldando la imagen previa (`api-libros-rollback:previous`). Si `/health` o `/libros` fallan tras el despliegue, restaura automaticamente la version anterior.

## 4. Evidencias (`evidencias/`)
- `01-ec2-seguridad.png`: Reglas de entrada del Security Group de EC2.
- `02-rds-seguridad.png` y `03-rds-reglas-entrada.png`: Configuracion privada de RDS y acceso exclusivo desde EC2.
- `04-crud-externo.png` y `05-persistencia-rds.png`: Pruebas CRUD externas y verificacion en MySQL RDS.
- `06-pruebas-jest.png`: Ejecucion exitosa de Jest y Supertest.
- `07-github-actions-ci-cd.png`: Pipeline CI/CD en verde en GitHub Actions.
- `08-imagen-ghcr.png`: Imagen Docker publicada en GHCR con SHA del commit.
- `09-despliegue-version-actualizada.png`: Verificacion de la version actualizada (`2.0.0-<sha>`) en produccion.
