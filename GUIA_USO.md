# 📘 PM Control Tower - Guía Completa de Uso

## 🚀 Inicio Rápido

### Paso 1: Crear un Repositorio en GitHub para tus Datos

1. Ve a https://github.com/new
2. Crea un nuevo repositorio (ej: `pm-data`)
3. Inicializa con README (opcional)
4. Copiar el nombre del repositorio

### Paso 2: Generar Token de GitHub

1. Ve a https://github.com/settings/tokens
2. Click en "Generate new token" → "Generate new token (classic)"
3. Dale un nombre: `PM Control Tower`
4. Selecciona estos permisos:
   - ✅ `repo` (acceso completo a repositorios)
   - ✅ `read:user` (leer información de usuario)
5. Click "Generate token"
6. **Copia el token inmediatamente** (no podrás verlo de nuevo)

### Paso 3: Conectar la App

1. Ve a https://pm-ashy-nine.vercel.app/
2. Completa el formulario:
   - **Your Name**: Tu nombre completo
   - **GitHub Username**: Tu usuario de GitHub (sin @)
   - **Repository Name**: El nombre del repo que creaste (ej: `pm-data`)
   - **Branch**: `main` (o la rama que prefieras)
   - **GitHub Token**: Pega el token que copiaste
3. Click en "Sign In"

---

## 📊 Estructura de Datos

La app guarda toda la información en tu repositorio de GitHub en archivos JSON dentro de `data/`:

```
data/
├── projects.json       # Proyectos
├── tasks.json          # Tareas
├── risks.json          # Riesgos
├── milestones.json     # Hitos
├── suppliers.json      # Proveedores
├── meetings.json       # Reuniones
├── meeting_actions.json # Acciones de reuniones
├── escalations.json    # Escalaciones
└── documents.json      # Documentos
```

**Ventajas:**
- ✅ Historial completo en Git
- ✅ Backup automático
- ✅ Control de versiones
- ✅ Colaboración entre equipos
- ✅ Auditoría de cambios

---

## 📱 Módulos de la Aplicación

### 1. **Dashboard** 🎯
El centro de control del proyecto.

**Métricas clave:**
- **Completion %**: Porcentaje de tareas completadas
- **Health Indicator**: Rojo/Amarillo/Verde según la salud del proyecto
- **Open Tasks**: Tareas activas
- **Overdue Tasks**: Tareas vencidas
- **Critical Tasks**: Tareas de prioridad crítica
- **Due Soon**: Tareas vencidas en 7 días
- **High Risks**: Riesgos con RPN ≥ 100
- **Escalations**: Problemas abiertos

**Gráficos:**
- Distribución de tareas por prioridad
- Mapa de riesgos (RPN)
- Tendencias de progreso

**💡 Consejo:** Revisa el Dashboard cada mañana para identificar problemas.

---

### 2. **Tasks** ✅
Gestión de tareas del proyecto.

**Crear una tarea:**
1. Click "New Task"
2. Completa los campos:
   - **Title**: Nombre descriptivo
   - **Description**: Detalles, criterios de aceptación
   - **Priority**: Critical / High / Medium / Low
   - **Due Date**: Fecha límite
   - **Assigned To**: Responsable
   - **Status**: Backlog / In Progress / Completed / Cancelled

**Campos especiales:**
- **Affects SOP**: ¿Impacta procedimientos operacionales?
- **Is Safety**: ¿Es un tema de seguridad?
- **Dependencies**: Otras tareas de las que depende

**Auto-escalación:** Si una tarea es crítica, de seguridad, o impacta SOP y se vence por más de 5 días, la app crea automáticamente una escalación.

**Estados:**
- 🔵 Backlog: No iniciada
- 🟡 In Progress: En trabajo
- ✅ Completed: Terminada
- ⛔ Cancelled: Cancelada

**💡 Consejos:**
- Actualiza el estado frecuentemente (el Dashboard depende de esto)
- Sé específico en la descripción
- Asigna responsables claros
- Usa "Due Soon" para evitar que pasen fechas

---

### 3. **Risks** ⚠️
Identificación y seguimiento de riesgos.

**Crear un riesgo:**
1. Click "New Risk"
2. Completa:
   - **Title**: Nombre del riesgo
   - **Description**: Qué puede pasar
   - **Impact Area**: Categoría (Timing / Quality / Cost / Safety / etc.)
   - **Probability**: 1-10 (qué tan probable)
   - **Severity**: 1-10 (qué tan grave)
   - **Detectability**: 1-10 (qué tan fácil detectar)
   - **Mitigation Plan**: Cómo prevenirlo
   - **Status**: Open / Closed

**RPN (Risk Priority Number):**
```
RPN = Probability × Severity × Detectability
```
- RPN > 200: Crítico
- RPN 100-200: Alto
- RPN < 100: Bajo

**💡 Consejos:**
- Revisa riesgos semanalmente
- Si RPN > 100, añade acciones de mitigación
- Detectability baja = riesgo de sorpresa (aumenta)
- Actualiza probabilidades cuando cambian circunstancias

---

### 4. **Milestones** 🎊
Hitos clave del proyecto.

**Estados de hito:**
- 🟢 On Track: En tiempo
- 🟡 At Risk: En riesgo
- 🔴 Delayed: Retrasado

**Crear un hito:**
1. Click "New Milestone"
2. Completa:
   - **Title**: Nombre del hito
   - **Description**: Qué representa
   - **Planned Date**: Cuándo debería terminar
   - **Status**: On Track / At Risk / Delayed
   - **Completion %**: % de avance
   - **Key Deliverables**: Qué se entrega

**Auto-cálculo de salud:**
- Si hoy > fecha planeada y status ≠ Completed → Delayed
- Si hoy + 14 días > fecha planeada → At Risk

**💡 Consejos:**
- Crea milestones cada 2-4 semanas
- Vincula tareas a milestones (en descripción)
- Revisa semanalmente y actualiza %

---

### 5. **Suppliers** 🏭
Gestión de proveedores y dependencias externas.

**Campos clave:**
- **Name**: Nombre del proveedor
- **Contact**: Persona de contacto
- **Status**: Normal / Delayed / Critical / Resolved
- **Last Update**: Última actualización
- **Notes**: Observaciones

**Prioridades:**
- 🔴 Critical: Necesita atención inmediata
- 🟡 High: Requiere seguimiento
- 🔵 Normal: En tiempo

**💡 Consejos:**
- Actualiza estado semanalmente
- Si un supplier es crítico, créale un riesgo
- Documenta comunicaciones en Notes

---

### 6. **Meetings** 📅
Registro de reuniones y decisiones.

**Crear una reunión:**
1. Click "New Meeting"
2. Completa:
   - **Title**: Tema de la reunión
   - **Date**: Cuándo
   - **Attendees**: Quiénes asistieron
   - **Notes**: Qué se discutió
   - **Decisions**: Decisiones tomadas

**Meeting Actions:**
Automáticamente se crean acciones en el módulo "Meeting Actions"

**💡 Consejos:**
- Documenta reuniones el mismo día
- Sé específico en decisiones (no "discutimos el proyecto")
- Vincula reuniones a escalaciones/riesgos relevantes

---

### 7. **Escalations** 🚨
Problemas que necesitan atención inmediata.

**Tipos:**
- 🔴 Critical: Requiere decisión hoy
- 🟠 High: Requiere decisión esta semana
- 🟡 Medium: Requiere seguimiento

**Estados:**
- Open: Sin resolver
- In Progress: Siendo trabajado
- Resolved: Solucionado

**Auto-escalación:**
La app crea escalaciones automáticamente cuando:
- Tarea crítica vencida > 5 días
- Tarea de seguridad vencida > 5 días
- Tarea que afecta SOP vencida > 5 días

**💡 Consejos:**
- Revisa escalaciones diariamente
- Asigna responsable de resolución
- No dejes escalaciones abiertas > 3 días
- Una vez resuelto, ciérralo para limpiar el tablero

---

### 8. **Documents** 📄
Biblioteca de documentos del proyecto.

**Tipos:**
- Specification / Design / Plan / Report / etc.

**Metadata:**
- **Title**: Nombre del documento
- **Type**: Tipo de documento
- **URL**: Link externo (Google Drive, SharePoint, etc.)
- **Version**: Versión actual
- **Owner**: Quién mantiene el doc
- **Status**: Draft / Final / Archived

**💡 Consejos:**
- Mantén URLs centralizadas (no dispersas en emails)
- Actualiza versiones cuando hay cambios
- Archiva docs obsoletos

---

### 9. **Reports** 📈
Reportes automáticos del proyecto.

**Reportes incluidos:**
- **Project Summary**: Resumen ejecutivo
- **Task Aging Report**: Tareas por antigüedad
- **Risk Register**: Registro de riesgos con mitigación
- **Supplier Performance**: Desempeño de proveedores
- **Milestone Status**: Estado de hitos

**Para exportar:**
Usa el botón "Download" para obtener PDF/JSON

**💡 Consejos:**
- Genera reportes semanales para stakeholders
- Usa Reports para presentaciones ejecutivas

---

### 10. **Settings** ⚙️
Configuración del proyecto.

**En Settings:**
- **Create Project**: Crea nuevo proyecto
- **Select Project**: Cambia entre proyectos
- **Sync Status**: Ver estado de sincronización con GitHub
- **Backup/Restore**: Exportar/Importar datos

**Sincronización:**
- ✅ Green: Todo sincronizado
- 🟡 Syncing: Guardando cambios en GitHub
- 🔴 Error: Problema con GitHub (verifica token)

**💡 Consejos:**
- Revisa Sync Status después de cambios importantes
- Haz backup antes de grandes cambios
- Mantén múltiples proyectos organizados

---

## 🎯 Flujos de Trabajo Recomendados

### Flujo Diario (15 min)
```
1. Abre Dashboard
2. Revisa escalaciones abiertas → resuelve o asigna
3. Actualiza tareas en progreso → cambia estados
4. Revisa tareas vencidas → crea escalaciones si corresponde
5. Guarda cambios (auto-sincroniza a GitHub)
```

### Flujo Semanal (1 hora)
```
1. Reunión de estado:
   - Genera Dashboard report
   - Comparte con stakeholders
   
2. Actualiza planificación:
   - Revisa tareas próximas
   - Actualiza estimaciones
   - Añade nuevas tareas si es necesario
   
3. Gestión de riesgos:
   - Revisa riesgos abiertos
   - Actualiza RPN si cambió situación
   - Verifica mitigaciones
   
4. Estado de suppliers:
   - Contacta a proveedores críticos
   - Actualiza estado en la app
   
5. Genera meeting actions:
   - Revisa acciones pendientes
   - Asigna responsables
```

### Flujo de Sprint (2-week planning)
```
1. Planificación:
   - Crea/revisa milestones
   - Desglosa tareas
   - Asigna prioridades
   
2. Risk Planning:
   - Identifica riesgos nuevos
   - Calcula RPN
   - Define mitigaciones
   
3. Supplier Review:
   - Verifica capacidad de proveedores
   - Identifica riesgos de supply
   
4. Comunicación:
   - Genera report ejecutivo
   - Socializa plan con equipo
```

---

## ⚡ Mejores Prácticas para Máxima Eficiencia

### 1. **Nomenclatura Clara**
```
❌ Mal:  "Fix bug"
✅ Bien: "Fix authentication timeout on login page"

❌ Mal:  "Toyota stuff"
✅ Bien: "Toyota Radio: Implement GPS receiver integration"
```

### 2. **Prioridades Consistentes**
```
CRITICAL:  Impacta seguridad, costo > $100K, o atraso > 2 semanas
HIGH:      Impacta timeline o costo > $50K
MEDIUM:    Necesario pero flexible
LOW:       Nice-to-have
```

### 3. **Fechas Realistas**
```
- Siempre añade 20% buffer
- Si estimaste 5 días, pon vencimiento en 6
- Considera vacaciones/feriados
- Revisa dependencias antes de comprometerte
```

### 4. **Responsabilidades Claras**
```
❌ Mal:   "Assigned to: Team"
✅ Bien:  "Assigned to: John Smith"

- Una tarea = una persona responsable
- Si necesita múltiples, crea subtareas
```

### 5. **Riesgos Preventivos vs Reactivos**
```
Preventivo (RPN bajo):
- Identifica riesgos temprano
- Calcula RPN honestamente
- Reduce Detectability (mejora visibilidad)

Reactivo (RPN alto):
- Solo escalas cuando explota
- Sorpresas costosas
```

### 6. **Sincronización con GitHub**
```
✅ Haz:
- Revisa el status de sincronización
- Mantén token válido
- Haz commits regularmente en GitHub

❌ No hagas:
- Editar archivos JSON directamente en GitHub (usa la app)
- Compartir tokens por email
- Desactivar el repositorio de datos
```

### 7. **Reportes Ejecutivos**
```
Estructura semanal:
1. Health Status (Green/Yellow/Red)
2. Key Metrics (Tasks completed, risks active, milestones on track)
3. Blockers/Escalations (qué necesita decisión)
4. Next Week Outlook (qué viene)
5. Supplier Status (si aplica)
```

### 8. **Archivado de Datos**
```
Cada mes:
- Archiva proyectos completados
- Cierra riesgos resueltos
- Marca documentos como archivados
- Mantén solo activos los proyectos vigentes
```

---

## 🔧 Troubleshooting

### "Cannot sync to GitHub"
**Problema:** Error al guardar en GitHub
**Solución:**
1. Verifica que el token sea válido
2. Verifica que el repositorio exista
3. En Settings → "Sync Status" → intenta nuevamente
4. Si persiste: regenera el token en GitHub

### "404 on data files"
**Problema:** La app no encuentra tus datos
**Solución:**
1. Los archivos se crean automáticamente al crear primeros registros
2. Si están vacíos, crea un proyecto en Settings
3. Verifica que la rama sea la correcta

### "Tasks not updating"
**Problema:** Los cambios no se guardan
**Solución:**
1. Revisa Sync Status en Settings
2. Si está en rojo, hay error de autenticación
3. Recarga la página (F5)
4. Si persiste: borra localStorage y vuelve a conectar

---

## 📊 Ejemplo de Uso Real: Proyecto Toyota

### Escenario
Proyecto de integración de GPS en radio Toyota, 3 meses, 10 personas, $500K presupuesto

### Setup
1. **Proyecto:** "Toyota Radio - GPS Integration"
2. **Hitos:**
   - Week 1-2: Requirements & Design ✓
   - Week 3-6: Implementation (Sprint 1)
   - Week 7-10: Implementation (Sprint 2)
   - Week 11-12: Testing & Integration
   - Week 13: Launch

3. **Tareas iniciales:** ~80 (desglosadas por módulo)
4. **Riesgos:** ~15 identificados
5. **Suppliers:** GPS Module, Radio Hardware, Testing Lab

### Monitoreo
**Diario:**
- Actualizo tareas completadas
- Reviso escalaciones (device integration, supplier delays)

**Semanal:**
- Team standup genera 3-4 nuevas tareas
- Risk review identifica nuevos riesgos
- Supplier check-in (GPS module lead time)

**Bi-weekly:**
- Sprint planning/review con milestone update
- Report ejecutivo a stakeholders

### Resultado
- 100% tareas on-track
- Riesgos identificados temprano (antes de que exploten)
- Supplier delays conocidas con 2 semanas de anticipación
- Launch a tiempo, dentro de presupuesto

---

## 🎓 Recursos Adicionales

- **GitHub Docs:** https://docs.github.com
- **Git Basics:** https://git-scm.com/book/en/v2
- **Project Management Best Practices:** PMI PMBOK

---

**Última actualización:** 2026-05-13
**Versión:** 1.0
