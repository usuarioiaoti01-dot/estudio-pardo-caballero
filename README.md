# Consultorias Integrales - Sistema de Gestion

App de gestion para estudio juridico: tiempos, clientes, proyectos, ingresos (RHE),
gastos, liquidaciones y administracion de usuarios.

## Archivos
- **index.html** - version NUBE (login Supabase, datos compartidos). Es la que publica GitHub Pages.
- **pardo_caballero_gestion.html** - version LOCAL (un solo usuario, guarda en el navegador).
- **supabase_setup.sql** - creacion de tablas y seguridad (ejecutar 1 vez en Supabase).
- **edge_function_admin-users.ts** - funcion para administrar usuarios (desplegar en Supabase Edge Functions).

## Importante
- El codigo NO contiene datos reales: la informacion se carga desde la base de datos tras iniciar sesion.
- Publicado con GitHub Pages: https://usuarioiaoti01-dot.github.io/estudio-pardo-caballero/

## Ramas
- main: version publicada estable.
- estudio-pardo-caballero-v.02: desarrollo de mejoras (v.02).
