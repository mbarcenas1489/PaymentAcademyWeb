# 🥋 Payment Academy Web

Sistema web de **Control de Pagos y Gestión de Miembros** para academias, gimnasios y centros deportivos. Es una réplica moderna en **Next.js, React y TypeScript** de la aplicación móvil de Android, diseñada con **Material UI**, arquitectura basada en **Custom Hooks** y sincronizada en tiempo real con **Supabase**.

---

## 🚀 Características Principales

- **🔐 Autenticación y Roles:** Inicio de sesión seguro con Supabase Auth y resolución automática de roles (`owner`, `admin`, `staff`) mediante la tabla `organization_members`.
- **📊 Panel de Control y Resumen:**
  - Visualización del total recaudado en el mes en curso en pesos colombianos (`$ COP`).
  - Tarjetas de miembros con estado (*Activo*, *Congelado*, *Inactivo*), detalles del último pago y distintivo de vigencia (*Vigente*, *Próximo*, *Vencido*).
- **💳 Registro de Pagos por Pasos:**
  - Asistente guiado de 4 pasos (Selección de miembro, Monto y método, Período de vigencia con cálculo automático de +1 mes, y Revisión antes de guardar).
  - Validación estricta que previene pagos con fechas de vigencia solapadas para el mismo miembro.
- **🧾 Comprobante Gráfico (Recibo Digital):**
  - Generación del voucher idéntico al de la versión móvil mediante HTML5 Canvas.
  - Envío directo del comprobante por **WhatsApp** con formato optimizado y soporte para Web Share API.
  - Opción de descarga directa en imagen **PNG**.
- **👥 Gestión de Miembros:** Registro rápido de nuevos atletas/clientes y consulta de historial individual de pagos.
- **🎨 3 Modos de Tema Visual (Persistentes):**
  - ☀️ **Modo Claro:** Paleta cálida terracota (`#8B3D1F`) y fondos crema.
  - 🌙 **Modo Oscuro:** Interfaz oscura elegante con acentos terracota.
  - 🌊 **Modo Azul:** Estilo profesional en azul marino real (`#0B5ED7`) con fondos frescos.

---

## 🛠️ Tecnologías

- **Framework:** Next.js (App Router)
- **Biblioteca UI:** React 19 + TypeScript
- **Componentes y Estilos:** Material UI (MUI v6/v7) + Emotion + Tailwind CSS
- **Backend & Base de Datos:** Supabase (Auth & PostgreSQL)

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:

1. [Node.js](https://nodejs.org/) (versión 20 o superior recomendada).
2. [npm](https://www.npmjs.com/) (incluido con Node.js) o el gestor de paquetes de tu preferencia (`pnpm`, `yarn`).

---

## 🏁 Paso a Paso para Arrancar el Proyecto

### 1. Ubicarte en la carpeta del proyecto
Abre una terminal (PowerShell, Command Prompt o Bash) en la ruta del proyecto:

```bash
cd "d:\Apps\PaymentAcademyWeb"
```

### 2. Configurar las Variables de Entorno
Verifica que exista el archivo `.env.local` en la raíz del proyecto con las credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lzczlykyjvgtrlqluvvu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_btjzcIFevw2zrPFbptkbqA_GG59ZU3e
```

> [!NOTE]
> Este archivo ya se encuentra creado y configurado en este repositorio.

### 3. Instalar Dependencias (si es la primera vez)
Si descargas el proyecto en una máquina nueva o tras clonarlo:

```bash
npm install
```

### 4. Iniciar el Servidor de Desarrollo
Ejecuta el siguiente comando para levantar el servidor local:

```bash
npm run dev
```

### 5. Abrir en tu Navegador
Una vez iniciado el servidor, abre tu navegador web favorito y entra a:

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📦 Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con recarga en caliente (HMR). |
| `npm run build` | Compila y optimiza la aplicación para producción con verificación de tipos TypeScript. |
| `npm start` | Inicia la versión compilada de producción en el puerto 3000. |
| `npm run lint` | Ejecuta ESLint para analizar la calidad del código. |

---

## 📁 Estructura del Proyecto

```text
PaymentAcademyWeb/
├── .env.local                  # Variables de entorno de Supabase
├── package.json                # Dependencias y scripts
├── tsconfig.json               # Configuración de TypeScript y path aliases (@/*)
├── next.config.ts              # Configuración de Next.js
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout principal con ThemeRegistry
│   │   ├── page.tsx            # Página inicial (Control de sesión y Dashboard)
│   │   └── globals.css         # Estilos globales y reset
│   ├── components/             # Componentes en Material UI
│   │   ├── DashboardView.tsx   # Vista central con pestañas Resumen y Movimientos
│   │   ├── LoginView.tsx       # Pantalla de acceso con correo y contraseña
│   │   ├── Navbar.tsx          # Barra superior con selector de tema y acciones
│   │   ├── SummaryTab.tsx      # Pestaña Resumen (total mensual y miembros)
│   │   ├── MovementsTab.tsx    # Pestaña Movimientos (filtro de fechas y acciones)
│   │   ├── MembersDialog.tsx   # Modal de listado de miembros
│   │   ├── RegisterMemberDialog.tsx # Modal para registrar nuevo miembro
│   │   ├── PaymentFormDialog.tsx    # Asistente de 4 pasos para registro de pagos
│   │   ├── ReceiptModal.tsx    # Modal con previsualización del recibo y WhatsApp
│   │   ├── ConfirmDeleteDialog.tsx  # Diálogo de confirmación para eliminar pago
│   │   └── ThemeSelector.tsx   # Menú para alternar entre Claro / Oscuro / Azul
│   ├── hooks/                  # Patrón Custom Hooks
│   │   ├── useAuth.ts          # Gestión de autenticación y sesión
│   │   ├── useOrganization.ts  # Rol, permisos y organización activa
│   │   ├── useMembers.ts       # Operaciones de miembros
│   │   ├── usePayments.ts      # Registro, filtrado y cálculo de pagos
│   │   ├── useMemberSummaries.ts # Resumen de miembros con último pago
│   │   └── useReceipt.ts       # Renderizado en Canvas y compartir en WhatsApp
│   ├── theme/                  # Sistema de temas Material UI
│   │   ├── ThemeContext.tsx    # Contexto y paletas (Claro, Oscuro, Azul)
│   │   ├── ThemeRegistry.tsx   # Proveedor de tema para Next.js
│   │   └── theme.ts            # Definiciones de colores y tipografías
│   ├── types/                  # Interfaces y tipos de TypeScript
│   └── utils/
│       ├── formatters.ts       # Formateo de moneda COP, fechas y etiquetas
│       └── supabase/           # Clientes de Supabase (client, server, middleware)
```
