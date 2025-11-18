-- =====================================================================================================================
-- BASE DE DATOS INMOBILIARIA INMOTECH
-- =====================================================================================================================
-- Motor:           Microsoft SQL Server 2016+
-- Versión:         6.0 FINAL - CON ARQUITECTURA DE ADMINISTRATIVOS
-- Compatibilidad:  Sequelize ORM + Node.js + Express
-- Autor:           Sistema InmoTech
-- Fecha:           Octubre 2025
-- =====================================================================================================================

-- =====================================================================================================================
-- ARQUITECTURA DEL SISTEMA:
-- =====================================================================================================================
-- Este sistema separa dos tipos de usuarios:
--
-- 1. ADMINISTRATIVOS (Personal interno de InmoTech)
--    - Roles: Super Administrador, Administrador, Empleado
--    - Acceso a: Dashboard administrativo, gestión de citas, reportes, configuración
--    - Tabla especial: Administrativos (con código de empleado, cargo, departamento)
--
-- 2. USUARIOS/PROPIETARIOS (Clientes externos)
--    - Roles: Usuario (por defecto al registrarse), Propietario (cuando registra un inmueble)
--    - Acceso a: Ver inmuebles, agendar citas, gestionar sus propiedades
--    - NO tienen registro en tabla Administrativos
--
-- VENTAJAS:
-- - Separación clara de permisos y responsabilidades
-- - Auditoría del personal interno
-- - Seguridad mejorada (diferentes flujos de autenticación)
-- - Escalabilidad (fácil agregar más roles o módulos)
-- =====================================================================================================================

-- =====================================================================================================================
-- PASO 1: CREACIÓN DE LA BASE DE DATOS
-- =====================================================================================================================

-- Verificar si la base de datos ya existe, si no, crearla
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'InmobiliariaDB')
BEGIN
    CREATE DATABASE InmobiliariaDB;
    PRINT '✅ Base de datos InmobiliariaDB creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️  Base de datos InmobiliariaDB ya existe - usando existente';
END
GO

USE InmobiliariaDB;
GO

PRINT '';
PRINT '=====================================================================================================================';
PRINT 'INICIANDO CREACIÓN DE ESTRUCTURA DE BASE DE DATOS INMOTECH v6.0';
PRINT '=====================================================================================================================';
PRINT '';
GO

-- =====================================================================================================================
-- PASO 2: TABLAS PRINCIPALES - GESTIÓN DE PERSONAS
-- =====================================================================================================================
-- Estas tablas manejan toda la información de personas en el sistema, tanto administrativos como clientes

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Personas
-- Descripción: Tabla unificada que almacena TODOS los usuarios del sistema (admins, empleados, usuarios, propietarios)
--              Esta tabla es el núcleo de la gestión de personas
-- Relaciones:  - 1:1 con Acceso (credenciales de login)
--              - 1:1 con Administrativos (solo para personal interno)
--              - 1:N con Personas_rol (un usuario puede tener múltiples roles)
--              - 1:N con Citas (como cliente, agente o creador)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Personas]') AND type = 'U')
BEGIN
    CREATE TABLE Personas (
        -- Identificador único de la persona
        id_persona INT PRIMARY KEY IDENTITY(1,1),

        -- Información de documento (permite identificación sin duplicados)
        tipo_documento VARCHAR(5) NOT NULL CHECK (tipo_documento IN ('CC', 'CE', 'NIT', 'Pasaporte', 'TI')),
        numero_documento VARCHAR(20) NOT NULL,

        -- Nombres completos (unificados para simplicidad y mejor ordenamiento)
        nombre_completo VARCHAR(100) NOT NULL,
        apellido_completo VARCHAR(100) NOT NULL,

        -- Información de contacto
        correo VARCHAR(100) NOT NULL,             -- Obligatorio, usado para login
        telefono VARCHAR(20) NULL,                -- Formato: +57 XXX XXX XXXX

        -- Control de cuenta
        tiene_cuenta BIT NOT NULL DEFAULT 0,      -- 0: Persona sin cuenta (solo datos en citas), 1: Usuario registrado
        estado BIT NOT NULL DEFAULT 1,            -- 0: Inactivo, 1: Activo

        -- Auditoría
        fecha_registro DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        -- Constraints para integridad de datos
        CONSTRAINT UQ_Persona_Documento UNIQUE (tipo_documento, numero_documento),  -- No duplicar documentos
        CONSTRAINT UQ_Persona_Correo UNIQUE (correo),                                -- Email único para login
        CONSTRAINT CHK_Personas_Email CHECK (correo LIKE '%_@__%.__%'),             -- Formato email válido
        CONSTRAINT CHK_Personas_TipoDoc CHECK (tipo_documento IN ('CC', 'CE', 'NIT', 'Pasaporte', 'TI'))
    );
    PRINT '✅ Tabla Personas creada';
END
GO

-- Índices para optimizar búsquedas frecuentes
CREATE NONCLUSTERED INDEX IX_Personas_Documento ON Personas(tipo_documento, numero_documento);  -- Búsqueda por documento
CREATE NONCLUSTERED INDEX IX_Personas_Correo ON Personas(correo);                               -- Búsqueda por email (login)
CREATE NONCLUSTERED INDEX IX_Personas_TieneCuenta ON Personas(tiene_cuenta) INCLUDE (estado);   -- Filtrar usuarios registrados
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Acceso
-- Descripción: Almacena las credenciales de login (solo para usuarios con cuenta)
--              Relación 1:1 con Personas
-- Seguridad:   - Las contraseñas se almacenan hasheadas con bcrypt (nunca en texto plano)
--              - Incluye auditoría de último acceso
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Acceso]') AND type = 'U')
BEGIN
    CREATE TABLE Acceso (
        id_acceso INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,                    -- Relación 1:1 con Personas
        contrasena VARCHAR(255) NOT NULL,                  -- Hash bcrypt de la contraseña
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        ultimo_acceso DATETIME2(3) NULL,                   -- Se actualiza en cada login exitoso

        CONSTRAINT FK_Acceso_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Acceso creada';
END
GO

ALTER TABLE Acceso ADD ultimo_cambio_password DATETIME NULL DEFAULT GETDATE();
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Roles
-- Descripción: Define los roles del sistema con permisos específicos
--              Incluye flag para diferenciar roles administrativos de roles de clientes
-- Roles del sistema:
--   ADMINISTRATIVOS (es_rol_administrativo = 1):
--     - Super Administrador: Control total del sistema
--     - Administrador: Gestión administrativa
--     - Empleado: Agentes inmobiliarios
--   CLIENTES (es_rol_administrativo = 0):
--     - Usuario: Rol por defecto al registrarse
--     - Propietario: Usuarios que registran inmuebles
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type = 'U')
BEGIN
    CREATE TABLE Roles (
        id_rol INT PRIMARY KEY IDENTITY(1,1),
        nombre_rol VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(200) NULL,
        es_rol_administrativo BIT NOT NULL DEFAULT 0,     -- ✨ CLAVE: 1 = Personal interno, 0 = Cliente externo
        estado BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Tabla Roles creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Personas_rol
-- Descripción: Relación Many-to-Many entre Personas y Roles
--              Una persona puede tener múltiples roles (ej: un empleado puede ser también propietario)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Personas_rol]') AND type = 'U')
BEGIN
    CREATE TABLE Personas_rol (
        id_persona_rol INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL,
        id_rol INT NOT NULL,
        estado BIT NOT NULL DEFAULT 1,                    -- Permite desactivar rol sin eliminarlo
        fecha_asignacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_PersonasRol_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona) ON DELETE CASCADE,
        CONSTRAINT FK_PersonasRol_Rol FOREIGN KEY (id_rol) REFERENCES Roles(id_rol) ON DELETE CASCADE,
        CONSTRAINT UQ_PersonasRol_Unico UNIQUE (id_persona, id_rol)  -- No duplicar asignaciones
    );
    PRINT '✅ Tabla Personas_rol creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Permisos
-- Descripción: Almacena los permisos específicos por módulo para cada rol
-- Relación: Un rol puede tener múltiples permisos por módulo
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Permisos]') AND type = 'U')
BEGIN
    CREATE TABLE Permisos (
        id_permiso INT PRIMARY KEY IDENTITY(1,1),
        id_rol INT NOT NULL,
        modulo VARCHAR(50) NOT NULL,                    -- Ej: "gInmuebles", "gClientes"
        permiso VARCHAR(50) NOT NULL,                   -- Ej: "crear", "editar", "eliminar", "ver"
        estado BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Permisos_Rol FOREIGN KEY (id_rol) REFERENCES Roles(id_rol) ON DELETE CASCADE,
        CONSTRAINT UQ_Permiso_Unico UNIQUE (id_rol, modulo, permiso)
    );
    PRINT '✅ Tabla Permisos creada';
END
GO

-- Índice para búsquedas por rol
CREATE NONCLUSTERED INDEX IX_Permisos_Rol ON Permisos(id_rol);
GO

-- Índices para consultas de roles
CREATE NONCLUSTERED INDEX IX_PersonasRol_Persona ON Personas_rol(id_persona);  -- Obtener roles de una persona
CREATE NONCLUSTERED INDEX IX_PersonasRol_Rol ON Personas_rol(id_rol);          -- Obtener personas con un rol
GO

-- ======================[ TABLA DE PROPIETARIOS ]=========================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Propietarios]') AND type = 'U')
BEGIN
    CREATE TABLE [dbo].[Propietarios] (
        id_propietario INT IDENTITY(1,1) PRIMARY KEY,
        id_persona INT NOT NULL,
        numero_contrato NVARCHAR(50) NULL,
        fecha_inicio DATE NOT NULL DEFAULT CONVERT(date, GETDATE()),
        fecha_fin DATE NULL,
        estado NVARCHAR(20) NOT NULL DEFAULT 'Activo',
        CONSTRAINT FK_Propietarios_Personas FOREIGN KEY (id_persona)
            REFERENCES [dbo].[Personas](id_persona) ON DELETE CASCADE,
        CONSTRAINT UQ_Propietarios_Persona UNIQUE (id_persona)
    );
END
GO

CREATE NONCLUSTERED INDEX IX_Propietarios_estado ON [dbo].[Propietarios](estado);
CREATE NONCLUSTERED INDEX IX_Propietarios_id_persona ON [dbo].[Propietarios](id_persona);
GO

-- ======================[ CAMPOS Y FK EN INMUEBLES ]=========================

IF COL_LENGTH('dbo.Inmuebles', 'propietario') IS NULL
BEGIN
    ALTER TABLE dbo.Inmuebles ADD propietario NVARCHAR(200) NULL;
END
GO

IF COL_LENGTH('dbo.Inmuebles', 'id_propietario') IS NULL
BEGIN
    ALTER TABLE dbo.Inmuebles ADD id_propietario INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_Inmuebles_Propietarios'
    AND parent_object_id = OBJECT_ID('dbo.Inmuebles')
)
BEGIN
    ALTER TABLE dbo.Inmuebles
    ADD CONSTRAINT FK_Inmuebles_Propietarios
    FOREIGN KEY (id_propietario) REFERENCES [dbo].[Propietarios](id_propietario)
    ON DELETE SET NULL;
END
GO

CREATE NONCLUSTERED INDEX IX_Inmuebles_id_propietario ON dbo.Inmuebles(id_propietario);
GO

-- =====================================================================================================================
-- PASO 3: TABLA DE ADMINISTRATIVOS (PERSONAL INTERNO)
-- =====================================================================================================================
-- Esta es la tabla CLAVE de la nueva arquitectura

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Administrativos
-- Descripción: Almacena información adicional del PERSONAL INTERNO de InmoTech
--              Relación 1:1 con Personas (solo para personal con roles administrativos)
-- Uso:         - Gestión de RR.HH. (cargo, departamento, salario)
--              - Auditoría de personal interno
--              - Separación clara de permisos
-- Importante:  - Solo personas con roles administrativos tienen registro aquí
--              - Usuarios normales NO tienen registro en esta tabla
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Administrativos]') AND type = 'U')
BEGIN
    CREATE TABLE Administrativos (
        id_administrativo INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,                   -- Relación 1:1 con Personas

        -- Información laboral
        codigo_empleado VARCHAR(20) UNIQUE NOT NULL,      -- Código único del empleado (ej: EMP-001, ADMIN-002)
        fecha_ingreso DATE NOT NULL,                      -- Fecha de contratación
        cargo VARCHAR(100) NULL,                          -- Ej: Agente Inmobiliario, Gerente de Ventas
        departamento VARCHAR(100) NULL,                   -- Ej: Ventas, Administración, Tecnología

        -- Información adicional (opcional, para gestión de RR.HH.)
        salario DECIMAL(15,2) NULL,                       -- Salario mensual (confidencial)

        -- Estado laboral
        estado_laboral VARCHAR(50) NOT NULL DEFAULT 'Activo' CHECK (estado_laboral IN ('Activo', 'Inactivo', 'Suspendido', 'Retirado')),
        fecha_retiro DATE NULL,                           -- Solo si estado_laboral = 'Retirado'

        -- Observaciones administrativas
        observaciones TEXT NULL,

        -- Auditoría
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        -- Relaciones y validaciones
        CONSTRAINT FK_Administrativos_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona) ON DELETE CASCADE,
        CONSTRAINT CHK_Administrativos_FechaRetiro CHECK (fecha_retiro IS NULL OR fecha_retiro >= fecha_ingreso)
    );
    PRINT '✅ Tabla Administrativos creada - NUEVA ARQUITECTURA';
END
GO

-- Índices para consultas de personal
CREATE NONCLUSTERED INDEX IX_Administrativos_CodigoEmpleado ON Administrativos(codigo_empleado);
CREATE NONCLUSTERED INDEX IX_Administrativos_EstadoLaboral ON Administrativos(estado_laboral) WHERE estado_laboral = 'Activo';
GO

-- =====================================================================================================================
-- PASO 4: TABLAS DE INMUEBLES
-- =====================================================================================================================
-- Gestión de propiedades inmobiliarias

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Inmuebles
-- Descripción: Almacena la información básica de cada propiedad
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Inmuebles]') AND type = 'U')
BEGIN
    CREATE TABLE Inmuebles (
        id_inmueble INT PRIMARY KEY IDENTITY(1,1),
        registro_inmobiliario VARCHAR(50) NOT NULL UNIQUE,
        pais VARCHAR(50) NOT NULL,
        departamento VARCHAR(50) NOT NULL,
        ciudad VARCHAR(50) NOT NULL,
        barrio VARCHAR(50) NULL,
        direccion VARCHAR(100) NOT NULL,
        categoria VARCHAR(50) NULL,
        precio_venta DECIMAL(15,2) NULL,
        precio_arriendo DECIMAL(15,2) NULL,
        area_construida DECIMAL(10,2) NULL,
        area_terreno DECIMAL(10,2) NULL,
        descripcion TEXT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'Disponible',
        fecha_registro DATETIME2(3) NOT NULL DEFAULT GETDATE()
    );
END
GO

IF COL_LENGTH('dbo.Inmuebles', 'propietario') IS NULL
BEGIN
    ALTER TABLE dbo.Inmuebles ADD propietario NVARCHAR(200) NULL;
END
GO

IF COL_LENGTH('dbo.Inmuebles', 'id_propietario') IS NULL
BEGIN
    ALTER TABLE dbo.Inmuebles ADD id_propietario INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'FK_Inmuebles_Propietarios'
    AND parent_object_id = OBJECT_ID('dbo.Inmuebles')
)
BEGIN
    ALTER TABLE dbo.Inmuebles
    ADD CONSTRAINT FK_Inmuebles_Propietarios
    FOREIGN KEY (id_propietario) REFERENCES [dbo].[Propietarios](id_propietario)
    ON DELETE SET NULL;
END
GO

CREATE NONCLUSTERED INDEX IX_Inmuebles_id_propietario ON dbo.Inmuebles(id_propietario);
CREATE NONCLUSTERED INDEX IX_Inmuebles_Ciudad ON Inmuebles(ciudad, estado);
CREATE NONCLUSTERED INDEX IX_Inmuebles_Categoria ON Inmuebles(categoria);
CREATE NONCLUSTERED INDEX IX_Inmuebles_Precio ON Inmuebles(precio_venta);
GO


-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Propiedad_inmueble
-- Descripción: Relación entre Personas y sus Inmuebles (quién es dueño de qué)
--              Permite rastrear historial de propietarios
-- Importante:  Al crear un registro aquí, se debe actualizar el rol de la persona a 'Propietario'
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Propiedad_inmueble]') AND type = 'U')
BEGIN
    CREATE TABLE Propiedad_inmueble (
        id_propiedad INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
        id_persona INT NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_final DATE NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
        CONSTRAINT FK_Propiedad_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble) ON DELETE CASCADE,
        CONSTRAINT FK_Propiedad_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        CONSTRAINT CHK_Propiedad_Fechas CHECK (fecha_final IS NULL OR fecha_final >= fecha_inicio)
    );
END
GO

-- =====================================================================================================================
-- PASO 5: MÓDULO DE CITAS (CORE DEL SISTEMA)
-- =====================================================================================================================
-- Sistema completo de agendamiento de citas para visitas, avalúos, asesorías

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Servicios_cita
-- Descripción: Catálogo de servicios que se pueden agendar
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Servicios_cita]') AND type = 'U')
BEGIN
    CREATE TABLE Servicios_cita (
        id_servicio INT PRIMARY KEY IDENTITY(1,1),
        nombre_servicio VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT NULL,
        duracion_estimada INT NOT NULL DEFAULT 45,          -- En minutos
        estado BIT NOT NULL DEFAULT 1,                      -- 1: Activo, 0: Inactivo

        CONSTRAINT CHK_ServicioCita_Duracion CHECK (duracion_estimada > 0 AND duracion_estimada <= 480)
    );
    PRINT '✅ Tabla Servicios_cita creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Estados_cita
-- Descripción: Ciclo de vida de una cita
-- Flujo típico: Solicitada → Confirmada → Programada → Completada
--               (o en cualquier momento → Cancelada / Reagendada)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Estados_cita]') AND type = 'U')
BEGIN
    CREATE TABLE Estados_cita (
        id_estado_cita INT PRIMARY KEY IDENTITY(1,1),
        nombre_estado VARCHAR(50) NOT NULL UNIQUE,
        orden INT NOT NULL,                                 -- Orden en el ciclo de vida
        descripcion VARCHAR(200) NULL,
        es_estado_final BIT NOT NULL DEFAULT 0,             -- 1: Estado terminal (Completada, Cancelada)
        estado BIT NOT NULL DEFAULT 1
    );
    PRINT '✅ Tabla Estados_cita creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Citas (TABLA PRINCIPAL DEL MÓDULO)
-- Descripción: Registro de todas las citas del sistema
-- Flujo de creación:
--   1. Usuario/Cliente solicita cita desde el frontend (estado: Solicitada)
--   2. Se crea notificación para agentes administrativos
--   3. Agente confirma la cita (estado: Confirmada) y se asigna como responsable
--   4. El día de la cita cambia a Programada
--   5. Después de la visita cambia a Completada
-- Validaciones importantes:
--   - No permitir overlaps de horarios en el mismo inmueble
--   - Fecha debe ser >= hoy
--   - hora_fin > hora_inicio
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Citas]') AND type = 'U')
BEGIN
    CREATE TABLE Citas (
        id_cita INT PRIMARY KEY IDENTITY(1,1),

        -- Personas involucradas
        id_persona INT NOT NULL,                            -- Cliente que solicita la cita
        id_inmueble INT NOT NULL,                           -- Inmueble a visitar
        id_servicio INT NOT NULL,                           -- Tipo de servicio (Visita, Avalúo, etc.)
        id_usuario_creador INT NULL,                        -- Quién creó la cita (puede ser el cliente o un agente)

        -- Fecha y hora
        fecha_cita DATE NOT NULL,
        hora_inicio TIME(0) NOT NULL,
        hora_fin TIME(0) NOT NULL,

        -- Estado y asignación
        id_estado_cita INT NOT NULL DEFAULT 1,              -- Default: Solicitada
        id_agente_asignado INT NULL,                        -- Agente que atenderá la cita (se asigna al confirmar)

        -- Información adicional
        observaciones TEXT NULL,                            -- Notas del cliente o agente
        motivo_cancelacion VARCHAR(500) NULL,               -- Solo si se cancela

        -- Reagendamiento
        es_reagendada BIT NOT NULL DEFAULT 0,               -- 1: Esta cita es un reagendamiento
        id_cita_original INT NULL,                          -- Referencia a la cita original (si es reagendamiento)

        -- Auditoría de estados (timestamps de cambios)
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_confirmacion DATETIME2(3) NULL,               -- Cuándo el agente confirmó
        fecha_cancelacion DATETIME2(3) NULL,                -- Cuándo se canceló
        fecha_completada DATETIME2(3) NULL,                 -- Cuándo se completó
        fecha_actualizacion DATETIME2(3) NULL,              -- Última modificación

        -- Foreign Keys
        CONSTRAINT FK_Citas_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Citas_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble) ON DELETE CASCADE,
        CONSTRAINT FK_Citas_Servicio FOREIGN KEY (id_servicio) REFERENCES Servicios_cita(id_servicio),
        CONSTRAINT FK_Citas_Estado FOREIGN KEY (id_estado_cita) REFERENCES Estados_cita(id_estado_cita),
        CONSTRAINT FK_Citas_Agente FOREIGN KEY (id_agente_asignado) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Citas_Creador FOREIGN KEY (id_usuario_creador) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Citas_CitaOriginal FOREIGN KEY (id_cita_original) REFERENCES Citas(id_cita),

        -- Validaciones
        CONSTRAINT CHK_Citas_HoraValida CHECK (hora_fin > hora_inicio),
        CONSTRAINT CHK_Citas_FechaFuturo CHECK (fecha_cita >= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Citas creada';
END
GO

-- Índices optimizados para consultas frecuentes
CREATE NONCLUSTERED INDEX IX_Citas_Estado ON Citas(id_estado_cita, fecha_cita, hora_inicio);  -- Dashboard de citas
CREATE NONCLUSTERED INDEX IX_Citas_Agente ON Citas(id_agente_asignado) WHERE id_agente_asignado IS NOT NULL;  -- Citas de un agente
CREATE NONCLUSTERED INDEX IX_Citas_Fecha ON Citas(fecha_cita, hora_inicio);                   -- Búsqueda por fecha
CREATE NONCLUSTERED INDEX IX_Citas_Persona ON Citas(id_persona);                              -- Historial de cliente
CREATE NONCLUSTERED INDEX IX_Citas_ConflictoHorario ON Citas(id_inmueble, fecha_cita, hora_inicio, hora_fin) INCLUDE (id_estado_cita);  -- Verificar disponibilidad
CREATE NONCLUSTERED INDEX IX_Citas_Creador ON Citas(id_usuario_creador);                      -- Quién creó las citas
GO




-- =====================================================================================================================
-- TABLA DE HISTORIAL DE ASIGNACIÓN DE AGENTES
-- =====================================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HistorialAsignacionAgentes]') AND type = 'U')
BEGIN
    CREATE TABLE HistorialAsignacionAgentes (
        id_historial INT PRIMARY KEY IDENTITY(1,1),

        -- Relación con cita
        id_cita INT NOT NULL,

        -- Agentes involucrados
        id_agente_anterior INT NULL,  -- NULL si es primera asignación
        id_agente_nuevo INT NOT NULL,

        -- Información de la asignación
        comentario TEXT NULL,  -- Obligatorio cuando se reasigna
        estado_asignacion VARCHAR(20) NOT NULL DEFAULT 'Activa',  -- Activa, Reasignada, Cancelada

        -- Usuario que realizó la asignación/reasignación
        id_usuario_realizo INT NOT NULL,  -- Quién realizó la acción

        -- Fechas
        fecha_asignacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        -- Auditoría
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_HistorialAsignacion_Cita FOREIGN KEY (id_cita) REFERENCES Citas(id_cita) ON DELETE CASCADE,
        CONSTRAINT FK_HistorialAsignacion_AgenteAnterior FOREIGN KEY (id_agente_anterior) REFERENCES Personas(id_persona),
        CONSTRAINT FK_HistorialAsignacion_AgenteNuevo FOREIGN KEY (id_agente_nuevo) REFERENCES Personas(id_persona),
        CONSTRAINT FK_HistorialAsignacion_UsuarioRealizo FOREIGN KEY (id_usuario_realizo) REFERENCES Personas(id_persona),
        CONSTRAINT CHK_HistorialAsignacion_Estado CHECK (estado_asignacion IN ('Activa', 'Reasignada', 'Cancelada'))
    );
    PRINT '✅ Tabla HistorialAsignacionAgentes creada - NUEVA FUNCIONALIDAD';
END
GO

-- Índices para búsquedas frecuentes
CREATE NONCLUSTERED INDEX IX_Historial_Cita ON HistorialAsignacionAgentes(id_cita, fecha_asignacion DESC);
CREATE NONCLUSTERED INDEX IX_Historial_AgenteNuevo ON HistorialAsignacionAgentes(id_agente_nuevo);
CREATE NONCLUSTERED INDEX IX_Historial_UsuarioRealizo ON HistorialAsignacionAgentes(id_usuario_realizo);
GO




-- =====================================================================================================================
-- PASO 6: SISTEMA DE NOTIFICACIONES
-- =====================================================================================================================
-- Notifica a agentes cuando hay citas solicitadas, canceladas, etc.

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Notificaciones
-- Descripción: Sistema de notificaciones para agentes y usuarios
-- Tipos:       CITA_SOLICITADA (nueva cita, notifica a agentes)
--              CITA_CONFIRMADA (cita confirmada, notifica a cliente)
--              CITA_CANCELADA (cita cancelada, notifica a ambos)
--              CITA_REAGENDADA (cita reagendada, notifica a ambos)
--              CITA_COMPLETADA (cita completada, notifica a cliente)
-- Destinatarios: - Por rol (id_rol_destino): Notifica a todos con ese rol (ej: todos los Empleados)
--                - Por persona (id_persona_destino): Notifica a una persona específica
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND type = 'U')
BEGIN
    CREATE TABLE Notificaciones (
        id_notificacion INT PRIMARY KEY IDENTITY(1,1),

        -- Tipo y contenido
        tipo_notificacion VARCHAR(50) NOT NULL CHECK (tipo_notificacion IN ('CITA_SOLICITADA', 'CITA_CANCELADA', 'CITA_REAGENDADA', 'CITA_CONFIRMADA', 'CITA_COMPLETADA', 'SISTEMA', 'ALERTA')),
        titulo VARCHAR(200) NOT NULL,
        mensaje TEXT NOT NULL,

        -- Relación con cita (si aplica)
        id_cita INT NULL,

        -- Destinatarios (puede ser por rol o por persona individual)
        id_rol_destino INT NULL,                            -- Notificar a todos con este rol
        id_persona_destino INT NULL,                        -- Notificar a persona específica

        -- Estado de lectura
        leida BIT NOT NULL DEFAULT 0,                       -- 0: No leída, 1: Leída
        fecha_leida DATETIME2(3) NULL,

        -- Auditoría
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        -- Foreign Keys
        CONSTRAINT FK_Notificaciones_Cita FOREIGN KEY (id_cita) REFERENCES Citas(id_cita) ON DELETE CASCADE,
        CONSTRAINT FK_Notificaciones_Rol FOREIGN KEY (id_rol_destino) REFERENCES Roles(id_rol),
        CONSTRAINT FK_Notificaciones_Persona FOREIGN KEY (id_persona_destino) REFERENCES Personas(id_persona),

        -- Al menos uno debe estar presente
        CONSTRAINT CHK_Notificaciones_Destino CHECK (id_rol_destino IS NOT NULL OR id_persona_destino IS NOT NULL)
    );
    PRINT '✅ Tabla Notificaciones creada';
END
GO

-- Índices para consultas de notificaciones
CREATE NONCLUSTERED INDEX IX_Notificaciones_NoLeidas ON Notificaciones(leida, fecha_creacion DESC) WHERE leida = 0;  -- Campana de notificaciones
CREATE NONCLUSTERED INDEX IX_Notificaciones_Rol ON Notificaciones(id_rol_destino) WHERE id_rol_destino IS NOT NULL;
CREATE NONCLUSTERED INDEX IX_Notificaciones_Persona ON Notificaciones(id_persona_destino) WHERE id_persona_destino IS NOT NULL;
GO

-- =====================================================================================================================
-- PASO 7: MÓDULO DE REPORTES
-- =====================================================================================================================
-- Sistema de reportes de problemas en inmuebles

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Reportes
-- Descripción: Registro de problemas, quejas o sugerencias sobre inmuebles
-- Tipos:       Mantenimiento, Daño, Queja, Sugerencia
-- Estados:     Pendiente → En Proceso → Resuelto → Cerrado
-- ---------------------------------------------------------------------------------------------------------------------
-- MÓDULO DE REPORTES Y DEPENDENCIAS

-- ================= Tabla principal: Reportes =================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reportes]') AND type = 'U')
BEGIN
    CREATE TABLE Reportes (
        id_reporte INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
        tipo_reporte VARCHAR(50) NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
        descripcion TEXT NOT NULL,
        fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
        fecha_estado DATETIME NULL,
        id_responsable INT NOT NULL,
        seguimiento_general TEXT NULL,
        id_persona_reporta INT NOT NULL,
        fecha_modificacion DATETIME NULL,
        FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble),
        FOREIGN KEY (id_responsable) REFERENCES Personas(id_persona),
        FOREIGN KEY (id_persona_reporta) REFERENCES Personas(id_persona)
    );
END
GO

-- Asegura compatibilidad con campo de seguimiento general
IF COL_LENGTH('dbo.Reportes', 'seguimiento_general') IS NULL
BEGIN
    ALTER TABLE Reportes ADD seguimiento_general TEXT NULL;
END
GO

-- Índices para búsquedas optimizadas
CREATE NONCLUSTERED INDEX IX_Reportes_Inmueble ON Reportes(id_inmueble);
CREATE NONCLUSTERED INDEX IX_Reportes_Estado ON Reportes(estado) INCLUDE (fecha_creacion);
CREATE NONCLUSTERED INDEX IX_Reportes_Responsable ON Reportes(id_responsable);
GO

-- --------------- Tabla: Reporte_Imagen ----------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reporte_Imagen]') AND type = 'U')
BEGIN
    CREATE TABLE Reporte_Imagen (
        id_imagen INT PRIMARY KEY IDENTITY(1,1),
        id_reporte INT NOT NULL,
        url_imagen VARCHAR(255) NOT NULL,
        descripcion VARCHAR(200) NULL,
        FOREIGN KEY (id_reporte) REFERENCES Reportes(id_reporte) ON DELETE CASCADE
    );
END
GO

-- --------------- Tabla: Reporte_Archivo ---------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reporte_Archivo]') AND type = 'U')
BEGIN
    CREATE TABLE Reporte_Archivo (
        id_archivo INT PRIMARY KEY IDENTITY(1,1),
        id_reporte INT NOT NULL,
        url_archivo VARCHAR(255) NOT NULL,
        descripcion VARCHAR(200) NULL,
        FOREIGN KEY (id_reporte) REFERENCES Reportes(id_reporte) ON DELETE CASCADE
    );
END
GO

-- --------------- Tabla: Reporte_Rubro -----------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reporte_Rubro]') AND type = 'U')
BEGIN
    CREATE TABLE Reporte_Rubro (
        id_rubro INT PRIMARY KEY IDENTITY(1,1),
        id_reporte INT NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT NULL,
        FOREIGN KEY (id_reporte) REFERENCES Reportes(id_reporte) ON DELETE CASCADE
    );
END
GO

-- --------------- Tabla: Rubro_Seguimiento --------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rubro_Seguimiento]') AND type = 'U')
BEGIN
    CREATE TABLE Rubro_Seguimiento (
        id_seguimiento INT PRIMARY KEY IDENTITY(1,1),
        id_rubro INT NOT NULL,
        fecha DATETIME NOT NULL DEFAULT GETDATE(),
        estado VARCHAR(20) NOT NULL,
        id_responsable INT NOT NULL,
        descripcion TEXT NOT NULL,
        FOREIGN KEY (id_rubro) REFERENCES Reporte_Rubro(id_rubro) ON DELETE CASCADE,
        FOREIGN KEY (id_responsable) REFERENCES Personas(id_persona)
    );
END
GO

-- --------------- Tabla: Reporte_Seguimiento_General -----------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reporte_Seguimiento_General]') AND type = 'U')
BEGIN
    CREATE TABLE Reporte_Seguimiento_General (
        id_seguimiento_general INT PRIMARY KEY IDENTITY(1,1),
        id_reporte INT NOT NULL,
        fecha DATETIME NOT NULL DEFAULT GETDATE(),
        estado VARCHAR(20) NOT NULL,
        id_responsable INT NOT NULL,
        descripcion TEXT NOT NULL,
        FOREIGN KEY (id_reporte) REFERENCES Reportes(id_reporte) ON DELETE CASCADE,
        FOREIGN KEY (id_responsable) REFERENCES Personas(id_persona)
    );
END
GO

-- --------- Índices para optimizar seguimientos ---------------
CREATE NONCLUSTERED INDEX IX_Rubro_Seguimiento_Rubro ON Rubro_Seguimiento(id_rubro, fecha);
CREATE NONCLUSTERED INDEX IX_Reporte_Seguimiento_General_Reporte ON Reporte_Seguimiento_General(id_reporte, fecha);
GO


-- =====================================================================================================================
-- PASO 8: FUNCIONES Y VISTAS AUXILIARES
-- =====================================================================================================================
-- Funciones helper y vistas optimizadas para consultas frecuentes

-- ---------------------------------------------------------------------------------------------------------------------
-- Función: fn_EsAdministrativo
-- Descripción: Verifica si una persona es parte del personal administrativo activo
-- Uso:         SELECT dbo.fn_EsAdministrativo(123) -- Retorna 1 si es admin activo, 0 si no
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.fn_EsAdministrativo', 'FN') IS NOT NULL
    DROP FUNCTION dbo.fn_EsAdministrativo;
GO

CREATE FUNCTION dbo.fn_EsAdministrativo(@id_persona INT)
RETURNS BIT
AS
BEGIN
    DECLARE @resultado BIT = 0;

    -- Verificar si existe en Administrativos con estado Activo
    IF EXISTS (
        SELECT 1
        FROM Administrativos
        WHERE id_persona = @id_persona
          AND estado_laboral = 'Activo'
    )
        SET @resultado = 1;

    RETURN @resultado;
END
GO
PRINT '✅ Función fn_EsAdministrativo creada';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Vista: vw_PersonalAdministrativo
-- Descripción: Vista consolidada del personal administrativo con sus roles
-- Uso:         SELECT * FROM vw_PersonalAdministrativo WHERE estado_laboral = 'Activo'
-- Beneficios:  - Simplifica consultas complejas
--              - Centraliza lógica de joins
--              - Optimizada con índices subyacentes
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.vw_PersonalAdministrativo', 'V') IS NOT NULL
    DROP VIEW dbo.vw_PersonalAdministrativo;
GO

CREATE VIEW dbo.vw_PersonalAdministrativo AS
SELECT
    -- Datos del administrativo
    a.id_administrativo,
    a.codigo_empleado,
    a.cargo,
    a.departamento,
    a.fecha_ingreso,
    a.estado_laboral,

    -- Datos de la persona
    p.id_persona,
    p.tipo_documento,
    p.numero_documento,
    p.correo,
    p.telefono,

    -- Nombre completo concatenado
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) AS nombre_completo,

    -- Roles concatenados (separados por coma)
    STRING_AGG(r.nombre_rol, ', ') AS roles,

    -- Último acceso
    acc.ultimo_acceso
FROM Administrativos a
INNER JOIN Personas p ON a.id_persona = p.id_persona
LEFT JOIN Acceso acc ON p.id_persona = acc.id_persona
LEFT JOIN Personas_rol pr ON p.id_persona = pr.id_persona AND pr.estado = 1
LEFT JOIN Roles r ON pr.id_rol = r.id_rol AND r.estado = 1
WHERE p.estado = 1  -- Solo personas activas
GROUP BY
    a.id_administrativo, a.codigo_empleado, a.cargo, a.departamento, a.fecha_ingreso, a.estado_laboral,
    p.id_persona, p.tipo_documento, p.numero_documento, p.correo, p.telefono,
    p.nombre_completo, p.apellido_completo,
    acc.ultimo_acceso;
GO
PRINT '✅ Vista vw_PersonalAdministrativo creada';
GO

-- =====================================================================================================================
-- PASO 9: DATOS INICIALES (SEEDS)
-- =====================================================================================================================
-- Insertar datos necesarios para que el sistema funcione desde el inicio

PRINT '';
PRINT '=====================================================================================================================';
PRINT 'INSERTANDO DATOS INICIALES (SEEDS)';
PRINT '=====================================================================================================================';
PRINT '';

-- ---------------------------------------------------------------------------------------------------------------------
-- Seeds: Roles del sistema
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = 'Super Administrador')
BEGIN
    INSERT INTO Roles (nombre_rol, descripcion, es_rol_administrativo) VALUES
    -- Roles administrativos (personal interno)
    ('Super Administrador', 'Acceso total al sistema con todos los permisos', 1),
    ('Administrador', 'Gestión administrativa y configuración del sistema', 1),
    ('Empleado', 'Agentes inmobiliarios y empleados de la empresa', 1),
    -- Roles de clientes
    ('Usuario', 'Rol por defecto al registrarse en el sistema', 0),
    ('Propietario', 'Usuarios que tienen inmuebles registrados a su nombre', 0);

    PRINT '✅ Roles insertados:';
    PRINT '   - Super Administrador (Administrativo)';
    PRINT '   - Administrador (Administrativo)';
    PRINT '   - Empleado (Administrativo)';
    PRINT '   - Usuario (Cliente)';
    PRINT '   - Propietario (Cliente)';
END
ELSE
BEGIN
    PRINT '⚠️  Roles ya existen en la base de datos';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Seeds: Estados de Cita
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Estados_cita WHERE nombre_estado = 'Solicitada')
BEGIN
    INSERT INTO Estados_cita (nombre_estado, orden, descripcion, es_estado_final) VALUES
    ('Solicitada', 1, 'Cita solicitada por el cliente, pendiente de confirmación por un agente', 0),
    ('Confirmada', 2, 'Cita confirmada por un agente inmobiliario', 0),
    ('Programada', 3, 'Cita programada y lista para realizarse', 0),
    ('Reagendada', 4, 'Cita reagendada a nueva fecha y hora', 0),
    ('Completada', 5, 'Cita completada exitosamente', 1),
    ('Cancelada', 6, 'Cita cancelada por alguna de las partes', 1);

    PRINT '✅ Estados de cita insertados (6 estados)';
END
ELSE
BEGIN
    PRINT '⚠️  Estados de cita ya existen';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Seeds: Servicios de Cita
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Servicios_cita WHERE nombre_servicio = 'Visita a Propiedad')
BEGIN
    INSERT INTO Servicios_cita (nombre_servicio, descripcion, duracion_estimada) VALUES
    ('Visita a Propiedad', 'Visita presencial para conocer el inmueble en detalle', 45),
    ('Avalúos', 'Servicio de avalúo y tasación profesional de inmuebles', 60),
    ('Gestión de Alquileres', 'Asesoría sobre gestión y administración de alquileres', 30),
    ('Asesoría Legal', 'Consulta legal relacionada con transacciones inmobiliarias', 45);

    PRINT '✅ Servicios de cita insertados (4 servicios)';
END
ELSE
BEGIN
    PRINT '⚠️  Servicios de cita ya existen';
END
GO

-- Script para agregar el campo motivo_reagendamiento a la tabla Citas
-- Ejecutar este script en la base de datos InmobiliariaDB

USE InmobiliariaDB;
GO

-- Verificar si el campo ya existe
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID('Citas')
    AND name = 'motivo_reagendamiento'
)
BEGIN
    -- Agregar el campo motivo_reagendamiento con tipo NVARCHAR(MAX) para compatibilidad con índices
    ALTER TABLE Citas
    ADD motivo_reagendamiento NVARCHAR(MAX) NULL;

    PRINT '✅ Campo motivo_reagendamiento agregado exitosamente a la tabla Citas';
END
ELSE
BEGIN
    PRINT '⚠️  El campo motivo_reagendamiento ya existe en la tabla Citas';
END
GO


-- Crear índice para búsquedas por motivo de reagendamiento (opcional)
-- Nota: En SQL Server, NVARCHAR(MAX) puede ser indexado pero con limitaciones
-- Si hay problemas, este índice puede ser removido
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('Citas') AND name = 'IX_Citas_MotivoReagendamiento')
BEGIN
    BEGIN TRY
        CREATE NONCLUSTERED INDEX IX_Citas_MotivoReagendamiento
        ON Citas(motivo_reagendamiento)
        WHERE motivo_reagendamiento IS NOT NULL;

        PRINT '✅ Índice IX_Citas_MotivoReagendamiento creado';
    END TRY
    BEGIN CATCH
        PRINT '⚠️  No se pudo crear el índice IX_Citas_MotivoReagendamiento (posiblemente por limitaciones de NVARCHAR(MAX))';
        PRINT '   El campo funciona correctamente sin índice para este caso de uso.';
    END CATCH
END
ELSE
BEGIN
    PRINT '⚠️  El índice IX_Citas_MotivoReagendamiento ya existe';
END
GO

PRINT '';
PRINT '🎯 CAMPO motivo_reagendamiento AGREGADO EXITOSAMENTE';
PRINT '';
PRINT '📋 DESCRIPCIÓN DEL CAMPO:';
PRINT '   - Nombre: motivo_reagendamiento';
PRINT '   - Tipo: NVARCHAR(MAX) (permite textos largos en Unicode)';
PRINT '   - Nullable: Sí (NULL cuando no es reagendamiento)';
PRINT '   - Uso: Almacena el motivo específico de reprogramación';
PRINT '';
PRINT '💡 USO EN LA APLICACIÓN:';
PRINT '   - Se llena cuando se reprograma una cita';
PRINT '   - Se muestra en la vista de detalles de citas reagendadas';
PRINT '   - Permite seguimiento específico de reagendamientos';
PRINT '';


-- ======================[ INMUEBLE DE PRUEBA ]=========================

IF NOT EXISTS (SELECT 1 FROM Inmuebles WHERE registro_inmobiliario = 'INM-001-TEST')
BEGIN
    INSERT INTO Inmuebles (
        registro_inmobiliario,
        pais,
        departamento,
        ciudad,
        barrio,
        direccion,
        categoria,
        precio_venta,
        precio_arriendo,
        area_construida,
        area_terreno,
        descripcion,
        estado
    )
    VALUES (
        'INM-001-TEST',
        'Colombia',
        'Antioquia',
        'Medellín',
        'El Poblado',
        'Calle 50 #45-20',
        'Apartamento',
        450000000.00,
        NULL,
        120.50,
        NULL,
        'Apartamento de prueba para testing del sistema. 3 habitaciones, 2 baños, balcón con vista.',
        'Disponible'
    );
    PRINT 'Inmueble de prueba creado: INM-001-TEST';
END
GO

-- ======================[ PROPIETARIO DE PRUEBA ]=========================
-- Crea la persona, la asocia como propietario y luego actualiza el inmueble

IF NOT EXISTS (SELECT 1 FROM dbo.Personas WHERE numerodocumento = '900000001')
BEGIN
    INSERT INTO dbo.Personas (
        tipodocumento,
        numerodocumento,
        nombrecompleto,
        apellidocompleto,
        correo,
        telefono,
        tienecuenta
    )
    VALUES (
        'CC',
        '900000001',
        'Propietario',
        'De Prueba',
        'propietario.prueba@inmotech.com',
        '57 300 111 2233',
        0
    );
    PRINT 'Persona de prueba creada: 900000001';
END
ELSE
BEGIN
    PRINT 'Persona de prueba ya existe: 900000001';
END
GO

DECLARE @idpersonaprop INT = (SELECT idpersona FROM dbo.Personas WHERE numerodocumento = '900000001');

IF NOT EXISTS (SELECT 1 FROM dbo.Propietarios WHERE idpersona = @idpersonaprop)
BEGIN
    INSERT INTO dbo.Propietarios (
        idpersona,
        numerocontrato,
        estado
    )
    VALUES (
        @idpersonaprop,
        'TEST-001',
        'Activo'
    );
    PRINT 'Propietario de prueba registrado en Propietarios';
END
ELSE BEGIN
    PRINT 'Propietario de prueba ya existe en Propietarios';
END
GO

DECLARE @idpropietario INT = (SELECT idpropietario FROM dbo.Propietarios WHERE idpersona = @idpersonaprop);
DECLARE @idinmuebletest INT = (SELECT idinmueble FROM dbo.Inmuebles WHERE registro_inmobiliario = 'INM-001-TEST');

IF @idinmuebletest IS NOT NULL AND @idpersonaprop IS NOT NULL
BEGIN
    UPDATE dbo.Inmuebles
    SET
        idpropietario = @idpropietario,
        propietario = (
            SELECT CONCAT(nombrecompleto, ' ', apellidocompleto)
            FROM dbo.Personas
            WHERE idpersona = @idpersonaprop
        )
    WHERE idinmueble = @idinmuebletest;
    PRINT 'Inmuebles.idpropietario y Inmuebles.propietario actualizados para INM-001-TEST';
END
ELSE
BEGIN
    PRINT 'No se pudo asociar; verifica que existan INM-001-TEST y la persona de prueba';
END
GO


-- =====================================================================================================================
-- PASO 9.5: OPTIMIZACIÓN DE ÍNDICES PARA ENDPOINTS LENTOS
-- =====================================================================================================================
-- Este script agrega índices faltantes en columnas FK para mejorar rendimiento de JOINs
-- Especialmente optimizado para /api/v1/citas, /api/v1/personas, /api/v1/administrativos
-- Debe ejecutarse DESPUÉS de crear todas las tablas y datos iniciales
-- =====================================================================================================================

PRINT '';
PRINT '=====================================================================================================================';
PRINT 'OPTIMIZACIÓN DE ÍNDICES PARA MEJORAR RENDIMIENTO DE CONSULTAS';
PRINT '=====================================================================================================================';
PRINT '';

-- Índices para tabla Citas (FKs más consultadas en endpoints de citas)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('Citas') AND name = 'IX_Citas_Inmueble')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Citas_Inmueble ON Citas(id_inmueble);
    PRINT '✅ Índice agregado: IX_Citas_Inmueble';
END
ELSE
BEGIN
    PRINT '⚠️  Índice IX_Citas_Inmueble ya existe';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('Citas') AND name = 'IX_Citas_Servicio')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Citas_Servicio ON Citas(id_servicio);
    PRINT '✅ Índice agregado: IX_Citas_Servicio';
END
ELSE
BEGIN
    PRINT '⚠️  Índice IX_Citas_Servicio ya existe';
END

-- Índices para tabla Administrativos (optimización de consultas de personal)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('Administrativos') AND name = 'IX_Administrativos_Persona')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Administrativos_Persona ON Administrativos(id_persona);
    PRINT '✅ Índice agregado: IX_Administrativos_Persona';
END
ELSE
BEGIN
    PRINT '⚠️  Índice IX_Administrativos_Persona ya existe';
END

-- Índices para tabla Personas_rol (optimización de filtros por roles y estado)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('Personas_rol') AND name = 'IX_PersonasRol_Estado')
BEGIN
    CREATE NONCLUSTERED INDEX IX_PersonasRol_Estado ON Personas_rol(id_persona, estado) WHERE estado = 1;
    PRINT '✅ Índice agregado: IX_PersonasRol_Estado (filtrado para activos)';
END
ELSE
BEGIN
    PRINT '⚠️  Índice IX_PersonasRol_Estado ya existe';
END

-- Índice compuesto para optimización de consultas con joins complejos rol-persona
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('Personas_rol') AND name = 'IX_PersonasRol_RolEstado')
BEGIN
    CREATE NONCLUSTERED INDEX IX_PersonasRol_RolEstado ON Personas_rol(id_rol, estado) INCLUDE (id_persona) WHERE estado = 1;
    PRINT '✅ Índice agregado: IX_PersonasRol_RolEstado (con columna incluida)';
END
ELSE
BEGIN
    PRINT '⚠️  Índice IX_PersonasRol_RolEstado ya existe';
END

-- Índice para consultas de personas con cuenta activa (login y autenticación)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('Personas') AND name = 'IX_Personas_EstadoCuenta')
BEGIN
    CREATE NONCLUSTERED INDEX IX_Personas_EstadoCuenta ON Personas(estado, tiene_cuenta) WHERE estado = 1;
    PRINT '✅ Índice agregado: IX_Personas_EstadoCuenta (filtrado para activos)';
END
ELSE
BEGIN
    PRINT '⚠️  Índice IX_Personas_EstadoCuenta ya existe';
END

PRINT '';
PRINT '🎯 OPTIMIZACIÓN DE ÍNDICES COMPLETADA';
PRINT '';
PRINT '📊 Estos índices mejorarán significativamente el rendimiento de:';
PRINT '   ✓ GET /api/v1/citas         - Joins con persona, inmueble, servicio';
PRINT '   ✓ GET /api/v1/personas      - Filtrado por rol Usuario y estado activo';
PRINT '   ✓ GET /api/v1/administrativos - Joins con persona y roles';
PRINT '   ✓ POST /api/v1/auth/login   - Búsqueda de usuarios con cuenta activa';
PRINT '';
PRINT '💡 RECOMENDACIONES:';
PRINT '   - Monitorear tiempo de respuesta de los endpoints después de aplicar';
PRINT '   - Usar SET STATISTICS TIME ON para medir mejoras';
PRINT '   - Considerar actualizar estadísticas: UPDATE STATISTICS [tabla]';
PRINT '';
GO





-- =====================================================================================================================
-- PASO 10: VERIFICACIÓN FINAL Y RESUMEN
-- =====================================================================================================================

PRINT '';
PRINT '=====================================================================================================================';
PRINT '                           ✅ BASE DE DATOS INMOTECH v6.0 CREADA EXITOSAMENTE';
PRINT '=====================================================================================================================';
PRINT '';

-- Contar tablas creadas
DECLARE @TotalTablas INT;
SELECT @TotalTablas = COUNT(*)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_CATALOG = 'InmobiliariaDB';

PRINT '📊 RESUMEN DE LA BASE DE DATOS:';
PRINT '   - Total de tablas: ' + CAST(@TotalTablas AS VARCHAR(10));
PRINT '';

-- Verificar tablas críticas
PRINT '✅ TABLAS PRINCIPALES VERIFICADAS:';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Personas')
    PRINT '   ✓ Personas';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Acceso')
    PRINT '   ✓ Acceso';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Roles')
    PRINT '   ✓ Roles';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Administrativos')
    PRINT '   ✓ Administrativos (NUEVA)';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Inmuebles')
    PRINT '   ✓ Inmuebles';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Citas')
    PRINT '   ✓ Citas';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notificaciones')
    PRINT '   ✓ Notificaciones';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Reportes')
    PRINT '   ✓ Reportes';
PRINT '';

-- Verificar datos iniciales
DECLARE @TotalRoles INT, @TotalEstados INT, @TotalServicios INT, @TotalAdmins INT;
SELECT @TotalRoles = COUNT(*) FROM Roles;
SELECT @TotalEstados = COUNT(*) FROM Estados_cita;
SELECT @TotalServicios = COUNT(*) FROM Servicios_cita;
SELECT @TotalAdmins = COUNT(*) FROM Administrativos;

PRINT '📋 DATOS INICIALES:';
PRINT '   - Roles:             ' + CAST(@TotalRoles AS VARCHAR(10));
PRINT '   - Estados de cita:   ' + CAST(@TotalEstados AS VARCHAR(10));
PRINT '   - Servicios de cita: ' + CAST(@TotalServicios AS VARCHAR(10));
PRINT '   - Administrativos:   ' + CAST(@TotalAdmins AS VARCHAR(10));
PRINT '';

PRINT '🎯 ARQUITECTURA IMPLEMENTADA:';
PRINT '   ┌─────────────────────────────────────────────────────┐';
PRINT '   │  ADMINISTRATIVOS (Personal Interno)                 │';
PRINT '   │  - Super Administrador, Administrador, Empleado     │';
PRINT '   │  - Tabla: Administrativos + Personas                │';
PRINT '   │  - Acceso a: Dashboard admin, gestión completa      │';
PRINT '   └─────────────────────────────────────────────────────┘';
PRINT '   ┌─────────────────────────────────────────────────────┐';
PRINT '   │  USUARIOS/PROPIETARIOS (Clientes)                   │';
PRINT '   │  - Usuario, Propietario                             │';
PRINT '   │  - Tabla: Solo Personas (NO Administrativos)        │';
PRINT '   │  - Acceso a: Ver inmuebles, agendar citas           │';
PRINT '   └─────────────────────────────────────────────────────┘';
PRINT '';

PRINT '🔑 CREDENCIALES SUPER ADMINISTRADOR:';
PRINT '   Email:    admin@inmotech.com';
PRINT '   Password: Admin123!';
PRINT '   ⚠️  Cambiar en producción';
PRINT '';

PRINT '📚 PRÓXIMOS PASOS:';
PRINT '   1. Configurar .env en la API con credenciales de esta BD';
PRINT '   2. Iniciar servidor API: npm run dev';
PRINT '   3. Probar endpoint de login: POST /api/v1/auth/login';
PRINT '   4. Crear empleados desde panel admin';
PRINT '   5. Probar flujo de citas desde frontend';
PRINT '';

PRINT '📖 DOCUMENTACIÓN:';
PRINT '   - Consultar vista: SELECT * FROM vw_PersonalAdministrativo';
PRINT '   - Verificar admin: SELECT dbo.fn_EsAdministrativo(1)';
PRINT '   - API Docs: http://localhost:5000/api-docs';
PRINT '   - Health Check: http://localhost:5000/api/v1/health';
PRINT '';

PRINT '=====================================================================================================================';
PRINT '                                    🎉 BASE DE DATOS LISTA PARA USAR 🎉';
PRINT '=====================================================================================================================';
GO




