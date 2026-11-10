# PulsePower

PulsePower es una plataforma de SportPlus que ayuda a organizar el entrenamiento, el sueño y el bienestar. Permite registrar actividades diarias y consultar el progreso mediante resúmenes, gráficos y reportes.

## ¿Qué puedes hacer?

- Crear una cuenta local y personalizar tu perfil y objetivos.
- Registrar entrenamientos y planificar actividades en un calendario.
- Registrar tus noches de sueño y configurar una rutina de descanso.
- Completar registros de bienestar, hábitos y ejercicios de respiración.
- Generar lecturas de una pulsera en **Dispositivo simulado** (noches, entrenamientos, estrés, batería o una semana completa).
- Consultar tu nivel de recuperación, las alertas y las recomendaciones calculadas con tus registros.
- Preguntar a la **Guía de recuperación** sobre tu sueño, entrenamiento, estrés y recuperación. Responde con tus datos y rechaza temas ajenos a la plataforma.
- Generar reportes PDF y explorar las funciones de comunidad y suscripción en modo demostración.
- Consultar el centro de ayuda sin iniciar sesión; el resto de la plataforma requiere una sesión.

Esta versión funciona en modo local. La cuenta, los registros del simulador y los reportes se guardan en el navegador. La guía de recuperación responde con reglas sobre esos registros. Las cuentas de demostración y sus datos pertenecen al navegador donde se crearon.

La Landing Page puede enlazar con `?lang=es|en` para conservar el idioma y con `?segment=athlete|wellness` para preseleccionar el enfoque al crear la cuenta.

La interfaz está disponible en inglés y español. El idioma inicial es inglés y se conserva tu preferencia al cambiarlo.

# PulsePower - cómo ejecutar

1. Node 22.22.3+ (rama 22) o 24.15+ (rama 24). Revisa con: node -v
2. Abre la terminal DENTRO de esta carpeta (donde está package.json)
3. npm ci
4. npm start
5. Abre http://localhost:4200/
   Cuenta demo: pulsepower@gmail.com / 123456

Comprobaciones: npm run build | npm test | npm run check:architecture | npm run format:check

**Cuenta de demostración:** `pulsepower@gmail.com` · **Contraseña:** `123456`.

## Tecnologías y organización

Angular con componentes standalone, TypeScript y Angular Material. El tema de Material se define en `src/material-theme.scss`, con los colores de PulsePower y la fuente Rubik, incluida en `src/app/assets/fonts` (licencia SIL Open Font License, ver `OFL.txt`).

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
