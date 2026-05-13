# 🚀 PM Control Tower - Inicio Rápido (5 minutos)

## Lo que necesitas saber AHORA

### ✅ Paso 1: Crea un repositorio de datos en GitHub
```bash
1. Ve a https://github.com/new
2. Nombre: pm-data (o similar)
3. Click "Create repository"
4. Copia el nombre exacto
```

### ✅ Paso 2: Genera Token de GitHub
```bash
1. Ve a https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Nombre: "PM Control Tower"
4. Selecciona ✅ repo y ✅ read:user
5. Click "Generate token"
6. COPIA INMEDIATAMENTE (no podrás verlo después)
```

### ✅ Paso 3: Inicia sesión en la app
```bash
1. Ve a https://pm-ashy-nine.vercel.app/
2. Llena el formulario:
   - Your Name: Tu nombre completo
   - GitHub Username: Tu usuario (sin @)
   - Repository Name: El nombre del repo que creaste (pm-data)
   - Branch: main
   - GitHub Token: Pega el token que copiaste
3. Click "Sign In"
```

---

## Los 3 Pasos Fundamentales (usa esto todos los días)

### Mañana: Check Dashboard (5 min)
```
1. Abre https://pm-ashy-nine.vercel.app
2. Mira el color:
   ✅ Verde = todo bien, continúa día normal
   🟡 Amarillo = hay cosas que atender esta semana
   🔴 Rojo = hay EMERGENCIAS ahora

3. Si hay rojo/amarillo:
   - Ve a "Escalations" → resuelve o asigna propietario
   - Actualiza tareas bloqueadas
```

### Día: Actualiza tu trabajo (2 min)
```
1. ¿Completaste una tarea?
   → Ve a Tasks, búscala, marca "Completed"

2. ¿Encontraste un problema?
   → Crea una escalación o new risk

3. ¿Algo cambió?
   → Actualiza la tarea con nueva fecha/status
```

### Viernes: Reporte (30 min)
```
1. Ve a Settings → Reports
2. Click "Download Project Summary"
3. Envía a tu manager con:
   - Health: Green/Yellow/Red
   - Tasks completadas: X%
   - Bloqueadores: (si hay)
   - Próxima semana: Qué viene
```

---

## Los 5 Módulos Clave

| Módulo | Para Qué | Cuándo |
|--------|----------|--------|
| 🎯 **Dashboard** | Ver salud del proyecto en 1 pantalla | Diariamente (5 min) |
| ✅ **Tasks** | Crear y actualizar tareas | Mientras trabajas (5-10 min/día) |
| ⚠️ **Risks** | Identificar problemas antes de que exploten | Semanalmente (30 min) |
| 🎊 **Milestones** | Definir entregas clave | En sprint planning (1 hora/2 sem) |
| 🚨 **Escalations** | Problemas que necesitan decisión HOY | Diariamente (5 min) |

**Para aprender más:** Lee [GUIA_USO.md](GUIA_USO.md)

---

## La Regla de Oro

```
ACTUALIZA LA APP COMO SI FUERA VERDAD,
PORQUE SERÁ VERDAD PARA QUIEN LEA TU REPORTE
```

Si dices "Task A 80% complete" pero en la app dice "20%", alguien tomará decisiones basadas en datos falsos.

---

## Problemas Comunes

### "No puedo conectar"
**Solución:** 
- ¿El token tiene permisos `repo` y `read:user`? (ve a GitHub settings)
- ¿El nombre del repo es exacto? (sin mayúsculas, espacios, etc.)
- ¿La rama existe? (normalmente "main")

### "Los cambios no se guardan"
**Solución:**
- Ve a Settings → mira "Sync Status"
- Si es 🔴 rojo = error de GitHub
- Si es 🟡 amarillo = espera a que termine
- Si es 🟢 verde = recarga la página (F5)

### "Dashboard muestra datos viejos"
**Solución:**
- Click en el botón "Refresh" en Dashboard
- Si sigue igual: borra localStorage y vuelve a iniciar sesión

---

## Eficiencia en 3 Números

| Métrica | Meta | Por Qué |
|---------|------|---------|
| **Tasks vencidas** | < 2 | Si > 5, algo está roto |
| **Escalaciones abiertas** | 0-1 | Debería resolverse en < 3 días |
| **Riesgos RPN > 150** | 0-2 | Más que eso = proyecto en caos |

Si alguno de estos números sube, es alarma 🚨

---

## Next Steps

**Hoy:**
- [ ] Crea repo + token
- [ ] Inicia sesión

**Esta semana:**
- [ ] Lee [GUIA_USO.md](GUIA_USO.md) (30 min)
- [ ] Crea 1 proyecto de prueba
- [ ] Crea 5-10 tareas de ejemplo
- [ ] Crea 2-3 riesgos

**Próxima semana:**
- [ ] Usa en tu proyecto real
- [ ] Enseña al equipo
- [ ] Lee [MEJORES_PRACTICAS.md](MEJORES_PRACTICAS.md) para optimizar

---

## Documentación Completa

- 📖 [GUIA_USO.md](GUIA_USO.md) - Guía detallada de cada módulo
- ⚡ [MEJORES_PRACTICAS.md](MEJORES_PRACTICAS.md) - Cómo ser eficiente
- 🎓 [SETUP.md](SETUP.md) - Detalles técnicos (si necesitas)

---

## Soporte

**Preguntas técnicas:** Revisa GitHub Issues en el repo
**Problemas de acceso:** Regenera el token en GitHub settings
**Sugerencias:** Abre una issue en el repo con "Enhancement:" prefix

---

**¡Listo para empezar!** 🚀
