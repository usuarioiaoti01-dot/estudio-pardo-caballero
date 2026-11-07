# Consultorias Integrales - Sistema de Gestion (v.02)

App para estudio juridico: abogados, clientes con tarifa por hora, registro de horas,
liquidacion mensual automatica por cliente, ingresos (RHE), gastos y usuarios.

## Flujo (4 pasos)
1. **Abogados**: quienes atienden y reportan horas (mismo correo que su usuario).
2. **Clientes y tarifas**: tarifa por hora del cliente + sus actividades. Una actividad
   puede tener tarifa especial; si no, usa la del cliente. Condiciones: retencion 8% y
   "tarifa neta" (bruto = honorarios / 0.92).
3. **Registro de horas**: fecha, abogado, cliente, actividad, horas (1:30 o 1.5),
   cronometro opcional. El monto se calcula solo y la tarifa queda copiada en el registro.
4. **Liquidacion mensual**: por cliente y mes, agrupa horas por actividad y calcula
   honorarios, retencion y neto. Al emitir (LIQ-AAAA-NNNN) las horas quedan cerradas;
   anular la liquidacion las libera.

## Archivos
- **index.html** - version NUBE v.02 (login Supabase). Es la que publica GitHub Pages.
- **pardo_caballero_gestion.html** - version LOCAL antigua (v.01). Pendiente decidir si se retira.
- **supabase_setup.sql** - tablas y seguridad (sin cambios; ejecutar 1 vez).
- **edge_function_admin-users.ts** - administracion de usuarios (sin cambios).

## Datos y convivencia con la version publicada
- v.02 guarda en la fila `estudio_data.id = 'v2'`; la version publicada (main) usa `id = 'main'`.
- Al primer ingreso, v.02 copia y convierte los datos de `main` sin modificarlos:
  tarifas sueltas -> tarifa del cliente; proyectos y actividades -> actividades del cliente;
  regla Pana Autos (antes fija en el codigo) -> opcion "tarifa neta" del cliente;
  liquidaciones antiguas -> consulta en "Liquidacion mensual".
- En Usuarios hay un boton para volver a copiar desde `main` (reemplaza los datos de v.02).
- Al publicar v.02 en main no hay que migrar nada: seguira usando la fila `v2`.

## Ramas
- main: version publicada estable.
- estudio-pardo-caballero-v.02: desarrollo de mejoras (v.02).
