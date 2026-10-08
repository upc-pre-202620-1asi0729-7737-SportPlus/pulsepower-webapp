# PulsePower

PulsePower es una plataforma de SportPlus que ayuda a organizar el entrenamiento, el sueño y el bienestar. Permite registrar actividades diarias y consultar el progreso mediante resúmenes, gráficos y reportes.

## ¿Qué puedes hacer?

- Crear una cuenta local y personalizar tu perfil y objetivos.
- Registrar entrenamientos y planificar actividades en un calendario.
- Registrar tus noches de sueño y configurar una rutina de descanso.
- Completar registros de bienestar, hábitos y ejercicios de respiración.
- Consultar información de recuperación simulada y generar reportes PDF.
- Explorar las funciones de comunidad y suscripción en modo demostración.

La versión actual funciona solo como frontend: guarda los datos en el navegador y utiliza simulaciones para las funciones que necesitan servicios externos. No realiza diagnósticos médicos ni cobros.

La interfaz está disponible en inglés y español. El idioma inicial es inglés y se conserva tu preferencia al cambiarlo.

## Ejecutar el proyecto

Requiere Node.js 22.22.3+ en la rama 22 o 24.15+ en la rama 24.

```sh
npm ci
npm start
```

Abre [localhost:4200](http://localhost:4200).

**Cuenta de demostración:** `pulsepower@gmail.com` · **Contraseña:** `123456`.

## Tecnologías y organización

Angular con componentes standalone, TypeScript y Angular Material. El tema de Material se define en `src/material-theme.scss`, con los colores de PulsePower y la fuente Rubik.

Los siete contextos están en `src/app/modules`: `iam`, `training`, `sleep`, `wellness`, `physiology`, `reports` y `community`. Cada uno tiene las capas `domain`, `application`, `infrastructure` y `presentation`. Los elementos compartidos están en `src/app/shared`.

## Comandos

| Comando                      | Uso                                             |
| ---------------------------- | ----------------------------------------------- |
| `npm start`                  | Iniciar el servidor de desarrollo.              |
| `npm run build`              | Compilar para producción.                       |
| `npm run preview`            | Ver la versión de producción en localhost:4300. |
| `npm test`                   | Ejecutar las pruebas.                           |
| `npm run check:architecture` | Verificar las reglas de arquitectura.           |
| `npm run format`             | Formatear el código.                            |
| `npm run format:check`       | Comprobar el formato.                           |
