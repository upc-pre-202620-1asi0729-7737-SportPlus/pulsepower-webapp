# PulsePower

PulsePower es una plataforma de SportPlus que ayuda a organizar el entrenamiento, el sueño y el bienestar. Permite registrar actividades diarias y consultar el progreso mediante resúmenes, gráficos y reportes.

## ¿Qué puedes hacer?

- Crear una cuenta en el backend y personalizar tu perfil y objetivos.
- Registrar entrenamientos y planificar actividades en un calendario.
- Registrar tus noches de sueño y configurar una rutina de descanso.
- Completar registros de bienestar, hábitos y ejercicios de respiración.
- Consultar información de recuperación simulada y generar reportes PDF.
- Explorar las funciones de comunidad y suscripción en modo demostración.

La versión actual consume la API del backend con autenticación JWT. Los registros del simulador se guardan mediante los endpoints de sueño, entrenamiento y bienestar. El asistente responde desde el backend con reglas y datos de la cuenta autenticada; no utiliza IA generativa externa. Las preferencias, respiración y batería simulada siguen siendo locales. No realiza diagnósticos médicos ni cobros.

La interfaz está disponible en inglés y español. El idioma inicial es inglés y se conserva tu preferencia al cambiarlo.

# PulsePower - cómo ejecutar

1. Node 22.22.3+ (rama 22) o 24.15+ (rama 24). Revisa con: node -v
2. Abre la terminal DENTRO de esta carpeta (donde está package.json)
3. npm ci
4. npm start
5. Abre http://localhost:4200/
   Registra una cuenta en el backend antes de iniciar sesión.

Comprobaciones: npm run build | npm test | npm run check:architecture | npm run format:check


**Backend requerido:** configura y levanta la API completa; las cuentas locales de versiones anteriores no se migran automáticamente.

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

## Integración con la API

- Desarrollo: `http://localhost:8080/api/v1`; frontend en `http://localhost:4200`.
- Producción: se conserva la URL de Render en `src/environments/environment.ts`.
- Configura CORS en el backend para el origen donde publiques el frontend.
- Se requiere el backend completo con IAM, bienestar, fisiología y `POST /api/v1/assistant/messages`, además de los endpoints de entrenamiento, sueño, reportes y comunidad.
- El reemplazo de sueño usa `PUT /api/v1/sleep/records/{id}` y la reprogramación `PUT /api/v1/training/plan/activities/{id}`.
- Las pruebas unitarias usan respuestas simuladas; no certifican el despliegue actual en Render.
- Antes de desplegar esta rama, integrar y verificar los módulos pendientes del backend.
