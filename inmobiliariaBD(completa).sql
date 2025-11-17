-- =====================================================================================================================
-- BASE DE DATOS INMOBILIARIA INMOTECH
-- =====================================================================================================================
-- Motor:           Microsoft SQL Server 2016+
-- Versión:         6.0 FINAL - CON ARQUITECTURA DE ADMINISTRATIVOS Y SOPORTE COMPLETO PARA FRONTEND REACT
-- Compatibilidad:  Sequelize ORM + Node.js + Express + React Frontend
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
PRINT 'INICIANDO CREACIÓN DE ESTRUCTURA DE BASE DE DATOS INMOTECH v6.0 - CON SOPORTE COMPLETO PARA FRONTEND REACT';
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
--              - 1:1 con Propietarios (solo para propietarios de inmuebles)
--              - 1:N con Personas_rol (un usuario puede tener múltiples roles)
--              - 1:N con Citas (como cliente, agente o creador)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Personas]') AND type = 'U')
BEGIN
    CREATE TABLE Personas (
        -- Identificador único de la persona
        id_persona INT PRIMARY KEY IDENTITY(1,1),

        -- Información de documento (permites identificación sin duplicados)
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
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personas_Documento' AND object_id = OBJECT_ID('Personas'))
    CREATE NONCLUSTERED INDEX IX_Personas_Documento ON Personas(tipo_documento, numero_documento);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personas_Correo' AND object_id = OBJECT_ID('Personas'))
    CREATE NONCLUSTERED INDEX IX_Personas_Correo ON Personas(correo);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personas_TieneCuenta' AND object_id = OBJECT_ID('Personas'))
    CREATE NONCLUSTERED INDEX IX_Personas_TieneCuenta ON Personas(tiene_cuenta) INCLUDE (estado);
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

-- Índices para consultas de roles
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PersonasRol_Persona' AND object_id = OBJECT_ID('Personas_rol'))
    CREATE NONCLUSTERED INDEX IX_PersonasRol_Persona ON Personas_rol(id_persona);  -- Obtener roles de una persona

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PersonasRol_Rol' AND object_id = OBJECT_ID('Personas_rol'))
    CREATE NONCLUSTERED INDEX IX_PersonasRol_Rol ON Personas_rol(id_rol);          -- Obtener personas con un rol
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

-- Índice para búsquedas por rol (idempotente)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Permisos_Rol' AND object_id = OBJECT_ID('Permisos'))
    CREATE NONCLUSTERED INDEX IX_Permisos_Rol ON Permisos(id_rol);
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
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Administrativos_CodigoEmpleado' AND object_id = OBJECT_ID('Administrativos'))
    CREATE NONCLUSTERED INDEX IX_Administrativos_CodigoEmpleado ON Administrativos(codigo_empleado);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Administrativos_EstadoLaboral' AND object_id = OBJECT_ID('Administrativos'))
    CREATE NONCLUSTERED INDEX IX_Administrativos_EstadoLaboral 
    ON Administrativos(estado_laboral)
    WHERE estado_laboral = 'Activo';
GO

-- =====================================================================================================================
-- PASO 4: TABLA DE PROPIETARIOS - NUEVA IMPLEMENTACIÓN
-- =====================================================================================================================

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Propietarios
-- Descripción: Información específica de propietarios (extiende la tabla Personas)
-- Relación: 1:1 con Personas, 1:N con Propiedad_inmueble
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Propietarios]') AND type = 'U')
BEGIN
    CREATE TABLE Propietarios (
        id_propietario INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,                    -- Relación 1:1 con Personas
        
        -- Información adicional específica de propietarios
        registro_propietario VARCHAR(20) NOT NULL UNIQUE,  -- Código único: PROP-001, PROP-002
        fecha_registro_propietario DATE NOT NULL DEFAULT GETDATE(),
        
        -- Información de contacto adicional
        ciudad_residencia VARCHAR(50) NULL,
        direccion_residencia VARCHAR(100) NULL,
        
        -- Estado del propietario
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
        
        -- Observaciones
        observaciones TEXT NULL,
        
        -- Auditoría
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_actualizacion DATETIME2(3) NULL,
        
        -- Foreign Keys
        CONSTRAINT FK_Propietarios_Persona FOREIGN KEY (id_persona) 
            REFERENCES Personas(id_persona) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Propietarios creada';
END
GO

-- Índices para Propietarios
CREATE NONCLUSTERED INDEX IX_Propietarios_Registro ON Propietarios(registro_propietario);
CREATE NONCLUSTERED INDEX IX_Propietarios_Estado ON Propietarios(estado) WHERE estado = 'Activo';
CREATE NONCLUSTERED INDEX IX_Propietarios_Persona ON Propietarios(id_persona);
GO

-- =====================================================================================================================
-- PASO 5: TABLAS DE INMUEBLES - ACTUALIZADAS PARA SOPORTE COMPLETO DEL FRONTEND REACT
-- =====================================================================================================================
-- Gestión de propiedades inmobiliarias con todos los campos necesarios para el frontend

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Inmuebles
-- Descripción: Almacena la información básica de cada propiedad
-- ---------------------------------------------------------------------------------------------------------------------
-- Crear la tabla si no existe

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Inmuebles]') AND type = 'U')
BEGIN
    CREATE TABLE Inmuebles (
        id_inmueble INT PRIMARY KEY IDENTITY(1,1),
        registro_inmobiliario VARCHAR(50) NOT NULL UNIQUE,
        pais VARCHAR(50) NOT NULL DEFAULT 'Colombia',
        departamento VARCHAR(50) NOT NULL,
        ciudad VARCHAR(50) NOT NULL,
        barrio VARCHAR(100) NULL,
        direccion VARCHAR(100) NOT NULL,
        categoria VARCHAR(50) NULL,
        precio_venta DECIMAL(15,2) NULL,
        precio_arriendo DECIMAL(15,2) NULL,
        area_construida DECIMAL(10,2) NULL,
        area_terreno DECIMAL(10,2) NULL,
        descripcion TEXT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'Disponible',
        titulo VARCHAR(200) NULL,
        operacion VARCHAR(20) NOT NULL DEFAULT 'Venta' CHECK (operacion IN ('Venta', 'Arriendo')),
        estado_frontend VARCHAR(50) NOT NULL DEFAULT 'Disponible' CHECK (estado_frontend IN (
            'Disponible', 'Vendido', 'Arrendado', 'En proceso de venta', 'En proceso de arrendamiento'
        )),
        fecha_registro DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_actualizacion DATETIME2(3) NULL
    );
    PRINT '✅ Tabla Inmuebles creada con soporte completo para frontend React';
END
ELSE
BEGIN
    -- Si la tabla ya existe, agregamos las columnas nuevas si no están
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'operacion' AND Object_ID = Object_ID(N'Inmuebles'))
        ALTER TABLE Inmuebles ADD operacion VARCHAR(20) NOT NULL DEFAULT 'Venta' CHECK (operacion IN ('Venta', 'Arriendo'));
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'estado_frontend' AND Object_ID = Object_ID(N'Inmuebles'))
        ALTER TABLE Inmuebles ADD estado_frontend VARCHAR(50) NOT NULL DEFAULT 'Disponible' CHECK (estado_frontend IN (
            'Disponible', 'Vendido', 'Arrendado', 'En proceso de venta', 'En proceso de arrendamiento'
        ));
END
GO


-- ✅ Índices (solo se crean si no existen)
-- Relación directa: Inmuebles -> Propietarios (propietario actual opcional)
IF COL_LENGTH('dbo.Inmuebles', 'id_propietario') IS NULL
BEGIN
    ALTER TABLE dbo.Inmuebles ADD id_propietario INT NULL;
    PRINT '✅ Columna id_propietario agregada a Inmuebles';
END

-- Crear FK Inmuebles -> Propietarios (si no existe)
IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_Inmuebles_Propietarios'
      AND parent_object_id = OBJECT_ID('dbo.Inmuebles')
)
BEGIN
    ALTER TABLE dbo.Inmuebles
      ADD CONSTRAINT FK_Inmuebles_Propietarios
      FOREIGN KEY (id_propietario) REFERENCES dbo.Propietarios(id_propietario)
      ON DELETE SET NULL;
    PRINT '✅ FK Inmuebles -> Propietarios creada';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inmuebles_Ciudad' AND object_id = OBJECT_ID('Inmuebles'))
    CREATE NONCLUSTERED INDEX IX_Inmuebles_Ciudad ON Inmuebles(ciudad, estado);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inmuebles_Categoria' AND object_id = OBJECT_ID('Inmuebles'))
    CREATE NONCLUSTERED INDEX IX_Inmuebles_Categoria ON Inmuebles(categoria);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inmuebles_Precio' AND object_id = OBJECT_ID('Inmuebles'))
    CREATE NONCLUSTERED INDEX IX_Inmuebles_Precio ON Inmuebles(precio_venta);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inmuebles_Operacion' AND object_id = OBJECT_ID('Inmuebles'))
    CREATE NONCLUSTERED INDEX IX_Inmuebles_Operacion ON Inmuebles(operacion, estado_frontend);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Inmuebles_EstadoFrontend' AND object_id = OBJECT_ID('Inmuebles'))
    CREATE NONCLUSTERED INDEX IX_Inmuebles_EstadoFrontend ON Inmuebles(estado_frontend);

-- Índice por propietario (si no existe)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = 'IX_Inmuebles_id_propietario' AND object_id = OBJECT_ID('dbo.Inmuebles')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_Inmuebles_id_propietario ON dbo.Inmuebles(id_propietario);
    PRINT '✅ Índice IX_Inmuebles_id_propietario creado';
END
GO


-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Comodidades
-- Descripción: Catálogo de comodidades disponibles para inmuebles
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Comodidades]') AND type = 'U')
BEGIN
    CREATE TABLE Comodidades (
        id_comodidad INT PRIMARY KEY IDENTITY(1,1),
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion VARCHAR(200) NULL,
        tipo_inmueble VARCHAR(50) NULL,                     -- NULL = aplica a todos los tipos
        estado BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Tabla Comodidades creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Inmueble_Comodidades
-- Descripción: Relación Many-to-Many entre Inmuebles y Comodidades con cantidad
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Inmueble_Comodidades]') AND type = 'U')
BEGIN
    CREATE TABLE Inmueble_Comodidades (
        id_inmueble_comodidad INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
        id_comodidad INT NOT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        seleccionada BIT NOT NULL DEFAULT 1,                -- Para controlar si está activa
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_InmuebleComodidades_Inmueble FOREIGN KEY (id_inmueble) 
            REFERENCES Inmuebles(id_inmueble) ON DELETE CASCADE,
        CONSTRAINT FK_InmuebleComodidades_Comodidad FOREIGN KEY (id_comodidad) 
            REFERENCES Comodidades(id_comodidad),
        CONSTRAINT UQ_InmuebleComodidades_Unico UNIQUE (id_inmueble, id_comodidad),
        CONSTRAINT CHK_InmuebleComodidades_Cantidad CHECK (cantidad > 0)
    );
    PRINT '✅ Tabla Inmueble_Comodidades creada';
END
GO

-- Índices para Inmueble_Comodidades
CREATE NONCLUSTERED INDEX IX_InmuebleComodidades_Inmueble ON Inmueble_Comodidades(id_inmueble);
CREATE NONCLUSTERED INDEX IX_InmuebleComodidades_Comodidad ON Inmueble_Comodidades(id_comodidad);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Fichas_Tecnicas
-- Descripción: Historial de versiones de fichas técnicas de inmuebles
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Fichas_Tecnicas]') AND type = 'U')
BEGIN
    CREATE TABLE Fichas_Tecnicas (
        id_ficha_tecnica INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
        version INT NOT NULL,
        fecha_creacion DATE NOT NULL,
        cambios TEXT NOT NULL,                              -- Descripción de cambios en esta versión
        datos_json NVARCHAR(MAX) NULL,                      -- Snapshots de datos en JSON para auditoría
        id_usuario_creador INT NULL,                        -- Quién creó esta versión
        
        -- Auditoría
        fecha_registro DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_FichasTecnicas_Inmueble FOREIGN KEY (id_inmueble) 
            REFERENCES Inmuebles(id_inmueble) ON DELETE CASCADE,
        CONSTRAINT FK_FichasTecnicas_Usuario FOREIGN KEY (id_usuario_creador) 
            REFERENCES Personas(id_persona),
        CONSTRAINT UQ_FichasTecnicas_Version UNIQUE (id_inmueble, version)
    );
    PRINT '✅ Tabla Fichas_Tecnicas creada';
END
GO

-- Índices para Fichas_Tecnicas
CREATE NONCLUSTERED INDEX IX_FichasTecnicas_Inmueble ON Fichas_Tecnicas(id_inmueble);
CREATE NONCLUSTERED INDEX IX_FichasTecnicas_Fecha ON Fichas_Tecnicas(fecha_creacion DESC);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Propiedad_inmueble (ACTUALIZADA)
-- Descripción: Relación entre Personas y sus Inmuebles (quién es dueño de qué)
--              Permite rastrear historial de propietarios
-- Importante:  Al crear un registro aquí, se debe actualizar el rol de la persona a 'Propietario'
-- ---------------------------------------------------------------------------------------------------------------------
-- Crear tabla si no existe
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Propiedad_inmueble]') AND type = 'U')
BEGIN
    CREATE TABLE Propiedad_inmueble (
        id_propiedad_inmueble INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
        id_persona INT NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_final DATE NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
        porcentaje_propiedad DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        es_propietario_actual BIT NOT NULL DEFAULT 1,
        fecha_registro DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        observaciones TEXT NULL,

        CONSTRAINT FK_Propiedad_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble) ON DELETE CASCADE,
        CONSTRAINT FK_Propiedad_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        CONSTRAINT CHK_Propiedad_Fechas CHECK (fecha_final IS NULL OR fecha_final >= fecha_inicio),
        CONSTRAINT CHK_Propiedad_Porcentaje CHECK (porcentaje_propiedad > 0 AND porcentaje_propiedad <= 100.00)
    );
    PRINT '✅ Tabla Propiedad_inmueble creada correctamente';
END
ELSE
BEGIN
    PRINT 'ℹ️ Tabla Propiedad_inmueble ya existe, verificando columnas...';

    -- Agregar columna es_propietario_actual si no existe
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'es_propietario_actual' AND Object_ID = Object_ID(N'Propiedad_inmueble'))
    BEGIN
        ALTER TABLE Propiedad_inmueble ADD es_propietario_actual BIT NOT NULL DEFAULT 1;
        PRINT '🆕 Columna es_propietario_actual agregada correctamente.';
    END

    -- Agregar columna porcentaje_propiedad si no existe
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'porcentaje_propiedad' AND Object_ID = Object_ID(N'Propiedad_inmueble'))
    BEGIN
        ALTER TABLE Propiedad_inmueble ADD porcentaje_propiedad DECIMAL(5,2) NOT NULL DEFAULT 100.00;
        PRINT '🆕 Columna porcentaje_propiedad agregada correctamente.';
    END
END
GO


-- ✅ Índices (solo se crean si no existen)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PropiedadInmueble_Inmueble' AND object_id = OBJECT_ID('Propiedad_inmueble'))
    CREATE NONCLUSTERED INDEX IX_PropiedadInmueble_Inmueble ON Propiedad_inmueble(id_inmueble);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PropiedadInmueble_Persona' AND object_id = OBJECT_ID('Propiedad_inmueble'))
    CREATE NONCLUSTERED INDEX IX_PropiedadInmueble_Persona ON Propiedad_inmueble(id_persona);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PropiedadInmueble_Actual' AND object_id = OBJECT_ID('Propiedad_inmueble'))
    CREATE NONCLUSTERED INDEX IX_PropiedadInmueble_Actual ON Propiedad_inmueble(es_propietario_actual) WHERE es_propietario_actual = 1;
GO

-- =====================================================================================================================
-- Cambios para soportar transferencia de propiedad y sincronización del propietario actual
-- =====================================================================================================================

-- Agregar columna de nombre del propietario al catálogo de Inmuebles (idempotente)
IF COL_LENGTH('dbo.Inmuebles', 'propietario') IS NULL
BEGIN
    ALTER TABLE dbo.Inmuebles ADD propietario NVARCHAR(200) NULL;
    PRINT '✅ Columna propietario agregada a Inmuebles';
END
GO

-- Asegurar unicidad de propietario actual al 100% por inmueble (idempotente)
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UQ_PropiedadInmueble_ActualUnico'
      AND object_id = OBJECT_ID('dbo.Propiedad_inmueble')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UQ_PropiedadInmueble_ActualUnico
        ON dbo.Propiedad_inmueble (id_inmueble)
        WHERE es_propietario_actual = 1 AND porcentaje_propiedad = 100;
    PRINT '✅ Índice único de propietario actual al 100% por inmueble creado';
END
GO

-- Trigger: sincronizar Inmuebles.id_propietario/propietario con Propiedad_inmueble (idempotente)
CREATE OR ALTER TRIGGER dbo.TRG_PropiedadInmueble_SyncInmuebleOwner
ON dbo.Propiedad_inmueble
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- 1) Asegurar que exista registro en Propietarios para la persona marcada como actual
    INSERT INTO dbo.Propietarios (id_persona, registro_propietario, fecha_registro_propietario, estado, observaciones, fecha_creacion)
    SELECT i.id_persona,
           CONCAT('PROP-', RIGHT('00000' + CAST(i.id_persona AS VARCHAR(5)), 5)),
           CONVERT(date, GETDATE()),
           'Activo',
           NULL,
           GETDATE()
    FROM inserted i
    LEFT JOIN dbo.Propietarios p ON p.id_persona = i.id_persona
    WHERE i.es_propietario_actual = 1
      AND i.porcentaje_propiedad = 100
      AND p.id_persona IS NULL;

    -- 2) Si se marca un nuevo propietario actual (100%), desmarcar el anterior y cerrar su vigencia
    UPDATE prev
    SET prev.es_propietario_actual = 0,
        prev.fecha_final = ISNULL(prev.fecha_final, CONVERT(date, GETDATE())),
        prev.estado = CASE WHEN prev.estado IS NULL THEN 'Inactivo' ELSE prev.estado END
    FROM dbo.Propiedad_inmueble AS prev
    INNER JOIN inserted AS i
        ON i.id_inmueble = prev.id_inmueble
    WHERE i.es_propietario_actual = 1
      AND i.porcentaje_propiedad = 100
      AND prev.es_propietario_actual = 1
      AND prev.porcentaje_propiedad = 100
      AND prev.id_persona <> i.id_persona;

    -- 3) Recomputar propietario actual al 100% y sincronizar catálogo Inmuebles
    ;WITH current_owner AS (
        SELECT pi.id_inmueble,
               p.id_propietario,
               per.nombre_completo,
               per.apellido_completo
        FROM dbo.Propiedad_inmueble AS pi
        INNER JOIN dbo.Propietarios AS p
            ON p.id_persona = pi.id_persona
        INNER JOIN dbo.Personas AS per
            ON per.id_persona = pi.id_persona
        WHERE pi.es_propietario_actual = 1
          AND pi.porcentaje_propiedad = 100
    ),
    affected_inmuebles AS (
        SELECT DISTINCT id_inmueble FROM inserted
    )
    UPDATE inm
    SET inm.id_propietario = co.id_propietario,
        inm.propietario = CASE
            WHEN co.id_propietario IS NULL THEN NULL
            ELSE CONCAT(co.nombre_completo, ' ', co.apellido_completo)
        END
    FROM dbo.Inmuebles AS inm
    INNER JOIN affected_inmuebles AS ai
        ON ai.id_inmueble = inm.id_inmueble
    LEFT JOIN current_owner AS co
        ON co.id_inmueble = inm.id_inmueble;
END
GO

-- Procedimiento para transferencia de propiedad (venta)
CREATE OR ALTER PROCEDURE dbo.sp_transferir_propiedad
    @id_inmueble INT,
    @id_persona_nuevo INT,
    @fecha_inicio DATE = NULL,
    @observaciones NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRAN;

    DECLARE @fecha DATE = ISNULL(@fecha_inicio, CONVERT(date, GETDATE()));

    -- Cerrar propietario actual (100%) si existe
    UPDATE pi
    SET pi.es_propietario_actual = 0,
        pi.fecha_final = @fecha,
        pi.estado = 'Inactivo'
    FROM dbo.Propiedad_inmueble AS pi
    WHERE pi.id_inmueble = @id_inmueble
      AND pi.es_propietario_actual = 1
      AND pi.porcentaje_propiedad = 100;

    -- Asegurar registro en Propietarios para el nuevo
    IF NOT EXISTS (SELECT 1 FROM dbo.Propietarios WHERE id_persona = @id_persona_nuevo)
    BEGIN
        INSERT INTO dbo.Propietarios (id_persona, registro_propietario, fecha_registro_propietario, estado, observaciones, fecha_creacion)
        VALUES (
            @id_persona_nuevo,
            CONCAT('PROP-', RIGHT('00000' + CAST(@id_persona_nuevo AS VARCHAR(5)), 5)),
            @fecha,
            'Activo',
            NULL,
            GETDATE()
        );
    END

    -- Registrar nueva relación (100%, actual)
    INSERT INTO dbo.Propiedad_inmueble (
        id_inmueble, id_persona, fecha_inicio, fecha_final, estado,
        porcentaje_propiedad, es_propietario_actual, fecha_registro, observaciones
    )
    VALUES (
        @id_inmueble, @id_persona_nuevo, @fecha, NULL, 'Activo',
        100, 1, GETDATE(), @observaciones
    );

    COMMIT;
END
GO


-- =====================================================================================================================
-- PASO 6: MÓDULO DE CITAS (CORE DEL SISTEMA)
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
-- PASO 7: SISTEMA DE NOTIFICACIONES
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
-- PASO 8: MÓDULO DE REPORTES
-- =====================================================================================================================
-- Sistema de reportes de problemas en inmuebles

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Reportes
-- Descripción: Registro de problemas, quejas o sugerencias sobre inmuebles
-- Tipos:       Mantenimiento, Daño, Queja, Sugerencia
-- Estados:     Pendiente → En Proceso → Completado → Cancelado
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reportes]') AND type = 'U')
BEGIN
    CREATE TABLE Reportes (
        id_reporte INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,                          -- FK Inmueble
        tipo_reporte VARCHAR(50) NOT NULL,                 -- Mantenimiento, Daño, Queja...
        estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',   -- Pendiente, En Proceso, Completado, Cancelado
        descripcion TEXT NOT NULL,
        fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
        fecha_estado DATETIME NULL,
        id_responsable INT NOT NULL,                       -- Responsable actual (administrativo)
        seguimiento_general TEXT NULL,                     -- Descripción del seguimiento global
        id_persona_reporta INT NOT NULL,                   -- Propietario/cliente o administrativo
        fecha_modificacion DATETIME NULL,
        FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble),
        FOREIGN KEY (id_responsable) REFERENCES Personas(id_persona),
        FOREIGN KEY (id_persona_reporta) REFERENCES Personas(id_persona)
    );
    PRINT '✅ Tabla Reportes creada';
END
GO

-- Alinear columnas faltantes en Reportes para compatibilidad con backend (idempotente)
IF COL_LENGTH('dbo.Reportes', 'seguimiento_general') IS NULL
BEGIN
    ALTER TABLE Reportes ADD seguimiento_general TEXT NULL;
    PRINT '✅ Columna seguimiento_general agregada a Reportes';
END
IF COL_LENGTH('dbo.Reportes', 'fecha_estado') IS NULL
BEGIN
    ALTER TABLE Reportes ADD fecha_estado DATETIME NULL;
    PRINT '✅ Columna fecha_estado agregada a Reportes';
END
IF COL_LENGTH('dbo.Reportes', 'fecha_modificacion') IS NULL
BEGIN
    ALTER TABLE Reportes ADD fecha_modificacion DATETIME NULL;
    PRINT '✅ Columna fecha_modificacion agregada a Reportes';
END
IF COL_LENGTH('dbo.Reportes', 'id_responsable') IS NULL
BEGIN
    ALTER TABLE Reportes ADD id_responsable INT NULL;
    PRINT '✅ Columna id_responsable agregada a Reportes';
END
IF COL_LENGTH('dbo.Reportes', 'id_persona_reporta') IS NULL
BEGIN
    ALTER TABLE Reportes ADD id_persona_reporta INT NULL;
    PRINT '✅ Columna id_persona_reporta agregada a Reportes';
END
GO

-- Crear/asegurar FKs en Reportes (idempotente)
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name IN ('FK_Reportes_Inmueble','FK_Reportes_Inmuebles') AND parent_object_id = OBJECT_ID('dbo.Reportes')
)
BEGIN
    ALTER TABLE dbo.Reportes WITH CHECK ADD CONSTRAINT FK_Reportes_Inmueble
        FOREIGN KEY (id_inmueble) REFERENCES dbo.Inmuebles(id_inmueble);
    PRINT '✅ FK Reportes -> Inmuebles asegurada';
END

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name = 'FK_Reportes_Responsable' AND parent_object_id = OBJECT_ID('dbo.Reportes')
)
BEGIN
    ALTER TABLE dbo.Reportes WITH CHECK ADD CONSTRAINT FK_Reportes_Responsable
        FOREIGN KEY (id_responsable) REFERENCES dbo.Personas(id_persona);
    PRINT '✅ FK Reportes -> Personas (responsable) asegurada';
END

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name IN ('FK_Reportes_Persona','FK_Reportes_PersonaReporta') AND parent_object_id = OBJECT_ID('dbo.Reportes')
)
BEGIN
    ALTER TABLE dbo.Reportes WITH CHECK ADD CONSTRAINT FK_Reportes_Persona
        FOREIGN KEY (id_persona_reporta) REFERENCES dbo.Personas(id_persona);
    PRINT '✅ FK Reportes -> Personas (persona_reporta) asegurada';
END
GO

-- Índices para optimizar búsquedas en Reportes (idempotentes)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reportes_Inmueble' AND object_id = OBJECT_ID('Reportes'))
    CREATE NONCLUSTERED INDEX IX_Reportes_Inmueble ON Reportes(id_inmueble);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reportes_Estado' AND object_id = OBJECT_ID('Reportes'))
    CREATE NONCLUSTERED INDEX IX_Reportes_Estado ON Reportes(estado) INCLUDE (fecha_creacion);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reportes_Responsable' AND object_id = OBJECT_ID('Reportes'))
    CREATE NONCLUSTERED INDEX IX_Reportes_Responsable ON Reportes(id_responsable);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Reporte_Imagen
-- Descripción: Imágenes asociadas a un reporte
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reporte_Imagen]') AND type = 'U')
BEGIN
    CREATE TABLE Reporte_Imagen (
        id_imagen INT PRIMARY KEY IDENTITY(1,1),
        id_reporte INT NOT NULL,
        url_imagen VARCHAR(255) NOT NULL,
        descripcion VARCHAR(200) NULL,
        FOREIGN KEY (id_reporte) REFERENCES Reportes(id_reporte) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Reporte_Imagen creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Reporte_Archivo
-- Descripción: Archivos adjuntos a un reporte (PDFs, documentos, etc.)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reporte_Archivo]') AND type = 'U')
BEGIN
    CREATE TABLE Reporte_Archivo (
        id_archivo INT PRIMARY KEY IDENTITY(1,1),
        id_reporte INT NOT NULL,
        url_archivo VARCHAR(255) NOT NULL,
        descripcion VARCHAR(200) NULL,
        FOREIGN KEY (id_reporte) REFERENCES Reportes(id_reporte) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Reporte_Archivo creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Reporte_Rubro
-- Descripción: Rubros o categorías específicas dentro de un reporte (ej: Fontanería, Electricidad)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reporte_Rubro]') AND type = 'U')
BEGIN
    CREATE TABLE Reporte_Rubro (
        id_rubro INT PRIMARY KEY IDENTITY(1,1),
        id_reporte INT NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT NULL,
        FOREIGN KEY (id_reporte) REFERENCES Reportes(id_reporte) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Reporte_Rubro creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Rubro_Seguimiento
-- Descripción: Seguimientos específicos por rubro (avances en cada categoría)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Rubro_Seguimiento]') AND type = 'U')
BEGIN
    CREATE TABLE Rubro_Seguimiento (
        id_seguimiento INT PRIMARY KEY IDENTITY(1,1),
        id_rubro INT NOT NULL,
        fecha DATETIME NOT NULL DEFAULT GETDATE(),
        estado VARCHAR(20) NOT NULL,              -- Pendiente, En Proceso, Completado
        id_responsable INT NOT NULL,              -- FK Personas (administrativos)
        descripcion TEXT NOT NULL,
        FOREIGN KEY (id_rubro) REFERENCES Reporte_Rubro(id_rubro) ON DELETE CASCADE,
        FOREIGN KEY (id_responsable) REFERENCES Personas(id_persona)
    );
    PRINT '✅ Tabla Rubro_Seguimiento creada';
END
GO

-- Índices adicionales para optimizar consultas de seguimientos por rubro
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rubro_Seguimiento_Rubro' AND object_id = OBJECT_ID('Rubro_Seguimiento'))
    CREATE NONCLUSTERED INDEX IX_Rubro_Seguimiento_Rubro ON Rubro_Seguimiento(id_rubro, fecha);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Reporte_Seguimiento_General
-- Descripción: Seguimientos generales del reporte (no específicos de rubros)
-- ---------------------------------------------------------------------------------------------------------------------
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
    PRINT '✅ Tabla Reporte_Seguimiento_General creada';
END
GO

-- Índices adicionales para optimizar consultas de seguimientos generales
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reporte_Seguimiento_General_Reporte' AND object_id = OBJECT_ID('Reporte_Seguimiento_General'))
    CREATE NONCLUSTERED INDEX IX_Reporte_Seguimiento_General_Reporte ON Reporte_Seguimiento_General(id_reporte, fecha);
GO

-- =====================================================================================================================
-- PASO 9: MÓDULO DE VENTAS Y ARRENDAMIENTOS
-- =====================================================================================================================
-- Sistema completo para gestión de ventas y contratos de arrendamiento

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Ventas
-- Descripción: Registro de ventas de inmuebles
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Ventas]') AND type = 'U')
BEGIN
    CREATE TABLE Ventas (
        id_venta INT PRIMARY KEY IDENTITY(1,1),
        
        -- Relaciones
        id_persona INT NOT NULL,                    -- Comprador
        id_inmueble INT NOT NULL,                   -- Inmueble vendido
        
        -- Información de la venta
        fecha_venta DATE NOT NULL,
        valor_venta DECIMAL(15,2) NOT NULL,
        medio_pago VARCHAR(50) NOT NULL CHECK (medio_pago IN ('efectivo', 'transferencia', 'credito', 'mixto')),
        
        -- Estado y auditoría
        estado VARCHAR(50) NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Cancelada', 'Finalizada')),
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        
        -- Foreign Keys
        CONSTRAINT FK_Ventas_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Ventas_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble),
        
        -- Validaciones
        CONSTRAINT CHK_Ventas_Valor CHECK (valor_venta > 0),
        CONSTRAINT CHK_Ventas_Fecha CHECK (fecha_venta <= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Ventas creada';
END
GO

-- Índices para Ventas
CREATE NONCLUSTERED INDEX IX_Ventas_Persona ON Ventas(id_persona);
CREATE NONCLUSTERED INDEX IX_Ventas_Inmueble ON Ventas(id_inmueble);
CREATE NONCLUSTERED INDEX IX_Ventas_Fecha ON Ventas(fecha_venta DESC);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Estados_venta
-- Descripción: Catálogo de estados para el seguimiento de ventas
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Estados_venta]') AND type = 'U')
BEGIN
    CREATE TABLE Estados_venta (
        id_estado_venta INT PRIMARY KEY IDENTITY(1,1),
        nombre_estado VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(200) NULL,
        orden INT NOT NULL,                         -- Orden en el flujo
        es_estado_final BIT NOT NULL DEFAULT 0,
        estado BIT NOT NULL DEFAULT 1
    );
    PRINT '✅ Tabla Estados_venta creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Seguimiento_venta
-- Descripción: Historial de seguimiento del proceso de venta
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Seguimiento_venta]') AND type = 'U')
BEGIN
    CREATE TABLE Seguimiento_venta (
        id_seguimiento_venta INT PRIMARY KEY IDENTITY(1,1),
        
        -- Relaciones
        id_venta INT NOT NULL,
        id_estado_venta INT NOT NULL,
        id_persona INT NOT NULL,                    -- Quién registró el seguimiento (agente)
        
        -- Información del seguimiento
        fecha_estado_seguimiento DATE NOT NULL,
        descripcion TEXT NOT NULL,                  -- Observaciones del seguimiento
        
        -- Auditoría
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        
        -- Foreign Keys
        CONSTRAINT FK_SeguimientoVenta_Venta FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta) ON DELETE CASCADE,
        CONSTRAINT FK_SeguimientoVenta_Estado FOREIGN KEY (id_estado_venta) REFERENCES Estados_venta(id_estado_venta),
        CONSTRAINT FK_SeguimientoVenta_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        
        -- Validaciones
        CONSTRAINT CHK_SeguimientoVenta_Fecha CHECK (fecha_estado_seguimiento <= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Seguimiento_venta creada';
END
GO

-- Índices para Seguimiento_venta
CREATE NONCLUSTERED INDEX IX_SeguimientoVenta_Venta ON Seguimiento_venta(id_venta);
CREATE NONCLUSTERED INDEX IX_SeguimientoVenta_Fecha ON Seguimiento_venta(fecha_estado_seguimiento DESC);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Arrendamientos
-- Descripción: Contratos de arrendamiento de inmuebles
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Arrendamientos]') AND type = 'U')
BEGIN
    CREATE TABLE Arrendamientos (
        id_arrendamiento INT PRIMARY KEY IDENTITY(1,1),
        
        -- Relaciones
        id_cliente INT NOT NULL,                    -- Arrendatario
        id_inmueble INT NOT NULL,                   -- Inmueble arrendado
        
        -- Términos del contrato
        fecha_inicio DATE NOT NULL,
        fecha_finalizacion DATE NOT NULL,
        valor_mensual DECIMAL(15,2) NOT NULL,
        
        -- Estado del arrendamiento
        estado VARCHAR(50) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Al día', 'Pendiente', 'Recuperación', 'Finalizado', 'Cancelado')),
        
        -- Información adicional
        duracion_meses AS DATEDIFF(MONTH, fecha_inicio, fecha_finalizacion),  -- Campo calculado
        
        -- Auditoría
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        
        -- Foreign Keys
        CONSTRAINT FK_Arrendamientos_Cliente FOREIGN KEY (id_cliente) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Arrendamientos_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble),
        
        -- Validaciones
        CONSTRAINT CHK_Arrendamientos_Valor CHECK (valor_mensual > 0),
        CONSTRAINT CHK_Arrendamientos_Fechas CHECK (fecha_finalizacion > fecha_inicio),
        CONSTRAINT CHK_Arrendamientos_Duracion CHECK (DATEDIFF(MONTH, fecha_inicio, fecha_finalizacion) >= 1)  -- Mínimo 1 mes
    );
    PRINT '✅ Tabla Arrendamientos creada';
END
GO

-- Índices para Arrendamientos
CREATE NONCLUSTERED INDEX IX_Arrendamientos_Cliente ON Arrendamientos(id_cliente);
CREATE NONCLUSTERED INDEX IX_Arrendamientos_Inmueble ON Arrendamientos(id_inmueble);
CREATE NONCLUSTERED INDEX IX_Arrendamientos_Estado ON Arrendamientos(estado) WHERE estado IN ('Activo', 'Pendiente');
CREATE NONCLUSTERED INDEX IX_Arrendamientos_Fechas ON Arrendamientos(fecha_inicio, fecha_finalizacion);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Cobros
-- Descripción: Registro de cobros mensuales de arrendamientos
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cobros]') AND type = 'U')
BEGIN
    CREATE TABLE Cobros (
        id_cobro INT PRIMARY KEY IDENTITY(1,1),
        
        -- Relaciones
        id_arrendamiento INT NOT NULL,
        
        -- Información del cobro
        fecha_cobro DATE NOT NULL,                          -- Fecha en que se genera el cobro
        fecha_limite DATE NOT NULL,                         -- Fecha límite para pagar
        valor_pago DECIMAL(15,2) NOT NULL,
        
        -- Estado del pago
        estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagado', 'Vencido', 'Cancelado')),
        
        -- Fechas de estado
        fecha_estado DATE NULL,                             -- Fecha del último cambio de estado
        fecha_pago DATE NULL,                               -- Fecha real de pago (cuando estado = 'Pagado')
        
        -- Auditoría
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        
        -- Foreign Keys
        CONSTRAINT FK_Cobros_Arrendamiento FOREIGN KEY (id_arrendamiento) REFERENCES Arrendamientos(id_arrendamiento) ON DELETE CASCADE,
        
        -- Validaciones
        CONSTRAINT CHK_Cobros_Valor CHECK (valor_pago > 0),
        CONSTRAINT CHK_Cobros_Fechas CHECK (fecha_limite >= fecha_cobro),
        CONSTRAINT CHK_Cobros_FechaPago CHECK (fecha_pago IS NULL OR fecha_pago >= fecha_cobro)
    );
    PRINT '✅ Tabla Cobros creada';
END
GO

-- Índices para Cobros
CREATE NONCLUSTERED INDEX IX_Cobros_Arrendamiento ON Cobros(id_arrendamiento);
CREATE NONCLUSTERED INDEX IX_Cobros_Estado ON Cobros(estado) WHERE estado IN ('Pendiente', 'Vencido');
CREATE NONCLUSTERED INDEX IX_Cobros_Fechas ON Cobros(fecha_cobro, fecha_limite);
CREATE NONCLUSTERED INDEX IX_Cobros_Vencidos ON Cobros(estado, fecha_limite) WHERE estado = 'Pendiente';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Comprobantes_pago
-- Descripción: Registro de comprobantes de pago de cobros
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Comprobantes_pago]') AND type = 'U')
BEGIN
    CREATE TABLE Comprobantes_pago (
        id_comprobante INT PRIMARY KEY IDENTITY(1,1),
        
        -- Relaciones
        id_cobro INT NOT NULL,
        
        -- Información del comprobante
        url_comprobante VARCHAR(500) NOT NULL,              -- Ruta/URL de la imagen/documento
        entidad_bancaria VARCHAR(100) NOT NULL,             -- Bancolombia, Nequi, Davivienda, etc.
        referencia_bancaria VARCHAR(100) NOT NULL,          -- Número de referencia/transacción
        monto_pagado DECIMAL(15,2) NOT NULL,
        
        -- Estado del comprobante
        estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmado', 'Negado', 'En revisión')),
        
        -- Fechas
        fecha_pago DATE NOT NULL,                           -- Fecha del pago según comprobante
        fecha_revision DATE NULL,                           -- Fecha de revisión por administrador
        
        -- Observaciones
        observaciones TEXT NULL,                            -- Razones si es negado
        
        -- Auditoría
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        
        -- Foreign Keys
        CONSTRAINT FK_Comprobantes_Cobro FOREIGN KEY (id_cobro) REFERENCES Cobros(id_cobro) ON DELETE CASCADE,
        
        -- Validaciones
        CONSTRAINT CHK_Comprobantes_Monto CHECK (monto_pagado > 0),
        CONSTRAINT CHK_Comprobantes_Fecha CHECK (fecha_pago <= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Comprobantes_pago creada';
END
GO

-- Índices para Comprobantes_pago
CREATE NONCLUSTERED INDEX IX_Comprobantes_Cobro ON Comprobantes_pago(id_cobro);
CREATE NONCLUSTERED INDEX IX_Comprobantes_Estado ON Comprobantes_pago(estado) WHERE estado IN ('Pendiente', 'En revisión');
CREATE NONCLUSTERED INDEX IX_Comprobantes_Referencia ON Comprobantes_pago(referencia_bancaria, entidad_bancaria);
GO

-- =====================================================================================================================
-- PASO 10: FUNCIONES, VISTAS Y PROCEDIMIENTOS ALMACENADOS - ACTUALIZADOS
-- =====================================================================================================================
-- Funciones helper, vistas optimizadas y procedimientos para consultas frecuentes

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
-- Vista: vw_Propietarios_Completo
-- Descripción: Vista completa de propietarios con información de inmuebles
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.vw_Propietarios_Completo', 'V') IS NOT NULL
    DROP VIEW dbo.vw_Propietarios_Completo;
GO

CREATE VIEW dbo.vw_Propietarios_Completo AS
SELECT 
    -- Datos del propietario
    prop.id_propietario,
    prop.registro_propietario AS registro,
    prop.estado,
    prop.ciudad_residencia AS ciudad,
    prop.direccion_residencia AS direccion,
    prop.fecha_registro_propietario AS fecha_registro,
    
    -- Datos de la persona
    p.id_persona,
    p.tipo_documento,
    p.numero_documento AS documento,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) AS nombre,
    p.correo AS email,
    p.telefono,
    
    -- Información de inmuebles
    COUNT(DISTINCT pi.id_inmueble) AS cantidad_inmuebles,
    
    -- Inmuebles como JSON (para fácil consumo en frontend)
    (
        SELECT 
            i.id_inmueble,
            i.registro_inmobiliario,
            i.titulo,
            i.categoria AS tipo,
            i.operacion,
            i.precio_venta,
            i.precio_arriendo,
            i.estado_frontend AS estado,
            i.ciudad,
            i.direccion,
            pi.fecha_inicio,
            pi.porcentaje_propiedad
        FROM Propiedad_inmueble pi
        INNER JOIN Inmuebles i ON pi.id_inmueble = i.id_inmueble
        WHERE pi.id_persona = p.id_persona 
          AND pi.es_propietario_actual = 1
          AND pi.estado = 'Activo'
        FOR JSON PATH
    ) AS inmuebles_json,
    
    -- Auditoría
    prop.fecha_creacion,
    prop.fecha_actualizacion
    
FROM Propietarios prop
INNER JOIN Personas p ON prop.id_persona = p.id_persona
LEFT JOIN Propiedad_inmueble pi ON p.id_persona = pi.id_persona 
    AND pi.es_propietario_actual = 1 
    AND pi.estado = 'Activo'
WHERE p.estado = 1
GROUP BY 
    prop.id_propietario, prop.registro_propietario, prop.estado, 
    prop.ciudad_residencia, prop.direccion_residencia, prop.fecha_registro_propietario,
    p.id_persona, p.tipo_documento, p.numero_documento, p.nombre_completo, p.apellido_completo, 
    p.correo, p.telefono,
    prop.fecha_creacion, prop.fecha_actualizacion;
GO
PRINT '✅ Vista vw_Propietarios_Completo creada';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Vista: vw_Inmuebles_Sin_Propietario
-- Descripción: Inmuebles disponibles para asignar a propietarios
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.vw_Inmuebles_Sin_Propietario', 'V') IS NOT NULL
    DROP VIEW dbo.vw_Inmuebles_Sin_Propietario;
GO

CREATE VIEW dbo.vw_Inmuebles_Sin_Propietario AS
SELECT 
    i.id_inmueble,
    i.registro_inmobiliario,
    i.titulo,
    i.categoria AS tipo,
    i.operacion,
    i.precio_venta,
    i.precio_arriendo,
    i.estado_frontend AS estado,
    i.ciudad,
    i.direccion,
    i.descripcion,
    i.area_construida
FROM Inmuebles i
WHERE NOT EXISTS (
    SELECT 1 
    FROM Propiedad_inmueble pi 
    WHERE pi.id_inmueble = i.id_inmueble 
      AND pi.es_propietario_actual = 1 
      AND pi.estado = 'Activo'
)
AND i.estado != 'Eliminado';
GO
PRINT '✅ Vista vw_Inmuebles_Sin_Propietario creada';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Vista: vw_Inmuebles_Completo
-- Descripción: Vista unificada con todos los datos necesarios para el frontend
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.vw_Inmuebles_Completo', 'V') IS NOT NULL
    DROP VIEW dbo.vw_Inmuebles_Completo;
GO

CREATE VIEW dbo.vw_Inmuebles_Completo AS
SELECT 
    i.id_inmueble,
    i.registro_inmobiliario AS registro,
    i.titulo,
    i.direccion,
    i.categoria AS tipo,
    i.operacion,
    i.precio_venta,
    i.precio_arriendo,
    i.ciudad,
    i.barrio,
    i.estado_frontend AS estado,
    i.descripcion,
    i.area_construida,
    i.area_terreno,
    
    -- Información del propietario actual
    p.id_persona AS id_propietario,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) AS nombre_propietario,
    p.correo AS email_propietario,
    p.telefono AS telefono_propietario,
    
    -- Comodidades como JSON (para fácil consumo en frontend)
    (
        SELECT 
            c.nombre,
            ic.cantidad,
            ic.seleccionada
        FROM Inmueble_Comodidades ic
        INNER JOIN Comodidades c ON ic.id_comodidad = c.id_comodidad
        WHERE ic.id_inmueble = i.id_inmueble AND ic.seleccionada = 1
        FOR JSON PATH
    ) AS comodidades_json,
    
    -- Fichas técnicas count
    (SELECT COUNT(*) FROM Fichas_Tecnicas ft WHERE ft.id_inmueble = i.id_inmueble) AS total_fichas,
    
    -- Auditoría
    i.fecha_registro,
    i.fecha_actualizacion
    
FROM Inmuebles i
LEFT JOIN Propiedad_inmueble pi ON i.id_inmueble = pi.id_inmueble 
    AND pi.estado = 'Activo' 
    AND pi.es_propietario_actual = 1  -- Solo propietario actual
LEFT JOIN Personas p ON pi.id_persona = p.id_persona
WHERE i.estado != 'Eliminado';  -- Excluir inmuebles eliminados
GO
PRINT '✅ Vista vw_Inmuebles_Completo creada';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Vista: vw_Fichas_Tecnicas_Detalle
-- Descripción: Vista detallada de fichas técnicas para el frontend
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.vw_Fichas_Tecnicas_Detalle', 'V') IS NOT NULL
    DROP VIEW dbo.vw_Fichas_Tecnicas_Detalle;
GO

CREATE VIEW dbo.vw_Fichas_Tecnicas_Detalle AS
SELECT 
    ft.id_ficha_tecnica,
    ft.id_inmueble,
    i.registro_inmobiliario,
    i.titulo,
    ft.version,
    ft.fecha_creacion AS fecha,
    ft.cambios,
    ft.datos_json,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) AS usuario_creador,
    ft.fecha_registro
FROM Fichas_Tecnicas ft
INNER JOIN Inmuebles i ON ft.id_inmueble = i.id_inmueble
LEFT JOIN Personas p ON ft.id_usuario_creador = p.id_persona;
GO
PRINT '✅ Vista vw_Fichas_Tecnicas_Detalle creada';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Vista: vw_PersonalAdministrativo
-- Descripción: Vista consolidada del personal administrativo con sus roles
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

-- ---------------------------------------------------------------------------------------------------------------------
-- Vista: vw_ArrendamientosActivos
-- Descripción: Resumen de arrendamientos activos con información de clientes e inmuebles
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.vw_ArrendamientosActivos', 'V') IS NOT NULL
    DROP VIEW dbo.vw_ArrendamientosActivos;
GO

CREATE VIEW dbo.vw_ArrendamientosActivos AS
SELECT 
    a.id_arrendamiento,
    p.nombre_completo + ' ' + p.apellido_completo AS arrendatario,
    i.registro_inmobiliario,
    i.direccion,
    i.ciudad,
    a.fecha_inicio,
    a.fecha_finalizacion,
    a.valor_mensual,
    a.estado,
    a.duracion_meses
FROM Arrendamientos a
INNER JOIN Personas p ON a.id_cliente = p.id_persona
INNER JOIN Inmuebles i ON a.id_inmueble = i.id_inmueble
WHERE a.estado IN ('Activo', 'Al día', 'Pendiente');
GO
PRINT '✅ Vista vw_ArrendamientosActivos creada';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Vista: vw_CobrosPendientes
-- Descripción: Cobros pendientes y vencidos con información detallada
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.vw_CobrosPendientes', 'V') IS NOT NULL
    DROP VIEW dbo.vw_CobrosPendientes;
GO

CREATE VIEW dbo.vw_CobrosPendientes AS
SELECT 
    c.id_cobro,
    a.id_arrendamiento,
    p.nombre_completo + ' ' + p.apellido_completo AS arrendatario,
    i.direccion,
    c.fecha_cobro,
    c.fecha_limite,
    c.valor_pago,
    c.estado,
    DATEDIFF(DAY, GETDATE(), c.fecha_limite) AS dias_restantes
FROM Cobros c
INNER JOIN Arrendamientos a ON c.id_arrendamiento = a.id_arrendamiento
INNER JOIN Personas p ON a.id_cliente = p.id_persona
INNER JOIN Inmuebles i ON a.id_inmueble = i.id_inmueble
WHERE c.estado IN ('Pendiente', 'Vencido')
AND a.estado IN ('Activo', 'Al día', 'Pendiente');
GO
PRINT '✅ Vista vw_CobrosPendientes creada';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Procedimiento: sp_CrearPropietarioCompleto
-- Descripción: Crear propietario con o sin inmuebles asignados
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.sp_CrearPropietarioCompleto', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CrearPropietarioCompleto;
GO

CREATE PROCEDURE sp_CrearPropietarioCompleto
    @tipo_documento VARCHAR(5),
    @numero_documento VARCHAR(20),
    @nombre_completo VARCHAR(100),
    @apellido_completo VARCHAR(100),
    @correo VARCHAR(100),
    @telefono VARCHAR(20) = NULL,
    @ciudad_residencia VARCHAR(50) = NULL,
    @direccion_residencia VARCHAR(100) = NULL,
    @estado VARCHAR(20) = 'Activo',
    @observaciones TEXT = NULL,
    @inmuebles_asignar NVARCHAR(MAX) = NULL,  -- JSON: [{"id_inmueble": 1, "porcentaje_propiedad": 100.00}]
    @id_usuario_creador INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @id_persona INT;
        DECLARE @registro_propietario VARCHAR(20);
        
        -- 1. Verificar si la persona ya existe
        IF EXISTS (SELECT 1 FROM Personas WHERE correo = @correo)
        BEGIN
            RAISERROR('Ya existe una persona con este correo electrónico', 16, 1);
            RETURN;
        END
        
        IF EXISTS (SELECT 1 FROM Personas WHERE tipo_documento = @tipo_documento AND numero_documento = @numero_documento)
        BEGIN
            RAISERROR('Ya existe una persona con este documento', 16, 1);
            RETURN;
        END
        
        -- 2. Crear la persona
        INSERT INTO Personas (
            tipo_documento, numero_documento, nombre_completo, apellido_completo,
            correo, telefono, tiene_cuenta
        )
        VALUES (
            @tipo_documento, @numero_documento, @nombre_completo, @apellido_completo,
            @correo, @telefono, 0  -- No tiene cuenta por defecto
        );
        
        SET @id_persona = SCOPE_IDENTITY();
        
        -- 3. Asignar rol de Propietario
        DECLARE @id_rol_propietario INT = (SELECT id_rol FROM Roles WHERE nombre_rol = 'Propietario');
        INSERT INTO Personas_rol (id_persona, id_rol) VALUES (@id_persona, @id_rol_propietario);
        
        -- 4. Generar registro de propietario
        SET @registro_propietario = 'PROP-' + RIGHT('000' + CAST((SELECT COUNT(*) FROM Propietarios) + 1 AS VARCHAR(10)), 3);
        
        -- 5. Crear el propietario
        INSERT INTO Propietarios (
            id_persona, registro_propietario, ciudad_residencia, 
            direccion_residencia, estado, observaciones
        )
        VALUES (
            @id_persona, @registro_propietario, @ciudad_residencia,
            @direccion_residencia, @estado, @observaciones
        );
        
        DECLARE @id_propietario INT = SCOPE_IDENTITY();
        
        -- 6. Asignar inmuebles si se proporcionan
        IF @inmuebles_asignar IS NOT NULL
        BEGIN
            INSERT INTO Propiedad_inmueble (
                id_inmueble, id_persona, fecha_inicio, 
                porcentaje_propiedad, es_propietario_actual, estado
            )
            SELECT 
                id_inmueble,
                @id_persona,
                GETDATE(),
                porcentaje_propiedad,
                1,  -- es_propietario_actual
                'Activo'
            FROM OPENJSON(@inmuebles_asignar)
            WITH (
                id_inmueble INT '$.id_inmueble',
                porcentaje_propiedad DECIMAL(5,2) '$.porcentaje_propiedad'
            );
        END
        
        COMMIT TRANSACTION;
        
        -- Retornar el ID del propietario creado
        SELECT 
            @id_propietario AS id_propietario,
            @registro_propietario AS registro,
            @id_persona AS id_persona;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
PRINT '✅ Procedimiento sp_CrearPropietarioCompleto creado';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Procedimiento: sp_AsignarInmueblesAPropietario
-- Descripción: Asignar inmuebles a un propietario existente
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.sp_AsignarInmueblesAPropietario', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_AsignarInmueblesAPropietario;
GO

CREATE PROCEDURE sp_AsignarInmueblesAPropietario
    @id_propietario INT,
    @inmuebles_asignar NVARCHAR(MAX)  -- JSON: [{"id_inmueble": 1, "porcentaje_propiedad": 100.00}]
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @id_persona INT;
        
        -- Obtener el id_persona del propietario
        SELECT @id_persona = id_persona FROM Propietarios WHERE id_propietario = @id_propietario;
        
        IF @id_persona IS NULL
        BEGIN
            RAISERROR('Propietario no encontrado', 16, 1);
            RETURN;
        END
        
        -- Desactivar asignaciones anteriores para estos inmuebles
        UPDATE Propiedad_inmueble 
        SET es_propietario_actual = 0, estado = 'Inactivo'
        WHERE id_inmueble IN (
            SELECT id_inmueble 
            FROM OPENJSON(@inmuebles_asignar)
            WITH (id_inmueble INT '$.id_inmueble')
        )
        AND es_propietario_actual = 1;
        
        -- Asignar nuevos inmuebles
        INSERT INTO Propiedad_inmueble (
            id_inmueble, id_persona, fecha_inicio, 
            porcentaje_propiedad, es_propietario_actual, estado
        )
        SELECT 
            id_inmueble,
            @id_persona,
            GETDATE(),
            porcentaje_propiedad,
            1,  -- es_propietario_actual
            'Activo'
        FROM OPENJSON(@inmuebles_asignar)
        WITH (
            id_inmueble INT '$.id_inmueble',
            porcentaje_propiedad DECIMAL(5,2) '$.porcentaje_propiedad'
        );
        
        COMMIT TRANSACTION;
        
        SELECT 'Inmuebles asignados exitosamente' AS mensaje;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
PRINT '✅ Procedimiento sp_AsignarInmueblesAPropietario creado';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Procedimiento: sp_CrearInmuebleCompleto
-- Descripción: Crear inmueble con todas sus relaciones (comodidades, ficha técnica, propietario)
-- ---------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.sp_CrearInmuebleCompleto', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CrearInmuebleCompleto;
GO

CREATE PROCEDURE sp_CrearInmuebleCompleto
    @titulo VARCHAR(200),
    @categoria VARCHAR(50),
    @operacion VARCHAR(20),
    @precio_venta DECIMAL(15,2) = NULL,
    @precio_arriendo DECIMAL(15,2) = NULL,
    @pais VARCHAR(50) = 'Colombia',
    @departamento VARCHAR(50),
    @ciudad VARCHAR(50),
    @barrio VARCHAR(100) = NULL,
    @direccion VARCHAR(100),
    @descripcion TEXT = NULL,
    @area_construida DECIMAL(10,2) = NULL,
    @area_terreno DECIMAL(10,2) = NULL,
    @estado_frontend VARCHAR(50) = 'Disponible',
    @id_propietario INT = NULL,
    @comodidades_json NVARCHAR(MAX) = NULL,  -- JSON: [{"id_comodidad": 1, "cantidad": 2, "seleccionada": true}]
    @id_usuario_creador INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 1. Crear el inmueble
        DECLARE @registro_inmobiliario VARCHAR(50);
        DECLARE @id_inmueble INT;
        
        -- Generar registro inmobiliario automático
        SET @registro_inmobiliario = 'INM-' + FORMAT(GETDATE(), 'yyyyMMdd') + '-' + 
            RIGHT('000' + CAST((SELECT COUNT(*) FROM Inmuebles) + 1 AS VARCHAR(3)), 3);
        
        INSERT INTO Inmuebles (
            registro_inmobiliario, titulo, categoria, operacion, 
            precio_venta, precio_arriendo, pais, departamento, ciudad, barrio, direccion,
            descripcion, area_construida, area_terreno, estado_frontend
        )
        VALUES (
            @registro_inmobiliario, @titulo, @categoria, @operacion,
            @precio_venta, @precio_arriendo, @pais, @departamento, @ciudad, @barrio, @direccion,
            @descripcion, @area_construida, @area_terreno, @estado_frontend
        );
        
        SET @id_inmueble = SCOPE_IDENTITY();
        
        -- 2. Asignar propietario si se proporciona
        IF @id_propietario IS NOT NULL
        BEGIN
            -- Obtener id_persona del propietario
            DECLARE @id_persona_propietario INT;
            SELECT @id_persona_propietario = id_persona FROM Propietarios WHERE id_propietario = @id_propietario;
            
            IF @id_persona_propietario IS NOT NULL
            BEGIN
                INSERT INTO Propiedad_inmueble (
                    id_inmueble, id_persona, fecha_inicio, 
                    porcentaje_propiedad, es_propietario_actual, estado
                )
                VALUES (@id_inmueble, @id_persona_propietario, GETDATE(), 100.00, 1, 'Activo');
            END
        END
        
        -- 3. Procesar comodidades si se proporcionan
        IF @comodidades_json IS NOT NULL
        BEGIN
            INSERT INTO Inmueble_Comodidades (id_inmueble, id_comodidad, cantidad, seleccionada)
            SELECT 
                @id_inmueble,
                id_comodidad,
                cantidad,
                seleccionada
            FROM OPENJSON(@comodidades_json)
            WITH (
                id_comodidad INT '$.id_comodidad',
                cantidad INT '$.cantidad',
                seleccionada BIT '$.seleccionada'
            );
        END
        
        -- 4. Crear ficha técnica inicial
        INSERT INTO Fichas_Tecnicas (id_inmueble, version, fecha_creacion, cambios, id_usuario_creador)
        VALUES (@id_inmueble, 1, GETDATE(), 'Creación inicial del inmueble', @id_usuario_creador);
        
        COMMIT TRANSACTION;
        
        -- Retornar el ID del inmueble creado
        SELECT @id_inmueble AS id_inmueble, @registro_inmobiliario AS registro;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
PRINT '✅ Procedimiento sp_CrearInmuebleCompleto creado';
GO

-- =====================================================================================================================
-- PASO 11: DATOS INICIALES (SEEDS) - ACTUALIZADOS CON PROPIETARIOS
-- =====================================================================================================================
-- Insertar datos necesarios para que el sistema funcione desde el inicio

PRINT '';
PRINT '=====================================================================================================================';
PRINT 'INSERTANDO DATOS INICIALES (SEEDS) - CON SOPORTE PARA FRONTEND REACT Y PROPIETARIOS';
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

-- ---------------------------------------------------------------------------------------------------------------------
-- Seeds: Estados de Venta
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Estados_venta WHERE nombre_estado = 'Iniciada')
BEGIN
    INSERT INTO Estados_venta (nombre_estado, descripcion, orden, es_estado_final) VALUES
    ('Iniciada', 'Proceso de venta iniciado', 1, 0),
    ('En negociación', 'En proceso de negociación con el cliente', 2, 0),
    ('Reservada', 'Inmueble reservado con seña', 3, 0),
    ('Contrato firmado', 'Contrato de compraventa firmado', 4, 0),
    ('Finalizada', 'Venta completada exitosamente', 5, 1),
    ('Cancelada', 'Venta cancelada', 6, 1);
    
    PRINT '✅ Estados de venta insertados (6 estados)';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Seeds: Comodidades por tipo de inmueble
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Comodidades WHERE nombre = 'Habitaciones')
BEGIN
    INSERT INTO Comodidades (nombre, tipo_inmueble) VALUES
    -- Comodidades para Casa
    ('Habitaciones', 'Casa'),
    ('Baños', 'Casa'),
    ('Parqueaderos', 'Casa'),
    ('Cocina integral', 'Casa'),
    ('Sala-comedor', 'Casa'),
    ('Patio', 'Casa'),
    ('Jardín', 'Casa'),
    ('Lavandería', 'Casa'),
    ('Balcón', 'Casa'),
    
    -- Comodidades para Apartamento
    ('Habitaciones', 'Apartamento'),
    ('Baños', 'Apartamento'),
    ('Parqueaderos', 'Apartamento'),
    ('Cocina integral', 'Apartamento'),
    ('Balcón', 'Apartamento'),
    ('Zona de lavandería', 'Apartamento'),
    ('Ascensor', 'Apartamento'),
    ('Portería', 'Apartamento'),
    
    -- Comodidades para Apartaestudio
    ('Baños', 'Apartaestudio'),
    ('Parqueaderos', 'Apartaestudio'),
    ('Cocina integral', 'Apartaestudio'),
    ('Balcón', 'Apartaestudio'),
    ('Zona de lavandería', 'Apartaestudio'),
    ('Ascensor', 'Apartaestudio'),
    ('Portería', 'Apartaestudio'),
    
    -- Comodidades para Finca
    ('Habitaciones', 'Finca'),
    ('Baños', 'Finca'),
    ('Parqueaderos', 'Finca'),
    ('Cocina', 'Finca'),
    ('Piscina', 'Finca'),
    ('Kiosco', 'Finca'),
    ('Establos', 'Finca'),
    ('Cultivos', 'Finca'),
    ('Lago', 'Finca'),
    
    -- Comodidades para Lote
    ('Área construible', 'Lote'),
    ('Servicios públicos', 'Lote'),
    ('Acceso vehicular', 'Lote'),
    ('Documentación al día', 'Lote'),
    
    -- Comodidades para Oficina
    ('Baños', 'Oficina'),
    ('Parqueaderos', 'Oficina'),
    ('Recepción', 'Oficina'),
    ('Sala de juntas', 'Oficina'),
    ('Cocina', 'Oficina'),
    ('Aire acondicionado', 'Oficina'),
    ('Internet', 'Oficina');

    PRINT '✅ Comodidades insertadas por tipo de inmueble';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Seed: Super Administrador (Usuario inicial del sistema)
-- Importante: CAMBIAR LA CONTRASEÑA EN PRODUCCIÓN
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Personas WHERE numero_documento = '999999999')
BEGIN
    -- Insertar Persona
    INSERT INTO Personas (tipo_documento, numero_documento, nombre_completo, apellido_completo, correo, telefono, tiene_cuenta)
    VALUES ('CC', '999999999', 'Super', 'Admin', 'admin@inmotech.com', '+57 300 000 0000', 1);

    DECLARE @id_super_admin INT = SCOPE_IDENTITY();

    -- Insertar Acceso (contraseña hasheada con bcrypt: "Admin123!")
    -- ⚠️ IMPORTANTE: En producción, cambiar esta contraseña inmediatamente después del primer login
    INSERT INTO Acceso (id_persona, contrasena)
    VALUES (@id_super_admin, '$2b$10$rKvFJZEJfRJdLx6jxL5zMeyPh8s9JZCvC.yMFNyV8HQKZ6yFN.JxC');

    -- Insertar en tabla Administrativos (personal interno)
    INSERT INTO Administrativos (id_persona, codigo_empleado, fecha_ingreso, cargo, departamento, estado_laboral)
    VALUES (@id_super_admin, 'ADMIN-001', GETDATE(), 'Super Administrador', 'Tecnología', 'Activo');

    -- Asignar rol Super Administrador
    DECLARE @id_rol_super INT = (SELECT id_rol FROM Roles WHERE nombre_rol = 'Super Administrador');
    INSERT INTO Personas_rol (id_persona, id_rol)
    VALUES (@id_super_admin, @id_rol_super);

    PRINT '';
    PRINT '✅ Super Administrador creado exitosamente';
    PRINT '';
    PRINT '   ╔════════════════════════════════════════════════════╗';
    PRINT '   ║         CREDENCIALES DE SUPER ADMINISTRADOR        ║';
    PRINT '   ╠════════════════════════════════════════════════════╣';
    PRINT '   ║  Email:    admin@inmotech.com                      ║';
    PRINT '   ║  Password: Admin123!                               ║';
    PRINT '   ║  Código:   ADMIN-001                               ║';
    PRINT '   ╚════════════════════════════════════════════════════╝';
    PRINT '';
    PRINT '   ⚠️  IMPORTANTE: Cambiar esta contraseña en producción';
    PRINT '';
END
ELSE
BEGIN
    PRINT '⚠️  Super Administrador ya existe en la base de datos';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Seed: Propietarios de ejemplo
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Propietarios WHERE registro_propietario = 'PROP-001')
BEGIN
    -- Obtener el ID del super admin
    DECLARE @id_super_admin INT = (SELECT id_persona FROM Personas WHERE numero_documento = '999999999');
    
    -- Crear propietario para el super admin
    INSERT INTO Propietarios (id_persona, registro_propietario, ciudad_residencia, direccion_residencia)
    VALUES (@id_super_admin, 'PROP-001', 'Medellín', 'Oficina Principal InmoTech');
    
    -- Crear propietarios adicionales de ejemplo
    INSERT INTO Personas (tipo_documento, numero_documento, nombre_completo, apellido_completo, correo, telefono, tiene_cuenta)
    VALUES 
    ('CC', '123456789', 'María', 'González López', 'maria.gonzalez@email.com', '+57 300 987 6543', 0),
    ('CC', '987654321', 'Carlos', 'Martínez Rodríguez', 'carlos.martinez@email.com', '+57 300 555 6789', 0);
    
    DECLARE @id_maria INT = SCOPE_IDENTITY();
    DECLARE @id_carlos INT = (SELECT id_persona FROM Personas WHERE numero_documento = '987654321');
    
    -- Asignar rol Propietario
    DECLARE @id_rol_prop INT = (SELECT id_rol FROM Roles WHERE nombre_rol = 'Propietario');
    INSERT INTO Personas_rol (id_persona, id_rol) VALUES (@id_maria, @id_rol_prop);
    INSERT INTO Personas_rol (id_persona, id_rol) VALUES (@id_carlos, @id_rol_prop);
    
    -- Crear propietarios
    INSERT INTO Propietarios (id_persona, registro_propietario, ciudad_residencia, direccion_residencia)
    VALUES 
    (@id_maria, 'PROP-002', 'Medellín', 'Carrera 70 #45-23'),
    (@id_carlos, 'PROP-003', 'Envigado', 'Calle 25 Sur #35-45');
    
    PRINT '✅ Propietarios de ejemplo creados';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Seed: Inmueble de prueba (actualizado con nuevos campos)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Inmuebles WHERE registro_inmobiliario = 'INM-001-TEST')
BEGIN
    INSERT INTO Inmuebles (
        registro_inmobiliario, titulo, pais, departamento, ciudad, barrio, direccion, 
        categoria, operacion, precio_venta, precio_arriendo, area_construida, descripcion,
        estado_frontend
    )
    VALUES (
        'INM-001-TEST',
        'Apartamento moderno en El Poblado',
        'Colombia',
        'Antioquia',
        'Medellín',
        'El Poblado',
        'Calle 50 # 45-20',
        'Apartamento',
        'Arriendo',
        NULL,
        2500000.00,
        120.50,
        'Apartamento de prueba para testing del sistema. 3 habitaciones, 2 baños, balcón con vista.',
        'Disponible'
    );

    -- Insertar comodidades para el inmueble de prueba
    DECLARE @id_inmueble_test INT = SCOPE_IDENTITY();
    
    INSERT INTO Inmueble_Comodidades (id_inmueble, id_comodidad, cantidad, seleccionada)
    SELECT 
        @id_inmueble_test,
        id_comodidad,
        CASE 
            WHEN nombre = 'Habitaciones' THEN 3
            WHEN nombre = 'Baños' THEN 2
            WHEN nombre = 'Parqueaderos' THEN 1
            ELSE 1
        END,
        1  -- seleccionada
    FROM Comodidades 
    WHERE nombre IN ('Habitaciones', 'Baños', 'Parqueaderos', 'Cocina integral', 'Balcón')
    AND tipo_inmueble = 'Apartamento';

    -- Asignar propietario al inmueble de prueba
    DECLARE @id_propietario_super INT = (SELECT id_propietario FROM Propietarios WHERE registro_propietario = 'PROP-001');
    
    INSERT INTO Propiedad_inmueble (
        id_inmueble, id_persona, fecha_inicio, porcentaje_propiedad, es_propietario_actual, estado
    )
    SELECT 
        @id_inmueble_test,
        id_persona,
        GETDATE(),
        100.00,
        1,
        'Activo'
    FROM Propietarios 
    WHERE id_propietario = @id_propietario_super;

    -- Crear ficha técnica inicial
    INSERT INTO Fichas_Tecnicas (id_inmueble, version, fecha_creacion, cambios)
    VALUES (@id_inmueble_test, 1, GETDATE(), 'Creación inicial del inmueble');

    PRINT '✅ Inmueble de prueba creado (INM-001-TEST) con comodidades, propietario y ficha técnica';
END
ELSE
BEGIN
    -- Actualizar el inmueble existente con los nuevos campos
    UPDATE Inmuebles SET 
        titulo = 'Apartamento moderno en El Poblado',
        operacion = 'Arriendo',
        estado_frontend = 'Disponible'
    WHERE registro_inmobiliario = 'INM-001-TEST';
    
    PRINT '✅ Inmueble de prueba actualizado con campos del frontend';
END
GO

-- =====================================================================================================================
-- PASO 12: VERIFICACIÓN FINAL Y RESUMEN
-- =====================================================================================================================

PRINT '';
PRINT '=====================================================================================================================';
PRINT '                           ✅ BASE DE DATOS INMOTECH v6.0 CREADA EXITOSAMENTE';
PRINT '                    CON SOPORTE COMPLETO PARA FRONTEND REACT, API REST Y GESTIÓN DE PROPIETARIOS';
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
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Propietarios')
    PRINT '   ✓ Propietarios (NUEVA)';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Inmuebles')
    PRINT '   ✓ Inmuebles (ACTUALIZADA)';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comodidades')
    PRINT '   ✓ Comodidades (NUEVA)';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Inmueble_Comodidades')
    PRINT '   ✓ Inmueble_Comodidades (NUEVA)';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Fichas_Tecnicas')
    PRINT '   ✓ Fichas_Tecnicas (NUEVA)';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Propiedad_inmueble')
    PRINT '   ✓ Propiedad_inmueble (ACTUALIZADA)';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Citas')
    PRINT '   ✓ Citas';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notificaciones')
    PRINT '   ✓ Notificaciones';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Reportes')
    PRINT '   ✓ Reportes';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Ventas')
    PRINT '   ✓ Ventas';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Arrendamientos')
    PRINT '   ✓ Arrendamientos';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Cobros')
    PRINT '   ✓ Cobros';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comprobantes_pago')
    PRINT '   ✓ Comprobantes_pago';
PRINT '';

-- Verificar datos iniciales
DECLARE @TotalRoles INT, @TotalEstados INT, @TotalServicios INT, @TotalAdmins INT, @TotalEstadosVenta INT, @TotalComodidades INT, @TotalPropietarios INT;
SELECT @TotalRoles = COUNT(*) FROM Roles;
SELECT @TotalEstados = COUNT(*) FROM Estados_cita;
SELECT @TotalServicios = COUNT(*) FROM Servicios_cita;
SELECT @TotalAdmins = COUNT(*) FROM Administrativos;
SELECT @TotalEstadosVenta = COUNT(*) FROM Estados_venta;
SELECT @TotalComodidades = COUNT(*) FROM Comodidades;
SELECT @TotalPropietarios = COUNT(*) FROM Propietarios;

PRINT '📋 DATOS INICIALES:';
PRINT '   - Roles:             ' + CAST(@TotalRoles AS VARCHAR(10));
PRINT '   - Estados de cita:   ' + CAST(@TotalEstados AS VARCHAR(10));
PRINT '   - Servicios de cita: ' + CAST(@TotalServicios AS VARCHAR(10));
PRINT '   - Estados de venta:  ' + CAST(@TotalEstadosVenta AS VARCHAR(10));
PRINT '   - Comodidades:       ' + CAST(@TotalComodidades AS VARCHAR(10));
PRINT '   - Propietarios:      ' + CAST(@TotalPropietarios AS VARCHAR(10));
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
PRINT '   │  PROPIETARIOS (Clientes con propiedades)            │';
PRINT '   │  - Propietario                                      │';
PRINT '   │  - Tabla: Propietarios + Personas                   │';
PRINT '   │  - Acceso a: Gestionar sus inmuebles                │';
PRINT '   └─────────────────────────────────────────────────────┘';
PRINT '   ┌─────────────────────────────────────────────────────┐';
PRINT '   │  USUARIOS (Clientes generales)                      │';
PRINT '   │  - Usuario                                          │';
PRINT '   │  - Tabla: Solo Personas                             │';
PRINT '   │  - Acceso a: Ver inmuebles, agendar citas           │';
PRINT '   └─────────────────────────────────────────────────────┘';
PRINT '';



PRINT '=====================================================================================================================';
PRINT '                                    🎉 BASE DE DATOS LISTA PARA USAR 🎉';
PRINT '           CON SOPORTE COMPLETO PARA FRONTEND REACT, BACKEND API Y GESTIÓN DE PROPIETARIOS';
PRINT '=====================================================================================================================';
GO

-- Mostrar datos de prueba
PRINT '';
PRINT '📋 DATOS DE PRUEBA DISPONIBLES:';
PRINT '   - Super Administrador: admin@inmotech.com / Admin123!';
PRINT '   - Propietarios: PROP-001, PROP-002, PROP-003';
PRINT '   - Inmueble de prueba: INM-001-TEST (asignado a PROP-001)';
PRINT '   - Comodidades predefinidas por tipo de inmueble';
PRINT '';

SELECT * FROM Personas;
