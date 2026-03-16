## 📦 Instalación y configuración de la base de datos (Windows)

Esta guía explica cómo levantar la base de datos MySQL para el proyecto después de clonar el repositorio en **Windows**.

---

## 1️⃣ Requisitos

- Windows 10 / 11
- Node.js instalado
- MySQL Server
- MySQL Workbench (recomendado)

Descarga oficial:

- MySQL Installer (Server + Workbench)

Durante la instalación:

- Elegir **MySQL Server** y **MySQL Workbench**
- Definir una contraseña para el usuario `root`
- Puerto por defecto: `3306`

---

## 2️⃣ Clonar el repositorio

```bash
git clone https://github.com/linearesdiego/backend-jobs.git
cd backend-jobs
npm install
```

---

## 3️⃣ Crear base de datos y usuario

Abrir **MySQL Workbench** y conectarse como `root`.

### Crear la base de datos

```sql
CREATE DATABASE jobs_db;
```

### Crear usuario para la aplicación

```sql
CREATE USER 'jobs_user'@'localhost'
IDENTIFIED BY 'jobs123';
```

### Dar permisos (modo desarrollo)

```sql
GRANT ALL PRIVILEGES ON *.* TO 'jobs_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 4️⃣ Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="mysql://jobs_user:jobs123@localhost:3306/jobs_db"
```

---

## 5️⃣ Ejecutar migraciones

Desde la raíz del proyecto:

```bash
npx prisma migrate dev
```

Si no hay errores, la base de datos ya quedó lista.

---

## 6️⃣ Ver la base de datos (Workbench)

Conectarse usando:

- Host: `localhost`
- Port: `3306`
- User: `jobs_user`
- Password: `jobs123`

---

## ✅ Listo

El proyecto queda conectado a MySQL y listo para trabajar.
