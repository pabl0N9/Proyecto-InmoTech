<<<<<<< HEAD
<<<<<<< HEAD:nueva_base_de_datos.sql
-- =====================================================================================================================
-- BASE DE DATOS INMOBILIARIA INMOTECH
-- =====================================================================================================================
-- Motor:           Microsoft SQL Server 2016+
-- Versión:         6.0 FINAL - CON ARQUITECTURA DE ADMINISTRATIVOS
-- Compatibilidad:  Sequelize ORM + Node.js + Express
-- Autor:           Sistema InmoTech
-- Fecha:           Octubre 2025
=======
﻿-- =====================================================================================================================
-- BASE DE DATOS INMOBILIARIA INMOTECH - VERSIÓN COMPLETA Y CORREGIDA
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
-- =====================================================================================================================

-- Motor:           Microsoft SQL Server 2016+
-- Versión:         6.0 FINAL - CON LÓGICA DE NEGOCIO CORREGIDA
-- Autor:           Sistema InmoTech
-- Fecha:           Octubre 2025
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
    PRINT 'ℹ️ Base de datos InmobiliariaDB ya existe - usando existente';
END
GO

USE InmobiliariaDB;
GO

PRINT '';
PRINT '=====================================================================================================================';
PRINT 'INICIANDO CREACIÓN DE ESTRUCTURA DE BASE DE DATOS INMOTECH v6.0 - VERSIÓN CORREGIDA';
PRINT '=====================================================================================================================';
PRINT '';
GO

-- =====================================================================================================================
-- PASO 2: TABLAS PRINCIPALES - GESTIÓN DE PERSONAS
-- =====================================================================================================================

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Personas
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Personas]') AND type = 'U')
BEGIN
    CREATE TABLE Personas (
        id_persona INT PRIMARY KEY IDENTITY(1,1),
        tipo_documento VARCHAR(5) NOT NULL CHECK (tipo_documento IN ('CC', 'CE', 'NIT', 'Pasaporte', 'TI')),
        numero_documento VARCHAR(20) NOT NULL,
        nombre_completo VARCHAR(100) NOT NULL,
        apellido_completo VARCHAR(100) NOT NULL,
        correo VARCHAR(100) NOT NULL,
        telefono VARCHAR(20) NULL,
        tiene_cuenta BIT NOT NULL DEFAULT 0,
        estado BIT NOT NULL DEFAULT 1,
        fecha_registro DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_Persona_Documento UNIQUE (tipo_documento, numero_documento),
        CONSTRAINT UQ_Persona_Correo UNIQUE (correo),
        CONSTRAINT CHK_Personas_Email CHECK (correo LIKE '%_@__%.__%'),
        CONSTRAINT CHK_Personas_TipoDoc CHECK (tipo_documento IN ('CC', 'CE', 'NIT', 'Pasaporte', 'TI'))
    );
    PRINT '✅ Tabla Personas creada';
END
GO

-- Índices para Personas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personas_Documento' AND object_id = OBJECT_ID('Personas'))
    CREATE NONCLUSTERED INDEX IX_Personas_Documento ON Personas(tipo_documento, numero_documento);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personas_Correo' AND object_id = OBJECT_ID('Personas'))
    CREATE NONCLUSTERED INDEX IX_Personas_Correo ON Personas(correo);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personas_TieneCuenta' AND object_id = OBJECT_ID('Personas'))
    CREATE NONCLUSTERED INDEX IX_Personas_TieneCuenta ON Personas(tiene_cuenta) INCLUDE (estado);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Acceso
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Acceso]') AND type = 'U')
BEGIN
    CREATE TABLE Acceso (
        id_acceso INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        ultimo_acceso DATETIME2(3) NULL,

        CONSTRAINT FK_Acceso_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Acceso creada';
END
GO

ALTER TABLE Acceso ADD ultimo_cambio_password DATETIME NULL DEFAULT GETDATE();
GO

<<<<<<< HEAD
<<<<<<< HEAD


/*
  Script para habilitar el flujo de invitaciones con código 6D.
  - Crea tabla Invitaciones
  - Agrega flag password_change_required a Acceso
*/

-- Tabla Invitaciones
=======

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla Invitaciones
---------------------------------------------------------------------------------------------------------------------

>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Invitaciones' AND xtype='U')
BEGIN
  CREATE TABLE Invitaciones (
    id_invitacion INT IDENTITY(1,1) PRIMARY KEY,
    id_persona INT NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'admin_invite',
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    codigo_6d CHAR(6) NOT NULL,
    expira_en DATETIME NOT NULL,
    usado_en DATETIME NULL,
    intentos INT NOT NULL DEFAULT 0,
    reenvios INT NOT NULL DEFAULT 0,
    creado_en DATETIME NOT NULL DEFAULT GETDATE(),
    creado_por INT NULL,
    ip_uso VARCHAR(64) NULL,
    ua_uso VARCHAR(255) NULL
  );

  CREATE INDEX IX_Invitaciones_Persona ON Invitaciones (id_persona);
  CREATE INDEX IX_Invitaciones_Expira ON Invitaciones (expira_en);

  ALTER TABLE Invitaciones
    ADD CONSTRAINT FK_Invitaciones_Persona
    FOREIGN KEY (id_persona) REFERENCES Personas(id_persona);
END
GO

-- Campos adicionales para el flujo de invitaciones/verificación
IF COL_LENGTH('Invitaciones', 'tipo') IS NULL
BEGIN
  ALTER TABLE Invitaciones
    ADD tipo VARCHAR(20) NOT NULL CONSTRAINT DF_Invitaciones_tipo DEFAULT 'admin_invite';
END
GO

IF COL_LENGTH('Invitaciones', 'reenvios') IS NULL
BEGIN
  ALTER TABLE Invitaciones
    ADD reenvios INT NOT NULL CONSTRAINT DF_Invitaciones_reenvios DEFAULT 0;
END
GO

-- Flag para correo verificado en Personas
IF COL_LENGTH('Personas', 'correo_verificado') IS NULL
BEGIN
  ALTER TABLE Personas
    ADD correo_verificado BIT NOT NULL CONSTRAINT DF_Personas_correo_verificado DEFAULT 0;
END
GO

-- Flag en Acceso para forzar cambio de password
IF COL_LENGTH('Acceso', 'password_change_required') IS NULL
BEGIN
  ALTER TABLE Acceso
    ADD password_change_required BIT NOT NULL CONSTRAINT DF_Acceso_password_change_required DEFAULT 0;
END
GO

<<<<<<< HEAD


=======
>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0
=======
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Roles
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type = 'U')
BEGIN
    CREATE TABLE Roles (
        id_rol INT PRIMARY KEY IDENTITY(1,1),
        nombre_rol VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(200) NULL,
        es_rol_administrativo BIT NOT NULL DEFAULT 0,
        estado BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Tabla Roles creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Personas_rol
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Personas_rol]') AND type = 'U')
BEGIN
    CREATE TABLE Personas_rol (
        id_persona_rol INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL,
        id_rol INT NOT NULL,
        estado BIT NOT NULL DEFAULT 1,
        fecha_asignacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_PersonasRol_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona) ON DELETE CASCADE,
        CONSTRAINT FK_PersonasRol_Rol FOREIGN KEY (id_rol) REFERENCES Roles(id_rol) ON DELETE CASCADE,
        CONSTRAINT UQ_PersonasRol_Unico UNIQUE (id_persona, id_rol)
    );
    PRINT '✅ Tabla Personas_rol creada';
END
GO

-- Índices para Personas_rol
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PersonasRol_Persona' AND object_id = OBJECT_ID('Personas_rol'))
    CREATE NONCLUSTERED INDEX IX_PersonasRol_Persona ON Personas_rol(id_persona);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PersonasRol_Rol' AND object_id = OBJECT_ID('Personas_rol'))
    CREATE NONCLUSTERED INDEX IX_PersonasRol_Rol ON Personas_rol(id_rol);
GO

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


<<<<<<< HEAD
=======
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

>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0
-- =====================================================================================================================
-- PASO 3: TABLA DE ADMINISTRATIVOS (PERSONAL INTERNO)
-- =====================================================================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Administrativos]') AND type = 'U')
BEGIN
    CREATE TABLE Administrativos (
        id_administrativo INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,
        codigo_empleado VARCHAR(20) UNIQUE NOT NULL,
        fecha_ingreso DATE NOT NULL,
        cargo VARCHAR(100) NULL,
        departamento VARCHAR(100) NULL,
        salario DECIMAL(15,2) NULL,
        estado_laboral VARCHAR(50) NOT NULL DEFAULT 'Activo' CHECK (estado_laboral IN ('Activo', 'Inactivo', 'Suspendido', 'Retirado')),
        fecha_retiro DATE NULL,
        observaciones TEXT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Administrativos_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona) ON DELETE CASCADE,
        CONSTRAINT CHK_Administrativos_FechaRetiro CHECK (fecha_retiro IS NULL OR fecha_retiro >= fecha_ingreso)
    );
    PRINT '✅ Tabla Administrativos creada';
END
GO

-- Índices para Administrativos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Administrativos_CodigoEmpleado' AND object_id = OBJECT_ID('Administrativos'))
    CREATE NONCLUSTERED INDEX IX_Administrativos_CodigoEmpleado ON Administrativos(codigo_empleado);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Administrativos_EstadoLaboral' AND object_id = OBJECT_ID('Administrativos'))
    CREATE NONCLUSTERED INDEX IX_Administrativos_EstadoLaboral 
    ON Administrativos(estado_laboral)
    WHERE estado_laboral = 'Activo';
GO

-- =====================================================================================================================
-- PASO 4: TABLA DE PROPIETARIOS
-- =====================================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Propietarios]') AND type = 'U')
BEGIN
    CREATE TABLE Propietarios (
        id_propietario INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,
        registro_propietario VARCHAR(20) NOT NULL UNIQUE,
        fecha_registro_propietario DATE NOT NULL DEFAULT GETDATE(),
        ciudad_residencia VARCHAR(50) NULL,
        direccion_residencia VARCHAR(100) NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
        observaciones TEXT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_actualizacion DATETIME2(3) NULL,
        
        CONSTRAINT FK_Propietarios_Persona FOREIGN KEY (id_persona) 
            REFERENCES Personas(id_persona) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Propietarios creada';
END
GO

-- Índices para Propietarios
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Propietarios_Registro' AND object_id = OBJECT_ID('Propietarios'))
    CREATE NONCLUSTERED INDEX IX_Propietarios_Registro ON Propietarios(registro_propietario);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Propietarios_Estado' AND object_id = OBJECT_ID('Propietarios'))
    CREATE NONCLUSTERED INDEX IX_Propietarios_Estado ON Propietarios(estado) WHERE estado = 'Activo';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Propietarios_Persona' AND object_id = OBJECT_ID('Propietarios'))
    CREATE NONCLUSTERED INDEX IX_Propietarios_Persona ON Propietarios(id_persona);
GO

-- =====================================================================================================================
-- PASO 5: TABLAS DE INMUEBLES
-- =====================================================================================================================

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Inmuebles
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Inmuebles]') AND type = 'U')
BEGIN
    CREATE TABLE Inmuebles (
        id_inmueble INT PRIMARY KEY IDENTITY(1,1),
<<<<<<< HEAD
<<<<<<< HEAD

        -- Identificación única del inmueble
        registro_inmobiliario VARCHAR(50) NOT NULL UNIQUE,  -- Matrícula inmobiliaria

        -- Ubicación
=======
        registro_inmobiliario VARCHAR(50) NOT NULL UNIQUE,
>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0
        pais VARCHAR(50) NOT NULL,
=======
        registro_inmobiliario VARCHAR(50) NOT NULL UNIQUE,
        pais VARCHAR(50) NOT NULL DEFAULT 'Colombia',
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
        departamento VARCHAR(50) NOT NULL,
        ciudad VARCHAR(50) NOT NULL,
        barrio VARCHAR(100) NULL,
        direccion VARCHAR(100) NOT NULL,
<<<<<<< HEAD
<<<<<<< HEAD

        -- Características básicas
        categoria VARCHAR(50) NULL,                         -- Casa, Apartamento, Local, Oficina, Lote
        precio_venta DECIMAL(15,2) NULL,                    -- Si está en venta
        precio_arriendo DECIMAL(15,2) NULL,                 -- Si está en arriendo
        area_construida DECIMAL(10,2) NULL,                 -- Metros cuadrados construidos
        area_terreno DECIMAL(10,2) NULL,                    -- Metros cuadrados de terreno

        -- Descripción detallada
=======
        categoria VARCHAR(50) NULL,
        precio_venta DECIMAL(15,2) NULL,
        precio_arriendo DECIMAL(15,2) NULL,
        area_construida DECIMAL(10,2) NULL,
        area_terreno DECIMAL(10,2) NULL,
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
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
    PRINT '✅ Tabla Inmuebles creada';
END
ELSE
BEGIN
    -- Agregar columnas si no existen
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'operacion' AND Object_ID = Object_ID(N'Inmuebles'))
    BEGIN
        -- ✅ CORRECTO: Solo UN DEFAULT constraint
        ALTER TABLE Inmuebles ADD operacion VARCHAR(20) NOT NULL 
        CONSTRAINT DF_Inmuebles_Operacion DEFAULT 'Venta';
        
        -- Agregar check constraint después de agregar la columna
        ALTER TABLE Inmuebles ADD CONSTRAINT CHK_Inmuebles_Operacion 
        CHECK (operacion IN ('Venta', 'Arriendo'));
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'estado_frontend' AND Object_ID = Object_ID(N'Inmuebles'))
    BEGIN
        -- ✅ CORRECTO: Solo UN DEFAULT constraint
        ALTER TABLE Inmuebles ADD estado_frontend VARCHAR(50) NOT NULL 
        CONSTRAINT DF_Inmuebles_EstadoFrontend DEFAULT 'Disponible';
        
        -- Agregar check constraint después de agregar la columna
        ALTER TABLE Inmuebles ADD CONSTRAINT CHK_Inmuebles_EstadoFrontend 
        CHECK (estado_frontend IN ('Disponible', 'Vendido', 'Arrendado', 'En proceso de venta', 'En proceso de arrendamiento'));
    END
END
GO-- Índices para Inmuebles
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
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Comodidades
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Comodidades]') AND type = 'U')
BEGIN
    CREATE TABLE Comodidades (
        id_comodidad INT PRIMARY KEY IDENTITY(1,1),
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion VARCHAR(200) NULL,
        tipo_inmueble VARCHAR(50) NULL,
        estado BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Tabla Comodidades creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Inmueble_Comodidades
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Inmueble_Comodidades]') AND type = 'U')
BEGIN
    CREATE TABLE Inmueble_Comodidades (
        id_inmueble_comodidad INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
        id_comodidad INT NOT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        seleccionada BIT NOT NULL DEFAULT 1,
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
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_InmuebleComodidades_Inmueble' AND object_id = OBJECT_ID('Inmueble_Comodidades'))
    CREATE NONCLUSTERED INDEX IX_InmuebleComodidades_Inmueble ON Inmueble_Comodidades(id_inmueble);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_InmuebleComodidades_Comodidad' AND object_id = OBJECT_ID('Inmueble_Comodidades'))
    CREATE NONCLUSTERED INDEX IX_InmuebleComodidades_Comodidad ON Inmueble_Comodidades(id_comodidad);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Fichas_Tecnicas
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Fichas_Tecnicas]') AND type = 'U')
BEGIN
    CREATE TABLE Fichas_Tecnicas (
        id_ficha_tecnica INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
        version INT NOT NULL,
        fecha_creacion DATE NOT NULL,
        cambios TEXT NOT NULL,
        datos_json NVARCHAR(MAX) NULL,
        id_usuario_creador INT NULL,
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
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FichasTecnicas_Inmueble' AND object_id = OBJECT_ID('Fichas_Tecnicas'))
    CREATE NONCLUSTERED INDEX IX_FichasTecnicas_Inmueble ON Fichas_Tecnicas(id_inmueble);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FichasTecnicas_Fecha' AND object_id = OBJECT_ID('Fichas_Tecnicas'))
    CREATE NONCLUSTERED INDEX IX_FichasTecnicas_Fecha ON Fichas_Tecnicas(fecha_creacion DESC);
GO

=======
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


>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0
-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Propiedad_inmueble
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Propiedad_inmueble]') AND type = 'U')
BEGIN
    CREATE TABLE Propiedad_inmueble (
<<<<<<< HEAD
<<<<<<< HEAD
        id_propietario INT PRIMARY KEY IDENTITY(1,1),
=======
        id_propiedad_inmueble INT PRIMARY KEY IDENTITY(1,1),
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
        id_inmueble INT NOT NULL,
        id_persona INT NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_final DATE NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
        porcentaje_propiedad DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        es_propietario_actual BIT NOT NULL DEFAULT 1,
        fecha_registro DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        observaciones TEXT NULL,

=======
        id_propiedad INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
        id_persona INT NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_final DATE NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0
        CONSTRAINT FK_Propiedad_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble) ON DELETE CASCADE,
        CONSTRAINT FK_Propiedad_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        CONSTRAINT CHK_Propiedad_Fechas CHECK (fecha_final IS NULL OR fecha_final >= fecha_inicio),
        CONSTRAINT CHK_Propiedad_Porcentaje CHECK (porcentaje_propiedad > 0 AND porcentaje_propiedad <= 100.00)
    );
<<<<<<< HEAD
    PRINT '✅ Tabla Propiedad_inmueble creada';
=======
>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0
END
ELSE
BEGIN
    -- Agregar columnas si no existen
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'es_propietario_actual' AND Object_ID = Object_ID(N'Propiedad_inmueble'))
    BEGIN
        ALTER TABLE Propiedad_inmueble ADD es_propietario_actual BIT NOT NULL DEFAULT 1;
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'porcentaje_propiedad' AND Object_ID = Object_ID(N'Propiedad_inmueble'))
    BEGIN
        ALTER TABLE Propiedad_inmueble ADD porcentaje_propiedad DECIMAL(5,2) NOT NULL DEFAULT 100.00;
        
        -- Agregar check constraint
        ALTER TABLE Propiedad_inmueble ADD CONSTRAINT CHK_Propiedad_Porcentaje 
        CHECK (porcentaje_propiedad > 0 AND porcentaje_propiedad <= 100.00);
    END
END
GO

-- Índices para Propiedad_inmueble
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PropiedadInmueble_Inmueble' AND object_id = OBJECT_ID('Propiedad_inmueble'))
    CREATE NONCLUSTERED INDEX IX_PropiedadInmueble_Inmueble ON Propiedad_inmueble(id_inmueble);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PropiedadInmueble_Persona' AND object_id = OBJECT_ID('Propiedad_inmueble'))
    CREATE NONCLUSTERED INDEX IX_PropiedadInmueble_Persona ON Propiedad_inmueble(id_persona);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PropiedadInmueble_Actual' AND object_id = OBJECT_ID('Propiedad_inmueble'))
    CREATE NONCLUSTERED INDEX IX_PropiedadInmueble_Actual ON Propiedad_inmueble(es_propietario_actual) WHERE es_propietario_actual = 1;
GO

-- =====================================================================================================================
-- PASO 6: TABLAS DE COMPRADORES Y ARRENDATARIOS (LÓGICA CORREGIDA)
-- =====================================================================================================================

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Compradores (SOLO DATOS DEL COMPRADOR - SIN VENTAS)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Compradores]') AND type = 'U')
BEGIN
    CREATE TABLE Compradores (
        id_comprador INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,
        registro_comprador VARCHAR(20) NOT NULL UNIQUE,
        fecha_registro_comprador DATE NOT NULL DEFAULT GETDATE(),
        tipo_comprador VARCHAR(50) NOT NULL CONSTRAINT DF_Compradores_TipoComprador DEFAULT 'Potencial' 
            CHECK (tipo_comprador IN ('Potencial', 'En Proceso', 'Finalizado')),
        ciudad_residencia VARCHAR(50) NULL,
        direccion_anterior VARCHAR(100) NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Proceso')),
        observaciones TEXT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_actualizacion DATETIME2(3) NULL,
        
        CONSTRAINT FK_Compradores_Persona FOREIGN KEY (id_persona) 
            REFERENCES Personas(id_persona) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Compradores creada exitosamente';
END
ELSE
BEGIN
    PRINT 'ℹ️ Tabla Compradores ya existe - actualizando estructura...';
    
    -- Eliminar columnas incorrectas si existen
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Compradores') AND name = 'id_inmueble')
        ALTER TABLE Compradores DROP COLUMN id_inmueble;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Compradores') AND name = 'id_venta')
        ALTER TABLE Compradores DROP COLUMN id_venta;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Compradores') AND name = 'fecha_compra')
        ALTER TABLE Compradores DROP COLUMN fecha_compra;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Compradores') AND name = 'valor_compra')
        ALTER TABLE Compradores DROP COLUMN valor_compra;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Compradores') AND name = 'tipo_compra')
        ALTER TABLE Compradores DROP COLUMN tipo_compra;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Compradores') AND name = 'entidad_financiera')
        ALTER TABLE Compradores DROP COLUMN entidad_financiera;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Compradores') AND name = 'numero_credito')
        ALTER TABLE Compradores DROP COLUMN numero_credito;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Compradores') AND name = 'monto_financiado')
        ALTER TABLE Compradores DROP COLUMN monto_financiado;

    -- Agregar tipo_comprador si no existe
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Compradores') AND name = 'tipo_comprador')
    BEGIN
        ALTER TABLE Compradores ADD tipo_comprador VARCHAR(50) NOT NULL 
        CONSTRAINT DF_Compradores_TipoComprador DEFAULT 'Potencial'
        CONSTRAINT CHK_Compradores_TipoComprador CHECK (tipo_comprador IN ('Potencial', 'En Proceso', 'Finalizado'));
    END

    PRINT '✅ Estructura de Compradores actualizada';
END
GO

-- Índices optimizados para Compradores
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Compradores_Persona' AND object_id = OBJECT_ID('Compradores'))
    CREATE NONCLUSTERED INDEX IX_Compradores_Persona ON Compradores(id_persona);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Compradores_Estado' AND object_id = OBJECT_ID('Compradores'))
    CREATE NONCLUSTERED INDEX IX_Compradores_Estado ON Compradores(estado) WHERE estado = 'Activo';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Compradores_Registro' AND object_id = OBJECT_ID('Compradores'))
    CREATE UNIQUE NONCLUSTERED INDEX IX_Compradores_Registro ON Compradores(registro_comprador);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Compradores_TipoComprador' AND object_id = OBJECT_ID('Compradores'))
    CREATE NONCLUSTERED INDEX IX_Compradores_TipoComprador ON Compradores(tipo_comprador);

PRINT '✅ Índices para Compradores creados';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Arrendatarios (SOLO DATOS DEL ARRENDATARIO - SIN CONTRATOS)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Arrendatarios]') AND type = 'U')
BEGIN
    CREATE TABLE Arrendatarios (
        id_arrendatario INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,
        registro_arrendatario VARCHAR(20) NOT NULL UNIQUE,
        fecha_registro_arrendatario DATE NOT NULL DEFAULT GETDATE(),
        tipo_arrendatario VARCHAR(50) NOT NULL CONSTRAINT DF_Arrendatarios_TipoArrendatario DEFAULT 'Potencial' 
            CHECK (tipo_arrendatario IN ('Potencial', 'En Proceso', 'Activo', 'Inactivo')),
        ciudad_residencia VARCHAR(50) NULL,
        direccion_anterior VARCHAR(100) NULL,
        contacto_emergencia_nombre VARCHAR(100) NULL,
        contacto_emergencia_telefono VARCHAR(20) NULL,
        contacto_emergencia_parentesco VARCHAR(50) NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Moroso', 'Proceso')),
        observaciones TEXT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_actualizacion DATETIME2(3) NULL,
        
        CONSTRAINT FK_Arrendatarios_Persona FOREIGN KEY (id_persona) 
            REFERENCES Personas(id_persona) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Arrendatarios creada';
END
ELSE
BEGIN
    PRINT 'ℹ️ Tabla Arrendatarios ya existe - actualizando estructura...';
    
    -- Eliminar columnas incorrectas si existen
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendatarios') AND name = 'id_inmueble')
        ALTER TABLE Arrendatarios DROP COLUMN id_inmueble;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendatarios') AND name = 'id_arrendamiento')
        ALTER TABLE Arrendatarios DROP COLUMN id_arrendamiento;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendatarios') AND name = 'fecha_inicio_arrendamiento')
        ALTER TABLE Arrendatarios DROP COLUMN fecha_inicio_arrendamiento;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendatarios') AND name = 'fecha_fin_arrendamiento')
        ALTER TABLE Arrendatarios DROP COLUMN fecha_fin_arrendamiento;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendatarios') AND name = 'valor_arriendo_mensual')
        ALTER TABLE Arrendatarios DROP COLUMN valor_arriendo_mensual;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendatarios') AND name = 'tipo_garantia')
        ALTER TABLE Arrendatarios DROP COLUMN tipo_garantia;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendatarios') AND name = 'valor_garantia')
        ALTER TABLE Arrendatarios DROP COLUMN valor_garantia;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendatarios') AND name = 'descripcion_garantia')
        ALTER TABLE Arrendatarios DROP COLUMN descripcion_garantia;

    -- Agregar tipo_arrendatario si no existe
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendatarios') AND name = 'tipo_arrendatario')
    BEGIN
        ALTER TABLE Arrendatarios ADD tipo_arrendatario VARCHAR(50) NOT NULL 
        CONSTRAINT DF_Arrendatarios_TipoArrendatario DEFAULT 'Potencial'
        CONSTRAINT CHK_Arrendatarios_TipoArrendatario CHECK (tipo_arrendatario IN ('Potencial', 'En Proceso', 'Activo', 'Inactivo'));
    END

    PRINT '✅ Estructura de Arrendatarios actualizada';
END
GO

-- Índices para Arrendatarios
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Arrendatarios_Persona' AND object_id = OBJECT_ID('Arrendatarios'))
    CREATE NONCLUSTERED INDEX IX_Arrendatarios_Persona ON Arrendatarios(id_persona);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Arrendatarios_Estado' AND object_id = OBJECT_ID('Arrendatarios'))
    CREATE NONCLUSTERED INDEX IX_Arrendatarios_Estado ON Arrendatarios(estado) WHERE estado = 'Activo';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Arrendatarios_Registro' AND object_id = OBJECT_ID('Arrendatarios'))
    CREATE UNIQUE NONCLUSTERED INDEX IX_Arrendatarios_Registro ON Arrendatarios(registro_arrendatario);

PRINT '✅ Índices para Arrendatarios creados';
GO

-- =====================================================================================================================
-- PASO 7: TABLAS DE VENTAS Y ARRENDAMIENTOS (CON LÓGICA CORREGIDA)
-- =====================================================================================================================

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Ventas (RELACIONA COMPRADOR + INMUEBLE)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Ventas]') AND type = 'U')
BEGIN
    CREATE TABLE Ventas (
        id_venta INT PRIMARY KEY IDENTITY(1,1),
        id_comprador INT NOT NULL,
        id_inmueble INT NOT NULL,
        fecha_venta DATE NOT NULL,
        valor_venta DECIMAL(15,2) NOT NULL,
        medio_pago VARCHAR(50) NOT NULL CHECK (medio_pago IN ('efectivo', 'transferencia', 'credito', 'mixto')),
        tipo_compra VARCHAR(50) NOT NULL CONSTRAINT DF_Ventas_TipoCompra DEFAULT 'Directa'
            CHECK (tipo_compra IN ('Directa', 'Financiada', 'Mixta')),
        entidad_financiera VARCHAR(100) NULL,
        numero_credito VARCHAR(50) NULL,
        monto_financiado DECIMAL(15,2) NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Cancelada', 'Finalizada')),
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_Ventas_Comprador FOREIGN KEY (id_comprador) REFERENCES Compradores(id_comprador),
        CONSTRAINT FK_Ventas_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble),
        CONSTRAINT CHK_Ventas_Valor CHECK (valor_venta > 0),
        CONSTRAINT CHK_Ventas_Fecha CHECK (fecha_venta <= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Ventas creada';
END
ELSE
BEGIN
    PRINT 'ℹ️ Tabla Ventas ya existe - actualizando estructura...';
    
    -- Eliminar id_persona si existe (ahora usamos id_comprador)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Ventas') AND name = 'id_persona')
        ALTER TABLE Ventas DROP COLUMN id_persona;

    -- Agregar id_comprador si no existe
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Ventas') AND name = 'id_comprador')
    BEGIN
        ALTER TABLE Ventas ADD id_comprador INT NULL;
        PRINT '✅ Columna id_comprador agregada a Ventas';
    END

    -- Agregar campos de financiación si no existen
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Ventas') AND name = 'tipo_compra')
    BEGIN
        ALTER TABLE Ventas ADD tipo_compra VARCHAR(50) NULL 
        CONSTRAINT DF_Ventas_TipoCompra DEFAULT 'Directa'
        CONSTRAINT CHK_Ventas_TipoCompra CHECK (tipo_compra IN ('Directa', 'Financiada', 'Mixta'));
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Ventas') AND name = 'entidad_financiera')
        ALTER TABLE Ventas ADD entidad_financiera VARCHAR(100) NULL;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Ventas') AND name = 'numero_credito')
        ALTER TABLE Ventas ADD numero_credito VARCHAR(50) NULL;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Ventas') AND name = 'monto_financiado')
        ALTER TABLE Ventas ADD monto_financiado DECIMAL(15,2) NULL;

    -- Agregar FK si no existe
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Ventas_Comprador')
    BEGIN
        ALTER TABLE Ventas 
        ADD CONSTRAINT FK_Ventas_Comprador FOREIGN KEY (id_comprador) 
        REFERENCES Compradores(id_comprador);
    END

    PRINT '✅ Estructura de Ventas actualizada';
END
GO

-- Índices para Ventas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Ventas_Comprador' AND object_id = OBJECT_ID('Ventas'))
    CREATE NONCLUSTERED INDEX IX_Ventas_Comprador ON Ventas(id_comprador);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Ventas_Inmueble' AND object_id = OBJECT_ID('Ventas'))
    CREATE NONCLUSTERED INDEX IX_Ventas_Inmueble ON Ventas(id_inmueble);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Ventas_Fecha' AND object_id = OBJECT_ID('Ventas'))
    CREATE NONCLUSTERED INDEX IX_Ventas_Fecha ON Ventas(fecha_venta DESC);

PRINT '✅ Índices para Ventas creados';
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Arrendamientos (RELACIONA ARRENDATARIO + INMUEBLE)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Arrendamientos]') AND type = 'U')
BEGIN
    CREATE TABLE Arrendamientos (
        id_arrendamiento INT PRIMARY KEY IDENTITY(1,1),
        id_arrendatario INT NOT NULL,
        id_inmueble INT NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_finalizacion DATE NOT NULL,
        valor_mensual DECIMAL(15,2) NOT NULL,
        tipo_garantia VARCHAR(50) NULL CHECK (tipo_garantia IN ('Deposito', 'Fiador', 'Seguro', 'Mixta')),
        valor_garantia DECIMAL(15,2) NULL,
        descripcion_garantia VARCHAR(200) NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Al día', 'Pendiente', 'Recuperación', 'Finalizado', 'Cancelado')),
        duracion_meses AS DATEDIFF(MONTH, fecha_inicio, fecha_finalizacion),
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_Arrendamientos_Arrendatario FOREIGN KEY (id_arrendatario) REFERENCES Arrendatarios(id_arrendatario),
        CONSTRAINT FK_Arrendamientos_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble),
        CONSTRAINT CHK_Arrendamientos_Valor CHECK (valor_mensual > 0),
        CONSTRAINT CHK_Arrendamientos_Fechas CHECK (fecha_finalizacion > fecha_inicio),
        CONSTRAINT CHK_Arrendamientos_Duracion CHECK (DATEDIFF(MONTH, fecha_inicio, fecha_finalizacion) >= 1)
    );
    PRINT '✅ Tabla Arrendamientos creada';
END
ELSE
BEGIN
    PRINT 'ℹ️ Tabla Arrendamientos ya existe - actualizando estructura...';
    
    -- Eliminar id_cliente si existe (ahora usamos id_arrendatario)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendamientos') AND name = 'id_cliente')
        ALTER TABLE Arrendamientos DROP COLUMN id_cliente;

    -- Agregar id_arrendatario si no existe
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendamientos') AND name = 'id_arrendatario')
    BEGIN
        ALTER TABLE Arrendamientos ADD id_arrendatario INT NULL;
    END

    -- Agregar campos de garantía si no existen
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendamientos') AND name = 'tipo_garantia')
    BEGIN
        ALTER TABLE Arrendamientos ADD tipo_garantia VARCHAR(50) NULL 
        CONSTRAINT CHK_Arrendamientos_TipoGarantia CHECK (tipo_garantia IN ('Deposito', 'Fiador', 'Seguro', 'Mixta'));
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendamientos') AND name = 'valor_garantia')
        ALTER TABLE Arrendamientos ADD valor_garantia DECIMAL(15,2) NULL;

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Arrendamientos') AND name = 'descripcion_garantia')
        ALTER TABLE Arrendamientos ADD descripcion_garantia VARCHAR(200) NULL;

    -- Agregar FK si no existe
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Arrendamientos_Arrendatario')
    BEGIN
        ALTER TABLE Arrendamientos 
        ADD CONSTRAINT FK_Arrendamientos_Arrendatario FOREIGN KEY (id_arrendatario) 
        REFERENCES Arrendatarios(id_arrendatario);
    END

    PRINT '✅ Estructura de Arrendamientos actualizada';
END
GO

-- Índices para Arrendamientos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Arrendamientos_Arrendatario' AND object_id = OBJECT_ID('Arrendamientos'))
    CREATE NONCLUSTERED INDEX IX_Arrendamientos_Arrendatario ON Arrendamientos(id_arrendatario);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Arrendamientos_Inmueble' AND object_id = OBJECT_ID('Arrendamientos'))
    CREATE NONCLUSTERED INDEX IX_Arrendamientos_Inmueble ON Arrendamientos(id_inmueble);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Arrendamientos_Estado' AND object_id = OBJECT_ID('Arrendamientos'))
    CREATE NONCLUSTERED INDEX IX_Arrendamientos_Estado ON Arrendamientos(estado) WHERE estado IN ('Activo', 'Pendiente');

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Arrendamientos_Fechas' AND object_id = OBJECT_ID('Arrendamientos'))
    CREATE NONCLUSTERED INDEX IX_Arrendamientos_Fechas ON Arrendamientos(fecha_inicio, fecha_finalizacion);

PRINT '✅ Índices para Arrendamientos creados';
GO

-- =====================================================================================================================
-- PASO 8: TABLAS ADICIONALES DEL SISTEMA
-- =====================================================================================================================

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Estados_venta
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Estados_venta]') AND type = 'U')
BEGIN
    CREATE TABLE Estados_venta (
        id_estado_venta INT PRIMARY KEY IDENTITY(1,1),
        nombre_estado VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(200) NULL,
        orden INT NOT NULL,
        es_estado_final BIT NOT NULL DEFAULT 0,
        estado BIT NOT NULL DEFAULT 1
    );
    PRINT '✅ Tabla Estados_venta creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Seguimiento_venta
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Seguimiento_venta]') AND type = 'U')
BEGIN
    CREATE TABLE Seguimiento_venta (
        id_seguimiento_venta INT PRIMARY KEY IDENTITY(1,1),
        id_venta INT NOT NULL,
        id_estado_venta INT NOT NULL,
        id_persona INT NOT NULL,
        fecha_estado_seguimiento DATE NOT NULL,
        descripcion TEXT NOT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_SeguimientoVenta_Venta FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta) ON DELETE CASCADE,
        CONSTRAINT FK_SeguimientoVenta_Estado FOREIGN KEY (id_estado_venta) REFERENCES Estados_venta(id_estado_venta),
        CONSTRAINT FK_SeguimientoVenta_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        CONSTRAINT CHK_SeguimientoVenta_Fecha CHECK (fecha_estado_seguimiento <= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Seguimiento_venta creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Cobros
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cobros]') AND type = 'U')
BEGIN
    CREATE TABLE Cobros (
        id_cobro INT PRIMARY KEY IDENTITY(1,1),
        id_arrendamiento INT NOT NULL,
        fecha_cobro DATE NOT NULL,
        fecha_limite DATE NOT NULL,
        valor_pago DECIMAL(15,2) NOT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagado', 'Vencido', 'Cancelado')),
        fecha_estado DATE NULL,
        fecha_pago DATE NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_Cobros_Arrendamiento FOREIGN KEY (id_arrendamiento) REFERENCES Arrendamientos(id_arrendamiento) ON DELETE CASCADE,
        CONSTRAINT CHK_Cobros_Valor CHECK (valor_pago > 0),
        CONSTRAINT CHK_Cobros_Fechas CHECK (fecha_limite >= fecha_cobro),
        CONSTRAINT CHK_Cobros_FechaPago CHECK (fecha_pago IS NULL OR fecha_pago >= fecha_cobro)
    );
    PRINT '✅ Tabla Cobros creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Comprobantes_pago
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Comprobantes_pago]') AND type = 'U')
BEGIN
    CREATE TABLE Comprobantes_pago (
        id_comprobante INT PRIMARY KEY IDENTITY(1,1),
        id_cobro INT NOT NULL,
        url_comprobante VARCHAR(500) NOT NULL,
        entidad_bancaria VARCHAR(100) NOT NULL,
        referencia_bancaria VARCHAR(100) NOT NULL,
        monto_pagado DECIMAL(15,2) NOT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmado', 'Negado', 'En revisión')),
        fecha_pago DATE NOT NULL,
        fecha_revision DATE NULL,
        observaciones TEXT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_Comprobantes_Cobro FOREIGN KEY (id_cobro) REFERENCES Cobros(id_cobro) ON DELETE CASCADE,
        CONSTRAINT CHK_Comprobantes_Monto CHECK (monto_pagado > 0),
        CONSTRAINT CHK_Comprobantes_Fecha CHECK (fecha_pago <= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Comprobantes_pago creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Servicios_cita
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Servicios_cita]') AND type = 'U')
BEGIN
    CREATE TABLE Servicios_cita (
        id_servicio INT PRIMARY KEY IDENTITY(1,1),
        nombre_servicio VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT NULL,
        duracion_estimada INT NOT NULL DEFAULT 45,
        estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT CHK_ServicioCita_Duracion CHECK (duracion_estimada > 0 AND duracion_estimada <= 480)
    );
    PRINT '✅ Tabla Servicios_cita creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Estados_cita
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Estados_cita]') AND type = 'U')
BEGIN
    CREATE TABLE Estados_cita (
        id_estado_cita INT PRIMARY KEY IDENTITY(1,1),
        nombre_estado VARCHAR(50) NOT NULL UNIQUE,
        orden INT NOT NULL,
        descripcion VARCHAR(200) NULL,
        es_estado_final BIT NOT NULL DEFAULT 0,
        estado BIT NOT NULL DEFAULT 1
    );
    PRINT '✅ Tabla Estados_cita creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Citas
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Citas]') AND type = 'U')
BEGIN
    CREATE TABLE Citas (
        id_cita INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL,
        id_inmueble INT NOT NULL,
        id_servicio INT NOT NULL,
        id_usuario_creador INT NULL,
        fecha_cita DATE NOT NULL,
        hora_inicio TIME(0) NOT NULL,
        hora_fin TIME(0) NOT NULL,
        id_estado_cita INT NOT NULL DEFAULT 1,
        id_agente_asignado INT NULL,
        observaciones TEXT NULL,
        motivo_cancelacion VARCHAR(500) NULL,
        es_reagendada BIT NOT NULL DEFAULT 0,
        id_cita_original INT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_confirmacion DATETIME2(3) NULL,
        fecha_cancelacion DATETIME2(3) NULL,
        fecha_completada DATETIME2(3) NULL,
        fecha_actualizacion DATETIME2(3) NULL,

        CONSTRAINT FK_Citas_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Citas_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble) ON DELETE CASCADE,
        CONSTRAINT FK_Citas_Servicio FOREIGN KEY (id_servicio) REFERENCES Servicios_cita(id_servicio),
        CONSTRAINT FK_Citas_Estado FOREIGN KEY (id_estado_cita) REFERENCES Estados_cita(id_estado_cita),
        CONSTRAINT FK_Citas_Agente FOREIGN KEY (id_agente_asignado) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Citas_Creador FOREIGN KEY (id_usuario_creador) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Citas_CitaOriginal FOREIGN KEY (id_cita_original) REFERENCES Citas(id_cita),
        CONSTRAINT CHK_Citas_HoraValida CHECK (hora_fin > hora_inicio),
        CONSTRAINT CHK_Citas_FechaFuturo CHECK (fecha_cita >= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Citas creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Notificaciones
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND type = 'U')
BEGIN
    CREATE TABLE Notificaciones (
        id_notificacion INT PRIMARY KEY IDENTITY(1,1),
        tipo_notificacion VARCHAR(50) NOT NULL CHECK (tipo_notificacion IN ('CITA_SOLICITADA', 'CITA_CANCELADA', 'CITA_REAGENDADA', 'CITA_CONFIRMADA', 'CITA_COMPLETADA', 'SISTEMA', 'ALERTA')),
        titulo VARCHAR(200) NOT NULL,
        mensaje TEXT NOT NULL,
        id_cita INT NULL,
        id_rol_destino INT NULL,
        id_persona_destino INT NULL,
        leida BIT NOT NULL DEFAULT 0,
        fecha_leida DATETIME2(3) NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Notificaciones_Cita FOREIGN KEY (id_cita) REFERENCES Citas(id_cita) ON DELETE CASCADE,
        CONSTRAINT FK_Notificaciones_Rol FOREIGN KEY (id_rol_destino) REFERENCES Roles(id_rol),
        CONSTRAINT FK_Notificaciones_Persona FOREIGN KEY (id_persona_destino) REFERENCES Personas(id_persona),
        CONSTRAINT CHK_Notificaciones_Destino CHECK (id_rol_destino IS NOT NULL OR id_persona_destino IS NOT NULL)
    );
    PRINT '✅ Tabla Notificaciones creada';
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Reportes
-- ---------------------------------------------------------------------------------------------------------------------
<<<<<<< HEAD
=======
-- MÓDULO DE REPORTES Y DEPENDENCIAS

-- ================= Tabla principal: Reportes =================
>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reportes]') AND type = 'U')
BEGIN
    CREATE TABLE Reportes (
        id_reporte INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
<<<<<<< HEAD
<<<<<<< HEAD

        -- Tipo y contenido
        tipo_reporte VARCHAR(50) NOT NULL,                  -- Mantenimiento, Daño, Queja, Sugerencia
=======
        tipo_reporte VARCHAR(50) NOT NULL,
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT NOT NULL,
        prioridad VARCHAR(20) NOT NULL DEFAULT 'Media' CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
        estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Resuelto', 'Cerrado')),
        id_persona_reporta INT NOT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_resolucion DATETIME2(3) NULL,
        observaciones_resolucion TEXT NULL,

        CONSTRAINT FK_Reportes_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble) ON DELETE CASCADE,
        CONSTRAINT FK_Reportes_Persona FOREIGN KEY (id_persona_reporta) REFERENCES Personas(id_persona)
    );
    PRINT '✅ Tabla Reportes creada';
END
GO

-- =====================================================================================================================
-- PASO 9: ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================================================================================

PRINT '🔧 Creando índices adicionales para optimización...';

-- Índices para Seguimiento_venta
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SeguimientoVenta_Venta' AND object_id = OBJECT_ID('Seguimiento_venta'))
    CREATE NONCLUSTERED INDEX IX_SeguimientoVenta_Venta ON Seguimiento_venta(id_venta);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_SeguimientoVenta_Fecha' AND object_id = OBJECT_ID('Seguimiento_venta'))
    CREATE NONCLUSTERED INDEX IX_SeguimientoVenta_Fecha ON Seguimiento_venta(fecha_estado_seguimiento DESC);

-- Índices para Cobros
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Cobros_Arrendamiento' AND object_id = OBJECT_ID('Cobros'))
    CREATE NONCLUSTERED INDEX IX_Cobros_Arrendamiento ON Cobros(id_arrendamiento);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Cobros_Estado' AND object_id = OBJECT_ID('Cobros'))
    CREATE NONCLUSTERED INDEX IX_Cobros_Estado ON Cobros(estado) WHERE estado IN ('Pendiente', 'Vencido');

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Cobros_Fechas' AND object_id = OBJECT_ID('Cobros'))
    CREATE NONCLUSTERED INDEX IX_Cobros_Fechas ON Cobros(fecha_cobro, fecha_limite);

-- Índices para Comprobantes_pago
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Comprobantes_Cobro' AND object_id = OBJECT_ID('Comprobantes_pago'))
    CREATE NONCLUSTERED INDEX IX_Comprobantes_Cobro ON Comprobantes_pago(id_cobro);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Comprobantes_Estado' AND object_id = OBJECT_ID('Comprobantes_pago'))
    CREATE NONCLUSTERED INDEX IX_Comprobantes_Estado ON Comprobantes_pago(estado) WHERE estado IN ('Pendiente', 'En revisión');

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Comprobantes_Referencia' AND object_id = OBJECT_ID('Comprobantes_pago'))
    CREATE NONCLUSTERED INDEX IX_Comprobantes_Referencia ON Comprobantes_pago(referencia_bancaria, entidad_bancaria);

-- Índices para Citas
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Citas_Estado' AND object_id = OBJECT_ID('Citas'))
    CREATE NONCLUSTERED INDEX IX_Citas_Estado ON Citas(id_estado_cita, fecha_cita, hora_inicio);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Citas_Agente' AND object_id = OBJECT_ID('Citas'))
    CREATE NONCLUSTERED INDEX IX_Citas_Agente ON Citas(id_agente_asignado) WHERE id_agente_asignado IS NOT NULL;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Citas_Fecha' AND object_id = OBJECT_ID('Citas'))
    CREATE NONCLUSTERED INDEX IX_Citas_Fecha ON Citas(fecha_cita, hora_inicio);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Citas_Persona' AND object_id = OBJECT_ID('Citas'))
    CREATE NONCLUSTERED INDEX IX_Citas_Persona ON Citas(id_persona);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Citas_ConflictoHorario' AND object_id = OBJECT_ID('Citas'))
    CREATE NONCLUSTERED INDEX IX_Citas_ConflictoHorario ON Citas(id_inmueble, fecha_cita, hora_inicio, hora_fin) INCLUDE (id_estado_cita);

-- Índices para Notificaciones
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notificaciones_NoLeidas' AND object_id = OBJECT_ID('Notificaciones'))
    CREATE NONCLUSTERED INDEX IX_Notificaciones_NoLeidas ON Notificaciones(leida, fecha_creacion DESC) WHERE leida = 0;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notificaciones_Rol' AND object_id = OBJECT_ID('Notificaciones'))
    CREATE NONCLUSTERED INDEX IX_Notificaciones_Rol ON Notificaciones(id_rol_destino) WHERE id_rol_destino IS NOT NULL;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notificaciones_Persona' AND object_id = OBJECT_ID('Notificaciones'))
    CREATE NONCLUSTERED INDEX IX_Notificaciones_Persona ON Notificaciones(id_persona_destino) WHERE id_persona_destino IS NOT NULL;

-- Índices para Reportes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reportes_Estado' AND object_id = OBJECT_ID('Reportes'))
    CREATE NONCLUSTERED INDEX IX_Reportes_Estado ON Reportes(estado, fecha_creacion DESC);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reportes_Inmueble' AND object_id = OBJECT_ID('Reportes'))
    CREATE NONCLUSTERED INDEX IX_Reportes_Inmueble ON Reportes(id_inmueble);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Reportes_Prioridad' AND object_id = OBJECT_ID('Reportes'))
    CREATE NONCLUSTERED INDEX IX_Reportes_Prioridad ON Reportes(prioridad) WHERE estado != 'Cerrado';

PRINT '✅ Índices adicionales creados exitosamente';
GO

=======
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


>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0
-- =====================================================================================================================
-- PASO 10: VISTAS PRINCIPALES (ACTUALIZADAS CON NUEVA ESTRUCTURA)
-- =====================================================================================================================

PRINT '';
PRINT '🔧 Creando vistas principales...';

-- Vista: vw_Compradores_Principal
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_Compradores_Principal' AND type = 'V')
    DROP VIEW vw_Compradores_Principal;
GO

CREATE VIEW vw_Compradores_Principal AS
SELECT 
    -- Datos principales del comprador
    c.id_comprador,
    c.registro_comprador,
    c.tipo_comprador,
    
    -- Datos de la persona
    p.id_persona,
    p.nombre_completo,
    p.apellido_completo,
    p.tipo_documento,
    p.numero_documento,
    p.correo,
    p.telefono,
    
    -- Información adicional del comprador
    c.ciudad_residencia,
    c.direccion_anterior,
    c.estado as estado_comprador,
    c.observaciones,
    
    -- Información de ventas (si existen)
    (SELECT COUNT(*) FROM Ventas v WHERE v.id_comprador = c.id_comprador) as total_ventas,
    (
        SELECT TOP 1 
            v.fecha_venta,
            v.valor_venta,
            i.registro_inmobiliario,
            i.direccion as direccion_inmueble
        FROM Ventas v
        INNER JOIN Inmuebles i ON v.id_inmueble = i.id_inmueble
        WHERE v.id_comprador = c.id_comprador
        ORDER BY v.fecha_venta DESC
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    ) as ultima_venta_json,
    
    -- Campos de auditoría
    c.fecha_creacion,
    c.fecha_actualizacion,
    c.fecha_registro_comprador
    
FROM Compradores c
INNER JOIN Personas p ON c.id_persona = p.id_persona
WHERE c.estado = 'Activo';
GO

PRINT '✅ Vista vw_Compradores_Principal creada correctamente';

-- Vista: vw_Ventas_Completo
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_Ventas_Completo' AND type = 'V')
    DROP VIEW vw_Ventas_Completo;
GO

CREATE VIEW vw_Ventas_Completo AS
SELECT 
    v.id_venta,
    v.fecha_venta,
    v.valor_venta,
    v.tipo_compra,
    v.medio_pago,
    v.entidad_financiera,
    v.numero_credito,
    v.monto_financiado,
    v.estado as estado_venta,
    
    -- Datos del comprador
    c.id_comprador,
    c.registro_comprador,
    p.id_persona,
    p.tipo_documento,
    p.numero_documento,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) as nombre_comprador,
    p.correo as email_comprador,
    p.telefono as telefono_comprador,
    
    -- Datos del inmueble
    i.id_inmueble,
    i.registro_inmobiliario,
    i.titulo as titulo_inmueble,
    i.direccion as direccion_inmueble,
    i.ciudad as ciudad_inmueble,
    i.categoria as tipo_inmueble,
    
    v.fecha_creacion
FROM Ventas v
INNER JOIN Compradores c ON v.id_comprador = c.id_comprador
INNER JOIN Personas p ON c.id_persona = p.id_persona
INNER JOIN Inmuebles i ON v.id_inmueble = i.id_inmueble;
GO

PRINT '✅ Vista vw_Ventas_Completo creada';

-- Vista: vw_Arrendatarios_Completo
IF OBJECT_ID('dbo.vw_Arrendatarios_Completo', 'V') IS NOT NULL
    DROP VIEW dbo.vw_Arrendatarios_Completo;
GO

CREATE VIEW vw_Arrendatarios_Completo AS
SELECT 
    a.id_arrendatario,
    a.registro_arrendatario,
    a.tipo_arrendatario,
    a.estado AS estado_arrendatario,
    p.id_persona,
    p.tipo_documento,
    p.numero_documento,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) AS nombre_completo,
    p.correo,
    p.telefono,
    a.contacto_emergencia_nombre,
    a.contacto_emergencia_telefono,
    a.contacto_emergencia_parentesco,
    
    -- Información de arrendamientos (si existen)
    (SELECT COUNT(*) FROM Arrendamientos ar WHERE ar.id_arrendatario = a.id_arrendatario) as total_arrendamientos,
    (
        SELECT TOP 1 
            ar.fecha_inicio,
            ar.fecha_finalizacion,
            ar.valor_mensual,
            i.registro_inmobiliario,
            i.direccion as direccion_inmueble
        FROM Arrendamientos ar
        INNER JOIN Inmuebles i ON ar.id_inmueble = i.id_inmueble
        WHERE ar.id_arrendatario = a.id_arrendatario
        ORDER BY ar.fecha_inicio DESC
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    ) as ultimo_arrendamiento_json,
    
    a.fecha_creacion,
    a.fecha_actualizacion
FROM Arrendatarios a
INNER JOIN Personas p ON a.id_persona = p.id_persona
WHERE a.estado != 'Inactivo';
GO
PRINT '✅ Vista vw_Arrendatarios_Completo creada';

-- Vista: vw_Arrendamientos_Completo
IF OBJECT_ID('dbo.vw_Arrendamientos_Completo', 'V') IS NOT NULL
    DROP VIEW dbo.vw_Arrendamientos_Completo;
GO

CREATE VIEW vw_Arrendamientos_Completo AS
SELECT 
    ar.id_arrendamiento,
    ar.fecha_inicio,
    ar.fecha_finalizacion,
    ar.valor_mensual,
    ar.tipo_garantia,
    ar.valor_garantia,
    ar.descripcion_garantia,
    ar.estado as estado_arrendamiento,
    ar.duracion_meses,
    
    -- Datos del arrendatario
    a.id_arrendatario,
    a.registro_arrendatario,
    p.id_persona,
    p.tipo_documento,
    p.numero_documento,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) as nombre_arrendatario,
    p.correo as email_arrendatario,
    p.telefono as telefono_arrendatario,
    
    -- Datos del inmueble
    i.id_inmueble,
    i.registro_inmobiliario,
    i.titulo as titulo_inmueble,
    i.direccion as direccion_inmueble,
    i.ciudad as ciudad_inmueble,
    i.categoria as tipo_inmueble,
    
    ar.fecha_creacion
FROM Arrendamientos ar
INNER JOIN Arrendatarios a ON ar.id_arrendatario = a.id_arrendatario
INNER JOIN Personas p ON a.id_persona = p.id_persona
INNER JOIN Inmuebles i ON ar.id_inmueble = i.id_inmueble;
GO
PRINT '✅ Vista vw_Arrendamientos_Completo creada';

-- Vista: vw_Propietarios_Completo
IF OBJECT_ID('dbo.vw_Propietarios_Completo', 'V') IS NOT NULL
    DROP VIEW dbo.vw_Propietarios_Completo;
GO

CREATE VIEW dbo.vw_Propietarios_Completo AS
SELECT 
    prop.id_propietario,
    prop.registro_propietario AS registro,
    prop.estado,
    prop.ciudad_residencia AS ciudad,
    prop.direccion_residencia AS direccion,
    prop.fecha_registro_propietario AS fecha_registro,
    p.id_persona,
    p.tipo_documento,
    p.numero_documento AS documento,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) AS nombre,
    p.correo AS email,
    p.telefono,
    COUNT(DISTINCT pi.id_inmueble) AS cantidad_inmuebles,
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

-- Vista: vw_Inmuebles_Completo
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
    p.id_persona AS id_propietario,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) AS nombre_propietario,
    p.correo AS email_propietario,
    p.telefono AS telefono_propietario,
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
    (SELECT COUNT(*) FROM Fichas_Tecnicas ft WHERE ft.id_inmueble = i.id_inmueble) AS total_fichas,
    i.fecha_registro,
    i.fecha_actualizacion
FROM Inmuebles i
LEFT JOIN Propiedad_inmueble pi ON i.id_inmueble = pi.id_inmueble 
    AND pi.estado = 'Activo' 
    AND pi.es_propietario_actual = 1
LEFT JOIN Personas p ON pi.id_persona = p.id_persona
WHERE i.estado != 'Eliminado';
GO
PRINT '✅ Vista vw_Inmuebles_Completo creada';
GO

-- =====================================================================================================================
-- PASO 11: FUNCIONES Y PROCEDIMIENTOS ALMACENADOS (ACTUALIZADOS)
-- =====================================================================================================================

PRINT '';
PRINT '🔧 Creando funciones y procedimientos almacenados...';

-- Función: fn_EsAdministrativo
IF OBJECT_ID('dbo.fn_EsAdministrativo', 'FN') IS NOT NULL
    DROP FUNCTION dbo.fn_EsAdministrativo;
GO

CREATE FUNCTION dbo.fn_EsAdministrativo(@id_persona INT)
RETURNS BIT
AS
BEGIN
    DECLARE @resultado BIT = 0;
    IF EXISTS (SELECT 1 FROM Administrativos WHERE id_persona = @id_persona AND estado_laboral = 'Activo')
        SET @resultado = 1;
    RETURN @resultado;
END
GO
PRINT '✅ Función fn_EsAdministrativo creada';
GO

-- Función: fn_EsCompradorActivo
IF OBJECT_ID('dbo.fn_EsCompradorActivo', 'FN') IS NOT NULL
    DROP FUNCTION dbo.fn_EsCompradorActivo;
GO

CREATE FUNCTION fn_EsCompradorActivo(@id_persona INT)
RETURNS BIT
AS
BEGIN
    DECLARE @result BIT = 0;
    
    IF EXISTS (
        SELECT 1 
        FROM Compradores c
        INNER JOIN Personas p ON c.id_persona = p.id_persona
        WHERE p.id_persona = @id_persona AND c.estado = 'Activo'
    )
        SET @result = 1;
    
    RETURN @result;
END;
GO
PRINT '✅ Función fn_EsCompradorActivo creada correctamente';
GO

-- Procedimiento: sp_CrearCompradorCompleto
IF OBJECT_ID('dbo.sp_CrearCompradorCompleto', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CrearCompradorCompleto;
GO

CREATE PROCEDURE sp_CrearCompradorCompleto
    @id_persona INT,
    @tipo_comprador VARCHAR(50) = 'Potencial',
    @ciudad_residencia VARCHAR(50) = NULL,
    @direccion_anterior VARCHAR(100) = NULL,
    @observaciones TEXT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @registro_comprador VARCHAR(20);
        
        -- Verificar si ya existe como comprador
        IF EXISTS (SELECT 1 FROM Compradores WHERE id_persona = @id_persona)
        BEGIN
            RAISERROR('Esta persona ya está registrada como comprador', 16, 1);
            RETURN;
        END
        
        -- Verificar que la persona existe
        IF NOT EXISTS (SELECT 1 FROM Personas WHERE id_persona = @id_persona)
        BEGIN
            RAISERROR('La persona especificada no existe', 16, 1);
            RETURN;
        END

        -- Validar tipo de comprador
        IF @tipo_comprador NOT IN ('Potencial', 'En Proceso', 'Finalizado')
        BEGIN
            RAISERROR('El tipo de comprador especificado no es válido', 16, 1);
            RETURN;
        END
        
        -- Generar registro único
        DECLARE @contador INT;
        SELECT @contador = ISNULL(MAX(CAST(REPLACE(registro_comprador, 'COMP-', '') AS INT)), 0) + 1 
        FROM Compradores 
        WHERE registro_comprador LIKE 'COMP-%';
        
        SET @registro_comprador = 'COMP-' + RIGHT('000' + CAST(@contador AS VARCHAR(10)), 3);
        
        -- Insertar comprador
        INSERT INTO Compradores (
            id_persona, registro_comprador, tipo_comprador,
            ciudad_residencia, direccion_anterior, observaciones
        )
        VALUES (
            @id_persona, @registro_comprador, @tipo_comprador,
            @ciudad_residencia, @direccion_anterior, @observaciones
        );
        
        -- Asignar rol de comprador si no lo tiene
        IF NOT EXISTS (SELECT 1 FROM Personas_rol pr 
                      INNER JOIN Roles r ON pr.id_rol = r.id_rol 
                      WHERE pr.id_persona = @id_persona AND r.nombre_rol = 'Comprador')
        BEGIN
            DECLARE @id_rol_comprador INT = (SELECT id_rol FROM Roles WHERE nombre_rol = 'Comprador');
            IF @id_rol_comprador IS NOT NULL
            BEGIN
                INSERT INTO Personas_rol (id_persona, id_rol) VALUES (@id_persona, @id_rol_comprador);
            END
        END
        
        COMMIT TRANSACTION;
        
        SELECT SCOPE_IDENTITY() AS id_comprador, @registro_comprador AS registro_comprador;
        
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
PRINT '✅ Procedimiento sp_CrearCompradorCompleto creado';

-- Procedimiento: sp_CrearVentaCompleta
IF OBJECT_ID('dbo.sp_CrearVentaCompleta', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CrearVentaCompleta;
GO

CREATE PROCEDURE sp_CrearVentaCompleta
    @id_comprador INT,
    @id_inmueble INT,
    @fecha_venta DATE,
    @valor_venta DECIMAL(15,2),
    @medio_pago VARCHAR(50) = 'efectivo',
    @tipo_compra VARCHAR(50) = 'Directa',
    @entidad_financiera VARCHAR(100) = NULL,
    @numero_credito VARCHAR(50) = NULL,
    @monto_financiado DECIMAL(15,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Validaciones
        IF NOT EXISTS (SELECT 1 FROM Compradores WHERE id_comprador = @id_comprador AND estado = 'Activo')
        BEGIN
            RAISERROR('El comprador especificado no existe o no está activo', 16, 1);
            RETURN;
        END
        
        IF NOT EXISTS (SELECT 1 FROM Inmuebles WHERE id_inmueble = @id_inmueble)
        BEGIN
            RAISERROR('El inmueble especificado no existe', 16, 1);
            RETURN;
        END

        IF @valor_venta <= 0
        BEGIN
            RAISERROR('El valor de venta debe ser mayor a cero', 16, 1);
            RETURN;
        END

        IF @fecha_venta > CAST(GETDATE() AS DATE)
        BEGIN
            RAISERROR('La fecha de venta no puede ser futura', 16, 1);
            RETURN;
        END

        IF @tipo_compra NOT IN ('Directa', 'Financiada', 'Mixta')
        BEGIN
            RAISERROR('El tipo de compra especificado no es válido', 16, 1);
            RETURN;
        END
        
        -- Insertar venta
        INSERT INTO Ventas (
            id_comprador, id_inmueble, fecha_venta, valor_venta,
            medio_pago, tipo_compra, entidad_financiera,
            numero_credito, monto_financiado, estado
        )
        VALUES (
            @id_comprador, @id_inmueble, @fecha_venta, @valor_venta,
            @medio_pago, @tipo_compra, @entidad_financiera,
            @numero_credito, @monto_financiado, 'Activa'
        );
        
        -- Actualizar estado del comprador
        UPDATE Compradores 
        SET tipo_comprador = 'Finalizado',
            fecha_actualizacion = GETDATE()
        WHERE id_comprador = @id_comprador;
        
        -- Actualizar estado del inmueble
        UPDATE Inmuebles 
        SET estado_frontend = 'Vendido',
            estado = 'Vendido',
            fecha_actualizacion = GETDATE()
        WHERE id_inmueble = @id_inmueble;
        
        COMMIT TRANSACTION;
        
        SELECT SCOPE_IDENTITY() AS id_venta;
        
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
PRINT '✅ Procedimiento sp_CrearVentaCompleta creado';

-- Procedimiento: sp_CrearArrendatarioCompleto
IF OBJECT_ID('dbo.sp_CrearArrendatarioCompleto', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CrearArrendatarioCompleto;
GO

CREATE PROCEDURE sp_CrearArrendatarioCompleto
    @id_persona INT,
    @tipo_arrendatario VARCHAR(50) = 'Potencial',
    @ciudad_residencia VARCHAR(50) = NULL,
    @direccion_anterior VARCHAR(100) = NULL,
    @contacto_emergencia_nombre VARCHAR(100) = NULL,
    @contacto_emergencia_telefono VARCHAR(20) = NULL,
    @contacto_emergencia_parentesco VARCHAR(50) = NULL,
    @observaciones TEXT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @registro_arrendatario VARCHAR(20);
        
        IF EXISTS (SELECT 1 FROM Arrendatarios WHERE id_persona = @id_persona)
        BEGIN
            RAISERROR('Esta persona ya está registrada como arrendatario', 16, 1);
            RETURN;
        END
        
        IF NOT EXISTS (SELECT 1 FROM Personas WHERE id_persona = @id_persona)
        BEGIN
            RAISERROR('La persona especificada no existe', 16, 1);
            RETURN;
        END
        
        -- Generar registro único
        DECLARE @contador_arr INT;
        SELECT @contador_arr = ISNULL(MAX(CAST(REPLACE(registro_arrendatario, 'ARREN-', '') AS INT)), 0) + 1 
        FROM Arrendatarios 
        WHERE registro_arrendatario LIKE 'ARREN-%';
        
        SET @registro_arrendatario = 'ARREN-' + RIGHT('000' + CAST(@contador_arr AS VARCHAR(10)), 3);
        
        INSERT INTO Arrendatarios (
            id_persona, registro_arrendatario, tipo_arrendatario,
            ciudad_residencia, direccion_anterior,
            contacto_emergencia_nombre, contacto_emergencia_telefono, contacto_emergencia_parentesco,
            observaciones
        )
        VALUES (
            @id_persona, @registro_arrendatario, @tipo_arrendatario,
            @ciudad_residencia, @direccion_anterior,
            @contacto_emergencia_nombre, @contacto_emergencia_telefono, @contacto_emergencia_parentesco,
            @observaciones
        );
        
        -- Asignar rol de arrendatario si no lo tiene
        IF NOT EXISTS (SELECT 1 FROM Personas_rol pr 
                      INNER JOIN Roles r ON pr.id_rol = r.id_rol 
                      WHERE pr.id_persona = @id_persona AND r.nombre_rol = 'Arrendatario')
        BEGIN
            DECLARE @id_rol_arrendatario INT = (SELECT id_rol FROM Roles WHERE nombre_rol = 'Arrendatario');
            IF @id_rol_arrendatario IS NOT NULL
            BEGIN
                INSERT INTO Personas_rol (id_persona, id_rol) VALUES (@id_persona, @id_rol_arrendatario);
            END
        END
        
        COMMIT TRANSACTION;
        
        SELECT SCOPE_IDENTITY() AS id_arrendatario, @registro_arrendatario AS registro_arrendatario;
        
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
PRINT '✅ Procedimiento sp_CrearArrendatarioCompleto creado';

-- Procedimiento: sp_CrearArrendamientoCompleto
IF OBJECT_ID('dbo.sp_CrearArrendamientoCompleto', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_CrearArrendamientoCompleto;
GO

CREATE PROCEDURE sp_CrearArrendamientoCompleto
    @id_arrendatario INT,
    @id_inmueble INT,
    @fecha_inicio DATE,
    @fecha_finalizacion DATE,
    @valor_mensual DECIMAL(15,2),
    @tipo_garantia VARCHAR(50) = NULL,
    @valor_garantia DECIMAL(15,2) = NULL,
    @descripcion_garantia VARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Validaciones
        IF NOT EXISTS (SELECT 1 FROM Arrendatarios WHERE id_arrendatario = @id_arrendatario AND estado = 'Activo')
        BEGIN
            RAISERROR('El arrendatario especificado no existe o no está activo', 16, 1);
            RETURN;
        END
        
        IF NOT EXISTS (SELECT 1 FROM Inmuebles WHERE id_inmueble = @id_inmueble)
        BEGIN
            RAISERROR('El inmueble especificado no existe', 16, 1);
            RETURN;
        END

        IF @valor_mensual <= 0
        BEGIN
            RAISERROR('El valor mensual debe ser mayor a cero', 16, 1);
            RETURN;
        END

        IF @fecha_finalizacion <= @fecha_inicio
        BEGIN
            RAISERROR('La fecha de finalización debe ser posterior a la fecha de inicio', 16, 1);
            RETURN;
        END

        IF @tipo_garantia IS NOT NULL AND @tipo_garantia NOT IN ('Deposito', 'Fiador', 'Seguro', 'Mixta')
        BEGIN
            RAISERROR('El tipo de garantía especificado no es válido', 16, 1);
            RETURN;
        END
        
        -- Insertar arrendamiento
        INSERT INTO Arrendamientos (
            id_arrendatario, id_inmueble, fecha_inicio, fecha_finalizacion,
            valor_mensual, tipo_garantia, valor_garantia, descripcion_garantia
        )
        VALUES (
            @id_arrendatario, @id_inmueble, @fecha_inicio, @fecha_finalizacion,
            @valor_mensual, @tipo_garantia, @valor_garantia, @descripcion_garantia
        );
        
        -- Actualizar estado del arrendatario
        UPDATE Arrendatarios 
        SET tipo_arrendatario = 'Activo',
            fecha_actualizacion = GETDATE()
        WHERE id_arrendatario = @id_arrendatario;
        
        -- Actualizar estado del inmueble
        UPDATE Inmuebles 
        SET estado_frontend = 'Arrendado',
            estado = 'Arrendado',
            fecha_actualizacion = GETDATE()
        WHERE id_inmueble = @id_inmueble;
        
        COMMIT TRANSACTION;
        
        SELECT SCOPE_IDENTITY() AS id_arrendamiento;
        
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
PRINT '✅ Procedimiento sp_CrearArrendamientoCompleto creado';

-- =====================================================================================================================
-- PASO 12: DATOS INICIALES (SEEDS)
-- =====================================================================================================================

PRINT '';
PRINT '=====================================================================================================================';
PRINT 'INSERTANDO DATOS INICIALES (SEEDS)';
PRINT '=====================================================================================================================';
PRINT '';

-- Roles del sistema
IF NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = 'Super Administrador')
BEGIN
    INSERT INTO Roles (nombre_rol, descripcion, es_rol_administrativo) VALUES
    ('Super Administrador', 'Acceso total al sistema con todos los permisos', 1),
    ('Administrador', 'Gestión administrativa y configuración del sistema', 1),
    ('Empleado', 'Agentes inmobiliarios y empleados de la empresa', 1),
    ('Usuario', 'Rol por defecto al registrarse en el sistema', 0),
    ('Propietario', 'Usuarios que tienen inmuebles registrados a su nombre', 0),
    ('Comprador', 'Personas que han comprado inmuebles a través de la inmobiliaria', 0),
    ('Arrendatario', 'Personas que tienen inmuebles en arrendamiento', 0);

    PRINT '✅ Roles insertados (7 roles)';
END

-- Estados de Cita
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

-- Servicios de Cita
IF NOT EXISTS (SELECT 1 FROM Servicios_cita WHERE nombre_servicio = 'Visita a Propiedad')
BEGIN
    INSERT INTO Servicios_cita (nombre_servicio, descripcion, duracion_estimada) VALUES
    ('Visita a Propiedad', 'Visita presencial para conocer el inmueble en detalle', 45),
    ('Avalúos', 'Servicio de avalúo y tasación profesional de inmuebles', 60),
    ('Gestión de Alquileres', 'Asesoría sobre gestión y administración de alquileres', 30),
    ('Asesoría Legal', 'Consulta legal relacionada con transacciones inmobiliarias', 45);

    PRINT '✅ Servicios de cita insertados (4 servicios)';
END

-- Estados de Venta
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

-- Comodidades
IF NOT EXISTS (SELECT 1 FROM Comodidades WHERE nombre = 'Habitaciones')
BEGIN
    INSERT INTO Comodidades (nombre, tipo_inmueble) VALUES
    ('Habitaciones', 'Casa'),
    ('Baños', 'Casa'),
    ('Parqueaderos', 'Casa'),
    ('Cocina integral', 'Casa'),
    ('Sala-comedor', 'Casa'),
    ('Patio', 'Casa'),
    ('Jardín', 'Casa'),
    ('Lavandería', 'Casa'),
    ('Balcón', 'Casa'),
    ('Habitaciones', 'Apartamento'),
    ('Baños', 'Apartamento'),
    ('Parqueaderos', 'Apartamento'),
    ('Cocina integral', 'Apartamento'),
    ('Balcón', 'Apartamento'),
    ('Zona de lavandería', 'Apartamento'),
    ('Ascensor', 'Apartamento'),
    ('Portería', 'Apartamento'),
    ('Baños', 'Apartaestudio'),
    ('Parqueaderos', 'Apartaestudio'),
    ('Cocina integral', 'Apartaestudio'),
    ('Balcón', 'Apartaestudio'),
    ('Zona de lavandería', 'Apartaestudio'),
    ('Ascensor', 'Apartaestudio'),
    ('Portería', 'Apartaestudio'),
    ('Habitaciones', 'Finca'),
    ('Baños', 'Finca'),
    ('Parqueaderos', 'Finca'),
    ('Cocina', 'Finca'),
    ('Piscina', 'Finca'),
    ('Kiosco', 'Finca'),
    ('Establos', 'Finca'),
    ('Cultivos', 'Finca'),
    ('Lago', 'Finca'),
    ('Área construible', 'Lote'),
    ('Servicios públicos', 'Lote'),
    ('Acceso vehicular', 'Lote'),
    ('Documentación al día', 'Lote'),
    ('Baños', 'Oficina'),
    ('Parqueaderos', 'Oficina'),
    ('Recepción', 'Oficina'),
    ('Sala de juntas', 'Oficina'),
    ('Cocina', 'Oficina'),
    ('Aire acondicionado', 'Oficina'),
    ('Internet', 'Oficina');

    PRINT '✅ Comodidades insertadas por tipo de inmueble';
END

-- Super Administrador
IF NOT EXISTS (SELECT 1 FROM Personas WHERE numero_documento = '999999999')
BEGIN
    INSERT INTO Personas (tipo_documento, numero_documento, nombre_completo, apellido_completo, correo, telefono, tiene_cuenta)
    VALUES ('CC', '999999999', 'Super', 'Admin', 'admin@inmotech.com', '+57 300 000 0000', 1);

    DECLARE @id_super_admin INT = SCOPE_IDENTITY();

    INSERT INTO Acceso (id_persona, contrasena)
    VALUES (@id_super_admin, '$2b$10$rKvFJZEJfRJdLx6jxL5zMeyPh8s9JZCvC.yMFNyV8HQKZ6yFN.JxC'); -- Contraseña: Admin123!

    INSERT INTO Administrativos (id_persona, codigo_empleado, fecha_ingreso, cargo, departamento, estado_laboral)
    VALUES (@id_super_admin, 'ADMIN-001', GETDATE(), 'Super Administrador', 'Tecnología', 'Activo');

    DECLARE @id_rol_super INT = (SELECT id_rol FROM Roles WHERE nombre_rol = 'Super Administrador');
    INSERT INTO Personas_rol (id_persona, id_rol)
    VALUES (@id_super_admin, @id_rol_super);

    PRINT '✅ Super Administrador creado exitosamente';
END

-- Propietarios de ejemplo
IF NOT EXISTS (SELECT 1 FROM Propietarios WHERE registro_propietario = 'PROP-001')
BEGIN
    DECLARE @id_super_admin INT = (SELECT id_persona FROM Personas WHERE numero_documento = '999999999');
    
    INSERT INTO Propietarios (id_persona, registro_propietario, ciudad_residencia, direccion_residencia)
    VALUES (@id_super_admin, 'PROP-001', 'Medellín', 'Oficina Principal InmoTech');
    
    INSERT INTO Personas (tipo_documento, numero_documento, nombre_completo, apellido_completo, correo, telefono, tiene_cuenta)
    VALUES 
    ('CC', '123456789', 'María', 'González López', 'maria.gonzalez@email.com', '+57 300 987 6543', 0),
    ('CC', '987654321', 'Carlos', 'Martínez Rodríguez', 'carlos.martinez@email.com', '+57 300 555 6789', 0);
    
    DECLARE @id_maria INT = SCOPE_IDENTITY();
    DECLARE @id_carlos INT = (SELECT id_persona FROM Personas WHERE numero_documento = '987654321');
    
    DECLARE @id_rol_prop INT = (SELECT id_rol FROM Roles WHERE nombre_rol = 'Propietario');
    INSERT INTO Personas_rol (id_persona, id_rol) VALUES (@id_maria, @id_rol_prop);
    INSERT INTO Personas_rol (id_persona, id_rol) VALUES (@id_carlos, @id_rol_prop);
    
    INSERT INTO Propietarios (id_persona, registro_propietario, ciudad_residencia, direccion_residencia)
    VALUES 
    (@id_maria, 'PROP-002', 'Medellín', 'Carrera 70 #45-23'),
    (@id_carlos, 'PROP-003', 'Envigado', 'Calle 25 Sur #35-45');
    
    PRINT '✅ Propietarios de ejemplo creados';
END

-- Compradores de ejemplo
IF NOT EXISTS (SELECT 1 FROM Compradores WHERE registro_comprador = 'COMP-001')
BEGIN
    INSERT INTO Personas (tipo_documento, numero_documento, nombre_completo, apellido_completo, correo, telefono, tiene_cuenta)
    VALUES 
    ('CC', '111111111', 'Ana', 'Rodríguez Pérez', 'ana.rodriguez@email.com', '+57 300 111 1111', 0),
    ('CC', '222222222', 'Luis', 'García Hernández', 'luis.garcia@email.com', '+57 300 222 2222', 0);
    
    DECLARE @id_ana INT = SCOPE_IDENTITY();
    DECLARE @id_luis INT = (SELECT id_persona FROM Personas WHERE numero_documento = '222222222');
    
    EXEC sp_CrearCompradorCompleto @id_persona = @id_ana, @tipo_comprador = 'Potencial', @ciudad_residencia = 'Medellín';
    EXEC sp_CrearCompradorCompleto @id_persona = @id_luis, @tipo_comprador = 'En Proceso', @ciudad_residencia = 'Envigado';
    
    PRINT '✅ Compradores de ejemplo creados';
END

<<<<<<< HEAD
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


<<<<<<< HEAD
ALTER TABLE Citas
ADD ediciones_realizadas INT NOT NULL DEFAULT 0;

ALTER TABLE Citas
ADD ediciones_maximas INT NOT NULL DEFAULT 2;
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Seed: Inmueble de prueba (opcional, para testing)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM Inmuebles WHERE registro_inmobiliario = 'INM-001-TEST')
BEGIN
    INSERT INTO Inmuebles (registro_inmobiliario, pais, departamento, ciudad, barrio, direccion, categoria, precio_venta, area_construida, descripcion)
=======
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
>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0
=======
-- Inmueble de prueba
IF NOT EXISTS (SELECT 1 FROM Inmuebles WHERE registro_inmobiliario = 'INM-001-TEST')
BEGIN
    INSERT INTO Inmuebles (
        registro_inmobiliario, titulo, pais, departamento, ciudad, barrio, direccion, 
        categoria, operacion, precio_venta, precio_arriendo, area_construida, descripcion,
        estado_frontend
    )
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
    VALUES (
        'INM-001-TEST',
        'Apartamento moderno en El Poblado',
        'Colombia',
        'Antioquia',
        'Medellín',
        'El Poblado',
<<<<<<< HEAD
        'Calle 50 # 45-20',
        'Apartamento',
        'Arriendo',
        NULL,
        2500000.00,
        120.50,
        'Apartamento de prueba para testing del sistema. 3 habitaciones, 2 baños, balcón con vista.',
        'Disponible'
    );

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
        1
    FROM Comodidades 
    WHERE nombre IN ('Habitaciones', 'Baños', 'Parqueaderos', 'Cocina integral', 'Balcón')
    AND tipo_inmueble = 'Apartamento';

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

    INSERT INTO Fichas_Tecnicas (id_inmueble, version, fecha_creacion, cambios)
    VALUES (@id_inmueble_test, 1, GETDATE(), 'Creación inicial del inmueble');

    PRINT '✅ Inmueble de prueba creado (INM-001-TEST)';
END
<<<<<<< HEAD
GO

=======
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
>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0

=======
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2

-- =====================================================================================================================
-- PASO 13: VERIFICACIÓN FINAL Y RESUMEN
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
DECLARE @Tablas TABLE (nombre VARCHAR(100));
INSERT INTO @Tablas VALUES 
('Personas'), ('Acceso'), ('Roles'), ('Personas_rol'), ('Administrativos'), ('Propietarios'),
('Inmuebles'), ('Comodidades'), ('Inmueble_Comodidades'), ('Fichas_Tecnicas'), ('Propiedad_inmueble'),
('Compradores'), ('Arrendatarios'), ('Ventas'), ('Arrendamientos'), ('Citas'), ('Notificaciones'), ('Reportes'),
('Estados_venta'), ('Seguimiento_venta'), ('Cobros'), ('Comprobantes_pago'),
('Servicios_cita'), ('Estados_cita');

DECLARE @tabla_nombre VARCHAR(100);
DECLARE tabla_cursor CURSOR FOR SELECT nombre FROM @Tablas;
OPEN tabla_cursor;
FETCH NEXT FROM tabla_cursor INTO @tabla_nombre;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @tabla_nombre)
        PRINT '   ✓ ' + @tabla_nombre;
    ELSE
        PRINT '   ❌ ' + @tabla_nombre;
    FETCH NEXT FROM tabla_cursor INTO @tabla_nombre;
END
CLOSE tabla_cursor;
DEALLOCATE tabla_cursor;
PRINT '';

-- Verificar datos iniciales
DECLARE @TotalRoles INT, @TotalEstados INT, @TotalServicios INT, @TotalAdmins INT, @TotalEstadosVenta INT, @TotalComodidades INT, @TotalPropietarios INT, @TotalCompradores INT;
SELECT @TotalRoles = COUNT(*) FROM Roles;
SELECT @TotalEstados = COUNT(*) FROM Estados_cita;
SELECT @TotalServicios = COUNT(*) FROM Servicios_cita;
SELECT @TotalAdmins = COUNT(*) FROM Administrativos;
SELECT @TotalEstadosVenta = COUNT(*) FROM Estados_venta;
SELECT @TotalComodidades = COUNT(*) FROM Comodidades;
SELECT @TotalPropietarios = COUNT(*) FROM Propietarios;
SELECT @TotalCompradores = COUNT(*) FROM Compradores;

PRINT '📋 DATOS INICIALES:';
PRINT '   - Roles:             ' + CAST(@TotalRoles AS VARCHAR(10));
PRINT '   - Estados de cita:   ' + CAST(@TotalEstados AS VARCHAR(10));
PRINT '   - Servicios de cita: ' + CAST(@TotalServicios AS VARCHAR(10));
PRINT '   - Estados de venta:  ' + CAST(@TotalEstadosVenta AS VARCHAR(10));
PRINT '   - Comodidades:       ' + CAST(@TotalComodidades AS VARCHAR(10));
PRINT '   - Propietarios:      ' + CAST(@TotalPropietarios AS VARCHAR(10));
PRINT '   - Compradores:       ' + CAST(@TotalCompradores AS VARCHAR(10));
PRINT '   - Administrativos:   ' + CAST(@TotalAdmins AS VARCHAR(10));
PRINT '';

PRINT '🎯 LÓGICA DE NEGOCIO IMPLEMENTADA:';
PRINT '   ┌─────────────────────────────────────────────────────────┐';
PRINT '   │  ✅ COMPRADORES:                                        │';
PRINT '   │     - Se crean SIN ventas ni inmuebles                  │';
PRINT '   │     - Pueden existir como "Potenciales"                 │';
PRINT '   │     - Las Ventas relacionan Comprador + Inmueble        │';
PRINT '   │                                                        │';
PRINT '   │  ✅ ARRENDATARIOS:                                      │';
PRINT '   │     - Se crean SIN contratos                           │';
PRINT '   │     - Pueden existir como "Potenciales"                 │';
PRINT '   │     - Arrendamientos relacionan Arrendatario + Inmueble│';
PRINT '   │                                                        │';
PRINT '   │  ✅ FLUJO CORRECTO:                                     │';
PRINT '   │     1. Crear Persona                                   │';
PRINT '   │     2. Crear Comprador/Arrendatario (potencial)        │';
PRINT '   │     3. Crear Venta/Arrendamiento (cuando se concrete)  │';
PRINT '   └─────────────────────────────────────────────────────────┘';
PRINT '';

PRINT '🔧 PROCEDIMIENTOS DISPONIBLES:';
PRINT '   - sp_CrearCompradorCompleto: Crea comprador sin venta';
PRINT '   - sp_CrearVentaCompleta: Crea venta relacionando comprador existente con inmueble';
PRINT '   - sp_CrearArrendatarioCompleto: Crea arrendatario sin contrato';
PRINT '   - sp_CrearArrendamientoCompleto: Crea arrendamiento relacionando arrendatario con inmueble';
PRINT '';

PRINT '📊 VISTAS DISPONIBLES:';
PRINT '   - vw_Compradores_Principal: Compradores con info de ventas';
PRINT '   - vw_Ventas_Completo: Ventas con info de compradores e inmuebles';
PRINT '   - vw_Arrendatarios_Completo: Arrendatarios con info de contratos';
PRINT '   - vw_Arrendamientos_Completo: Arrendamientos con info completa';
PRINT '   - vw_Propietarios_Completo: Propietarios con inmuebles';
PRINT '   - vw_Inmuebles_Completo: Inmuebles con comodidades y propietarios';
PRINT '';

PRINT '📋 DATOS DE PRUEBA DISPONIBLES:';
PRINT '   - Super Administrador: admin@inmotech.com / Admin123!';
PRINT '   - Propietarios: PROP-001, PROP-002, PROP-003';
PRINT '   - Compradores: COMP-001, COMP-002 (potenciales)';
PRINT '   - Inmueble de prueba: INM-001-TEST';
PRINT '';

PRINT '🚀 EJEMPLOS DE USO:';
PRINT '   -- Crear comprador potencial';
PRINT '   EXEC sp_CrearCompradorCompleto @id_persona = 1, @tipo_comprador = ''Potencial''';
PRINT '';
PRINT '   -- Crear venta (cuando se concrete)';
PRINT '   EXEC sp_CrearVentaCompleta ';
PRINT '     @id_comprador = 1, ';
PRINT '     @id_inmueble = 1, ';
PRINT '     @fecha_venta = ''2024-01-15'', ';
PRINT '     @valor_venta = 250000000, ';
PRINT '     @tipo_compra = ''Financiada''';
PRINT '';
PRINT '   -- Consultar compradores potenciales (sin ventas)';
PRINT '   SELECT * FROM vw_Compradores_Principal WHERE total_ventas = 0';
PRINT '';

PRINT '=====================================================================================================================';
PRINT '                                    🎉 BASE DE DATOS LISTA PARA USAR 🎉';
PRINT '=====================================================================================================================';
<<<<<<< HEAD
GO
<<<<<<< HEAD
=======




>>>>>>> b54f2ddb131eb0581a024d48b281505c5f0953b0
=======
﻿-- =====================================================================================================================
-- BASE DE DATOS INMOBILIARIA INMOTECH
-- =====================================================================================================================
-- Motor:           Microsoft SQL Server 2016+
-- Versión:         6.1 FINAL - CON ARQUITECTURA DE ADMINISTRATIVOS, PROPIETARIOS,
--                  AMENIDADES CUSTOM Y MANEJO DE IMÁGENES LOCALES
-- Compatibilidad:  Sequelize ORM + Node.js + Express + React Frontend
-- Autor:           Sistema InmoTech
-- Fecha:           Octubre 2025
-- =====================================================================================================================

-- =====================================================================================================================
-- PASO 1: CREACIÓN DE LA BASE DE DATOS
-- =====================================================================================================================

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
PRINT 'INICIANDO CREACIÓN DE ESTRUCTURA DE BASE DE DATOS INMOTECH v6.1 - CON SOPORTE COMPLETO PARA FRONTEND REACT';
PRINT '=====================================================================================================================';
PRINT '';
GO

-- =====================================================================================================================
-- PASO 2: TABLAS PRINCIPALES - GESTIÓN DE PERSONAS
-- =====================================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Personas]') AND type = 'U')
BEGIN
    CREATE TABLE Personas (
        id_persona INT PRIMARY KEY IDENTITY(1,1),

        tipo_documento VARCHAR(5) NOT NULL CHECK (tipo_documento IN ('CC', 'CE', 'NIT', 'Pasaporte', 'TI')),
        numero_documento VARCHAR(20) NOT NULL,

        nombre_completo VARCHAR(100) NOT NULL,
        apellido_completo VARCHAR(100) NOT NULL,

        correo VARCHAR(100) NOT NULL,
        telefono VARCHAR(20) NULL,

        tiene_cuenta BIT NOT NULL DEFAULT 0,
        estado BIT NOT NULL DEFAULT 1,

        fecha_registro DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT UQ_Persona_Documento UNIQUE (tipo_documento, numero_documento),
        CONSTRAINT UQ_Persona_Correo UNIQUE (correo),
        CONSTRAINT CHK_Personas_Email CHECK (correo LIKE '%_@__%.__%'),
        CONSTRAINT CHK_Personas_TipoDoc CHECK (tipo_documento IN ('CC', 'CE', 'NIT', 'Pasaporte', 'TI'))
    );
    PRINT '✅ Tabla Personas creada';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personas_Documento' AND object_id = OBJECT_ID('Personas'))
    CREATE NONCLUSTERED INDEX IX_Personas_Documento ON Personas(tipo_documento, numero_documento);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personas_Correo' AND object_id = OBJECT_ID('Personas'))
    CREATE NONCLUSTERED INDEX IX_Personas_Correo ON Personas(correo);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personas_TieneCuenta' AND object_id = OBJECT_ID('Personas'))
    CREATE NONCLUSTERED INDEX IX_Personas_TieneCuenta ON Personas(tiene_cuenta) INCLUDE (estado);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Acceso]') AND type = 'U')
BEGIN
    CREATE TABLE Acceso (
        id_acceso INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        ultimo_acceso DATETIME2(3) NULL,

        CONSTRAINT FK_Acceso_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Acceso creada';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type = 'U')
BEGIN
    CREATE TABLE Roles (
        id_rol INT PRIMARY KEY IDENTITY(1,1),
        nombre_rol VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(200) NULL,
        es_rol_administrativo BIT NOT NULL DEFAULT 0,
        estado BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Tabla Roles creada';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Personas_rol]') AND type = 'U')
BEGIN
    CREATE TABLE Personas_rol (
        id_persona_rol INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL,
        id_rol INT NOT NULL,
        estado BIT NOT NULL DEFAULT 1,
        fecha_asignacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_PersonasRol_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona) ON DELETE CASCADE,
        CONSTRAINT FK_PersonasRol_Rol FOREIGN KEY (id_rol) REFERENCES Roles(id_rol) ON DELETE CASCADE,
        CONSTRAINT UQ_PersonasRol_Unico UNIQUE (id_persona, id_rol)
    );
    PRINT '✅ Tabla Personas_rol creada';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PersonasRol_Persona' AND object_id = OBJECT_ID('Personas_rol'))
    CREATE NONCLUSTERED INDEX IX_PersonasRol_Persona ON Personas_rol(id_persona);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PersonasRol_Rol' AND object_id = OBJECT_ID('Personas_rol'))
    CREATE NONCLUSTERED INDEX IX_PersonasRol_Rol ON Personas_rol(id_rol);
GO

-- =====================================================================================================================
-- PASO 3: TABLA DE ADMINISTRATIVOS
-- =====================================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Administrativos]') AND type = 'U')
BEGIN
    CREATE TABLE Administrativos (
        id_administrativo INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,

        codigo_empleado VARCHAR(20) UNIQUE NOT NULL,
        fecha_ingreso DATE NOT NULL,
        cargo VARCHAR(100) NULL,
        departamento VARCHAR(100) NULL,
        salario DECIMAL(15,2) NULL,

        estado_laboral VARCHAR(50) NOT NULL DEFAULT 'Activo' CHECK (estado_laboral IN ('Activo', 'Inactivo', 'Suspendido', 'Retirado')),
        fecha_retiro DATE NULL,

        observaciones TEXT NULL,

        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Administrativos_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona) ON DELETE CASCADE,
        CONSTRAINT CHK_Administrativos_FechaRetiro CHECK (fecha_retiro IS NULL OR fecha_retiro >= fecha_ingreso)
    );
    PRINT '✅ Tabla Administrativos creada';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Administrativos_CodigoEmpleado' AND object_id = OBJECT_ID('Administrativos'))
    CREATE NONCLUSTERED INDEX IX_Administrativos_CodigoEmpleado ON Administrativos(codigo_empleado);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Administrativos_EstadoLaboral' AND object_id = OBJECT_ID('Administrativos'))
    CREATE NONCLUSTERED INDEX IX_Administrativos_EstadoLaboral 
    ON Administrativos(estado_laboral)
    WHERE estado_laboral = 'Activo';
GO

-- =====================================================================================================================
-- PASO 4: TABLA DE PROPIETARIOS
-- =====================================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Propietarios]') AND type = 'U')
BEGIN
    CREATE TABLE Propietarios (
        id_propietario INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL UNIQUE,
        
        registro_propietario VARCHAR(20) NOT NULL UNIQUE,
        fecha_registro_propietario DATE NOT NULL DEFAULT GETDATE(),
        
        ciudad_residencia VARCHAR(50) NULL,
        direccion_residencia VARCHAR(100) NULL,
        
        estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Suspendido')),
        
        observaciones TEXT NULL,
        
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_actualizacion DATETIME2(3) NULL,
        
        CONSTRAINT FK_Propietarios_Persona FOREIGN KEY (id_persona) 
            REFERENCES Personas(id_persona) ON DELETE CASCADE
    );
    PRINT '✅ Tabla Propietarios creada';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Propietarios_Registro' AND object_id = OBJECT_ID('Propietarios'))
    CREATE NONCLUSTERED INDEX IX_Propietarios_Registro ON Propietarios(registro_propietario);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Propietarios_Estado' AND object_id = OBJECT_ID('Propietarios'))
    CREATE NONCLUSTERED INDEX IX_Propietarios_Estado ON Propietarios(estado) WHERE estado = 'Activo';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Propietarios_Persona' AND object_id = OBJECT_ID('Propietarios'))
    CREATE NONCLUSTERED INDEX IX_Propietarios_Persona ON Propietarios(id_persona);
GO

-- =====================================================================================================================
-- PASO 5: TABLAS DE INMUEBLES
-- =====================================================================================================================

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

        -- ⚠️ ahora sin CHECK inline, se agrega después con constraint nombrada
        operacion VARCHAR(20) NOT NULL DEFAULT 'Venta',

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
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'operacion' AND Object_ID = Object_ID(N'Inmuebles'))
        ALTER TABLE Inmuebles ADD operacion VARCHAR(20) NOT NULL DEFAULT 'Venta';
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'estado_frontend' AND Object_ID = Object_ID(N'Inmuebles'))
        ALTER TABLE Inmuebles ADD estado_frontend VARCHAR(50) NOT NULL DEFAULT 'Disponible' CHECK (estado_frontend IN (
            'Disponible', 'Vendido', 'Arrendado', 'En proceso de venta', 'En proceso de arrendamiento'
        ));
END
GO

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
GO

-- Ajuste: CHECK de operacion para permitir 'Venta y Arriendo'
IF EXISTS (SELECT 1 FROM sys.columns WHERE Name = N'operacion' AND Object_ID = Object_ID(N'Inmuebles'))
BEGIN
    DECLARE @chkOpName SYSNAME;

    SELECT @chkOpName = cc.name
    FROM sys.check_constraints cc
    JOIN sys.columns c 
        ON c.object_id = cc.parent_object_id 
       AND c.column_id = cc.parent_column_id
    WHERE cc.parent_object_id = OBJECT_ID(N'Inmuebles')
      AND c.name = 'operacion';

    IF @chkOpName IS NOT NULL
    BEGIN
        DECLARE @sqlOp NVARCHAR(4000);
        SET @sqlOp = N'ALTER TABLE Inmuebles DROP CONSTRAINT [' + @chkOpName + N']';
        EXEC sp_executesql @sqlOp;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.check_constraints 
        WHERE name = 'CK_Inmuebles_Operacion' 
          AND parent_object_id = OBJECT_ID(N'Inmuebles')
    )
    BEGIN
        ALTER TABLE Inmuebles
            ADD CONSTRAINT CK_Inmuebles_Operacion
            CHECK (operacion IN ('Venta', 'Arriendo', 'Venta y Arriendo'));
    END
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Comodidades (con soporte para amenities custom)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Comodidades]') AND type = 'U')
BEGIN
    CREATE TABLE Comodidades (
        id_comodidad INT PRIMARY KEY IDENTITY(1,1),
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion VARCHAR(200) NULL,
        tipo_inmueble VARCHAR(50) NULL,       -- NULL = aplica a todos los tipos
        estado BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        -- NUEVO: amenities personalizadas
        es_personalizada BIT NOT NULL DEFAULT 0,
        id_persona_creador INT NULL,

        CONSTRAINT FK_Comodidades_PersonaCreacion 
            FOREIGN KEY (id_persona_creador) 
            REFERENCES Personas(id_persona)
    );
    PRINT '✅ Tabla Comodidades creada';
END
GO

-- Ajustes en caso de que Comodidades ya existiera sin estas columnas
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Comodidades]') AND type = 'U')
BEGIN
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'es_personalizada' 
          AND Object_ID = Object_ID(N'Comodidades')
    )
        ALTER TABLE Comodidades 
            ADD es_personalizada BIT NOT NULL DEFAULT 0;

    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE Name = N'id_persona_creador' 
          AND Object_ID = Object_ID(N'Comodidades')
    )
        ALTER TABLE Comodidades 
            ADD id_persona_creador INT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM sys.foreign_keys 
        WHERE name = 'FK_Comodidades_PersonaCreacion' 
          AND parent_object_id = OBJECT_ID(N'Comodidades')
    )
        ALTER TABLE Comodidades
            ADD CONSTRAINT FK_Comodidades_PersonaCreacion 
            FOREIGN KEY (id_persona_creador) 
            REFERENCES Personas(id_persona);
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Inmueble_Comodidades
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Inmueble_Comodidades]') AND type = 'U')
BEGIN
    CREATE TABLE Inmueble_Comodidades (
        id_inmueble_comodidad INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
        id_comodidad INT NOT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        seleccionada BIT NOT NULL DEFAULT 1,
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

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_InmuebleComodidades_Inmueble' AND object_id = OBJECT_ID('Inmueble_Comodidades'))
    CREATE NONCLUSTERED INDEX IX_InmuebleComodidades_Inmueble ON Inmueble_Comodidades(id_inmueble);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_InmuebleComodidades_Comodidad' AND object_id = OBJECT_ID('Inmueble_Comodidades'))
    CREATE NONCLUSTERED INDEX IX_InmuebleComodidades_Comodidad ON Inmueble_Comodidades(id_comodidad);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- NUEVA Tabla: Inmueble_Imagenes (imágenes subidas desde el computador)
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (
    SELECT * FROM sys.objects 
    WHERE object_id = OBJECT_ID(N'[dbo].[Inmueble_Imagenes]') 
      AND type = 'U'
)
BEGIN
    CREATE TABLE Inmueble_Imagenes (
        id_imagen INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,

        -- Archivo físico subido por el usuario
        nombre_archivo VARCHAR(255) NOT NULL,          -- nombre original (ej: fachada.jpg)
        ruta_archivo   VARCHAR(500) NOT NULL,          -- ruta/clave interna en el servidor o storage

        titulo VARCHAR(150) NULL,
        descripcion VARCHAR(300) NULL,
        es_principal BIT NOT NULL DEFAULT 0,
        orden INT NULL,

        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Inmueble_Imagenes_Inmueble 
            FOREIGN KEY (id_inmueble) 
            REFERENCES Inmuebles(id_inmueble) 
            ON DELETE CASCADE
    );
    PRINT '✅ Tabla Inmueble_Imagenes creada';
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'IX_InmuebleImagenes_Inmueble' 
      AND object_id = OBJECT_ID('Inmueble_Imagenes')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_InmuebleImagenes_Inmueble 
        ON Inmueble_Imagenes(id_inmueble, es_principal, orden);
END
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Fichas_Tecnicas
-- ---------------------------------------------------------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Fichas_Tecnicas]') AND type = 'U')
BEGIN
    CREATE TABLE Fichas_Tecnicas (
        id_ficha_tecnica INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,
        version INT NOT NULL,
        fecha_creacion DATE NOT NULL,
        cambios TEXT NOT NULL,
        datos_json NVARCHAR(MAX) NULL,
        id_usuario_creador INT NULL,
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

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FichasTecnicas_Inmueble' AND object_id = OBJECT_ID('Fichas_Tecnicas'))
    CREATE NONCLUSTERED INDEX IX_FichasTecnicas_Inmueble ON Fichas_Tecnicas(id_inmueble);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FichasTecnicas_Fecha' AND object_id = OBJECT_ID('Fichas_Tecnicas'))
    CREATE NONCLUSTERED INDEX IX_FichasTecnicas_Fecha ON Fichas_Tecnicas(fecha_creacion DESC);
GO

-- ---------------------------------------------------------------------------------------------------------------------
-- Tabla: Propiedad_inmueble
-- ---------------------------------------------------------------------------------------------------------------------
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
    PRINT '⚠️ Tabla Propiedad_inmueble ya existe, verificando columnas...';

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'es_propietario_actual' AND Object_ID = Object_ID(N'Propiedad_inmueble'))
    BEGIN
        ALTER TABLE Propiedad_inmueble ADD es_propietario_actual BIT NOT NULL DEFAULT 1;
        PRINT 'ℹ️ Columna es_propietario_actual agregada correctamente.';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'porcentaje_propiedad' AND Object_ID = Object_ID(N'Propiedad_inmueble'))
    BEGIN
        ALTER TABLE Propiedad_inmueble ADD porcentaje_propiedad DECIMAL(5,2) NOT NULL DEFAULT 100.00;
        PRINT 'ℹ️ Columna porcentaje_propiedad agregada correctamente.';
    END
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PropiedadInmueble_Inmueble' AND object_id = OBJECT_ID('Propiedad_inmueble'))
    CREATE NONCLUSTERED INDEX IX_PropiedadInmueble_Inmueble ON Propiedad_inmueble(id_inmueble);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PropiedadInmueble_Persona' AND object_id = OBJECT_ID('Propiedad_inmueble'))
    CREATE NONCLUSTERED INDEX IX_PropiedadInmueble_Persona ON Propiedad_inmueble(id_persona);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_PropiedadInmueble_Actual' AND object_id = OBJECT_ID('Propiedad_inmueble'))
    CREATE NONCLUSTERED INDEX IX_PropiedadInmueble_Actual ON Propiedad_inmueble(es_propietario_actual) WHERE es_propietario_actual = 1;
GO

-- =====================================================================================================================
-- PASO 6: MÓDULO DE CITAS
-- =====================================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Servicios_cita]') AND type = 'U')
BEGIN
    CREATE TABLE Servicios_cita (
        id_servicio INT PRIMARY KEY IDENTITY(1,1),
        nombre_servicio VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT NULL,
        duracion_estimada INT NOT NULL DEFAULT 45,
        estado BIT NOT NULL DEFAULT 1,

        CONSTRAINT CHK_ServicioCita_Duracion CHECK (duracion_estimada > 0 AND duracion_estimada <= 480)
    );
    PRINT '✅ Tabla Servicios_cita creada';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Estados_cita]') AND type = 'U')
BEGIN
    CREATE TABLE Estados_cita (
        id_estado_cita INT PRIMARY KEY IDENTITY(1,1),
        nombre_estado VARCHAR(50) NOT NULL UNIQUE,
        orden INT NOT NULL,
        descripcion VARCHAR(200) NULL,
        es_estado_final BIT NOT NULL DEFAULT 0,
        estado BIT NOT NULL DEFAULT 1
    );
    PRINT '✅ Tabla Estados_cita creada';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Citas]') AND type = 'U')
BEGIN
    CREATE TABLE Citas (
        id_cita INT PRIMARY KEY IDENTITY(1,1),

        id_persona INT NOT NULL,
        id_inmueble INT NOT NULL,
        id_servicio INT NOT NULL,
        id_usuario_creador INT NULL,

        fecha_cita DATE NOT NULL,
        hora_inicio TIME(0) NOT NULL,
        hora_fin TIME(0) NOT NULL,

        id_estado_cita INT NOT NULL DEFAULT 1,
        id_agente_asignado INT NULL,

        observaciones TEXT NULL,
        motivo_cancelacion VARCHAR(500) NULL,

        es_reagendada BIT NOT NULL DEFAULT 0,
        id_cita_original INT NULL,

        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_confirmacion DATETIME2(3) NULL,
        fecha_cancelacion DATETIME2(3) NULL,
        fecha_completada DATETIME2(3) NULL,
        fecha_actualizacion DATETIME2(3) NULL,

        CONSTRAINT FK_Citas_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Citas_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble) ON DELETE CASCADE,
        CONSTRAINT FK_Citas_Servicio FOREIGN KEY (id_servicio) REFERENCES Servicios_cita(id_servicio),
        CONSTRAINT FK_Citas_Estado FOREIGN KEY (id_estado_cita) REFERENCES Estados_cita(id_estado_cita),
        CONSTRAINT FK_Citas_Agente FOREIGN KEY (id_agente_asignado) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Citas_Creador FOREIGN KEY (id_usuario_creador) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Citas_CitaOriginal FOREIGN KEY (id_cita_original) REFERENCES Citas(id_cita),

        CONSTRAINT CHK_Citas_HoraValida CHECK (hora_fin > hora_inicio),
        CONSTRAINT CHK_Citas_FechaFuturo CHECK (fecha_cita >= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Citas creada';
END
GO

CREATE NONCLUSTERED INDEX IX_Citas_Estado ON Citas(id_estado_cita, fecha_cita, hora_inicio);
CREATE NONCLUSTERED INDEX IX_Citas_Agente ON Citas(id_agente_asignado) WHERE id_agente_asignado IS NOT NULL;
CREATE NONCLUSTERED INDEX IX_Citas_Fecha ON Citas(fecha_cita, hora_inicio);
CREATE NONCLUSTERED INDEX IX_Citas_Persona ON Citas(id_persona);
CREATE NONCLUSTERED INDEX IX_Citas_ConflictoHorario ON Citas(id_inmueble, fecha_cita, hora_inicio, hora_fin) INCLUDE (id_estado_cita);
CREATE NONCLUSTERED INDEX IX_Citas_Creador ON Citas(id_usuario_creador);
GO

-- =====================================================================================================================
-- PASO 7: NOTIFICACIONES
-- =====================================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notificaciones]') AND type = 'U')
BEGIN
    CREATE TABLE Notificaciones (
        id_notificacion INT PRIMARY KEY IDENTITY(1,1),

        tipo_notificacion VARCHAR(50) NOT NULL CHECK (tipo_notificacion IN ('CITA_SOLICITADA', 'CITA_CANCELADA', 'CITA_REAGENDADA', 'CITA_CONFIRMADA', 'CITA_COMPLETADA', 'SISTEMA', 'ALERTA')),
        titulo VARCHAR(200) NOT NULL,
        mensaje TEXT NOT NULL,

        id_cita INT NULL,

        id_rol_destino INT NULL,
        id_persona_destino INT NULL,

        leida BIT NOT NULL DEFAULT 0,
        fecha_leida DATETIME2(3) NULL,

        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Notificaciones_Cita FOREIGN KEY (id_cita) REFERENCES Citas(id_cita) ON DELETE CASCADE,
        CONSTRAINT FK_Notificaciones_Rol FOREIGN KEY (id_rol_destino) REFERENCES Roles(id_rol),
        CONSTRAINT FK_Notificaciones_Persona FOREIGN KEY (id_persona_destino) REFERENCES Personas(id_persona),
        CONSTRAINT CHK_Notificaciones_Destino CHECK (id_rol_destino IS NOT NULL OR id_persona_destino IS NOT NULL)
    );
    PRINT '✅ Tabla Notificaciones creada';
END
GO

CREATE NONCLUSTERED INDEX IX_Notificaciones_NoLeidas ON Notificaciones(leida, fecha_creacion DESC) WHERE leida = 0;
CREATE NONCLUSTERED INDEX IX_Notificaciones_Rol ON Notificaciones(id_rol_destino) WHERE id_rol_destino IS NOT NULL;
CREATE NONCLUSTERED INDEX IX_Notificaciones_Persona ON Notificaciones(id_persona_destino) WHERE id_persona_destino IS NOT NULL;
GO

-- =====================================================================================================================
-- PASO 8: REPORTES
-- =====================================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reportes]') AND type = 'U')
BEGIN
    CREATE TABLE Reportes (
        id_reporte INT PRIMARY KEY IDENTITY(1,1),
        id_inmueble INT NOT NULL,

        tipo_reporte VARCHAR(50) NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT NOT NULL,

        prioridad VARCHAR(20) NOT NULL DEFAULT 'Media' CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
        estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Resuelto', 'Cerrado')),

        id_persona_reporta INT NOT NULL,

        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),
        fecha_resolucion DATETIME2(3) NULL,

        observaciones_resolucion TEXT NULL,

        CONSTRAINT FK_Reportes_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble) ON DELETE CASCADE,
        CONSTRAINT FK_Reportes_Persona FOREIGN KEY (id_persona_reporta) REFERENCES Personas(id_persona)
    );
    PRINT '✅ Tabla Reportes creada';
END
GO

CREATE NONCLUSTERED INDEX IX_Reportes_Estado ON Reportes(estado, fecha_creacion DESC);
CREATE NONCLUSTERED INDEX IX_Reportes_Inmueble ON Reportes(id_inmueble);
CREATE NONCLUSTERED INDEX IX_Reportes_Prioridad ON Reportes(prioridad) WHERE estado != 'Cerrado';
GO

-- =====================================================================================================================
-- PASO 9: VENTAS Y ARRENDAMIENTOS
-- =====================================================================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Ventas]') AND type = 'U')
BEGIN
    CREATE TABLE Ventas (
        id_venta INT PRIMARY KEY IDENTITY(1,1),
        id_persona INT NOT NULL,
        id_inmueble INT NOT NULL,
        fecha_venta DATE NOT NULL,
        valor_venta DECIMAL(15,2) NOT NULL,
        medio_pago VARCHAR(50) NOT NULL CHECK (medio_pago IN ('efectivo', 'transferencia', 'credito', 'mixto')),
        estado VARCHAR(50) NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Cancelada', 'Finalizada')),
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Ventas_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Ventas_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble),
        CONSTRAINT CHK_Ventas_Valor CHECK (valor_venta > 0),
        CONSTRAINT CHK_Ventas_Fecha CHECK (fecha_venta <= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Ventas creada';
END
GO

CREATE NONCLUSTERED INDEX IX_Ventas_Persona ON Ventas(id_persona);
CREATE NONCLUSTERED INDEX IX_Ventas_Inmueble ON Ventas(id_inmueble);
CREATE NONCLUSTERED INDEX IX_Ventas_Fecha ON Ventas(fecha_venta DESC);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Estados_venta]') AND type = 'U')
BEGIN
    CREATE TABLE Estados_venta (
        id_estado_venta INT PRIMARY KEY IDENTITY(1,1),
        nombre_estado VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(200) NULL,
        orden INT NOT NULL,
        es_estado_final BIT NOT NULL DEFAULT 0,
        estado BIT NOT NULL DEFAULT 1
    );
    PRINT '✅ Tabla Estados_venta creada';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Seguimiento_venta]') AND type = 'U')
BEGIN
    CREATE TABLE Seguimiento_venta (
        id_seguimiento_venta INT PRIMARY KEY IDENTITY(1,1),
        id_venta INT NOT NULL,
        id_estado_venta INT NOT NULL,
        id_persona INT NOT NULL,
        fecha_estado_seguimiento DATE NOT NULL,
        descripcion TEXT NOT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_SeguimientoVenta_Venta FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta) ON DELETE CASCADE,
        CONSTRAINT FK_SeguimientoVenta_Estado FOREIGN KEY (id_estado_venta) REFERENCES Estados_venta(id_estado_venta),
        CONSTRAINT FK_SeguimientoVenta_Persona FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
        CONSTRAINT CHK_SeguimientoVenta_Fecha CHECK (fecha_estado_seguimiento <= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Seguimiento_venta creada';
END
GO

CREATE NONCLUSTERED INDEX IX_SeguimientoVenta_Venta ON Seguimiento_venta(id_venta);
CREATE NONCLUSTERED INDEX IX_SeguimientoVenta_Fecha ON Seguimiento_venta(fecha_estado_seguimiento DESC);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Arrendamientos]') AND type = 'U')
BEGIN
    CREATE TABLE Arrendamientos (
        id_arrendamiento INT PRIMARY KEY IDENTITY(1,1),
        id_cliente INT NOT NULL,
        id_inmueble INT NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_finalizacion DATE NOT NULL,
        valor_mensual DECIMAL(15,2) NOT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Al día', 'Pendiente', 'Recuperación', 'Finalizado', 'Cancelado')),
        duracion_meses AS DATEDIFF(MONTH, fecha_inicio, fecha_finalizacion),
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Arrendamientos_Cliente FOREIGN KEY (id_cliente) REFERENCES Personas(id_persona),
        CONSTRAINT FK_Arrendamientos_Inmueble FOREIGN KEY (id_inmueble) REFERENCES Inmuebles(id_inmueble),
        CONSTRAINT CHK_Arrendamientos_Valor CHECK (valor_mensual > 0),
        CONSTRAINT CHK_Arrendamientos_Fechas CHECK (fecha_finalizacion > fecha_inicio),
        CONSTRAINT CHK_Arrendamientos_Duracion CHECK (DATEDIFF(MONTH, fecha_inicio, fecha_finalizacion) >= 1)
    );
    PRINT '✅ Tabla Arrendamientos creada';
END
GO

CREATE NONCLUSTERED INDEX IX_Arrendamientos_Cliente ON Arrendamientos(id_cliente);
CREATE NONCLUSTERED INDEX IX_Arrendamientos_Inmueble ON Arrendamientos(id_inmueble);
CREATE NONCLUSTERED INDEX IX_Arrendamientos_Estado ON Arrendamientos(estado) WHERE estado IN ('Activo', 'Pendiente');
CREATE NONCLUSTERED INDEX IX_Arrendamientos_Fechas ON Arrendamientos(fecha_inicio, fecha_finalizacion);
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cobros]') AND type = 'U')
BEGIN
    CREATE TABLE Cobros (
        id_cobro INT PRIMARY KEY IDENTITY(1,1),
        id_arrendamiento INT NOT NULL,
        fecha_cobro DATE NOT NULL,
        fecha_limite DATE NOT NULL,
        valor_pago DECIMAL(15,2) NOT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagado', 'Vencido', 'Cancelado')),
        fecha_estado DATE NULL,
        fecha_pago DATE NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Cobros_Arrendamiento FOREIGN KEY (id_arrendamiento) REFERENCES Arrendamientos(id_arrendamiento) ON DELETE CASCADE,
        CONSTRAINT CHK_Cobros_Valor CHECK (valor_pago > 0),
        CONSTRAINT CHK_Cobros_Fechas CHECK (fecha_limite >= fecha_cobro),
        CONSTRAINT CHK_Cobros_FechaPago CHECK (fecha_pago IS NULL OR fecha_pago >= fecha_cobro)
    );
    PRINT '✅ Tabla Cobros creada';
END
GO

CREATE NONCLUSTERED INDEX IX_Cobros_Arrendamiento ON Cobros(id_arrendamiento);
CREATE NONCLUSTERED INDEX IX_Cobros_Estado ON Cobros(estado) WHERE estado IN ('Pendiente', 'Vencido');
CREATE NONCLUSTERED INDEX IX_Cobros_Fechas ON Cobros(fecha_cobro, fecha_limite);
CREATE NONCLUSTERED INDEX IX_Cobros_Vencidos ON Cobros(estado, fecha_limite) WHERE estado = 'Pendiente';
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Comprobantes_pago]') AND type = 'U')
BEGIN
    CREATE TABLE Comprobantes_pago (
        id_comprobante INT PRIMARY KEY IDENTITY(1,1),
        id_cobro INT NOT NULL,
        url_comprobante VARCHAR(500) NOT NULL,
        entidad_bancaria VARCHAR(100) NOT NULL,
        referencia_bancaria VARCHAR(100) NOT NULL,
        monto_pagado DECIMAL(15,2) NOT NULL,
        estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmado', 'Negado', 'En revisión')),
        fecha_pago DATE NOT NULL,
        fecha_revision DATE NULL,
        observaciones TEXT NULL,
        fecha_creacion DATETIME2(3) NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_Comprobantes_Cobro FOREIGN KEY (id_cobro) REFERENCES Cobros(id_cobro) ON DELETE CASCADE,
        CONSTRAINT CHK_Comprobantes_Monto CHECK (monto_pagado > 0),
        CONSTRAINT CHK_Comprobantes_Fecha CHECK (fecha_pago <= CAST(GETDATE() AS DATE))
    );
    PRINT '✅ Tabla Comprobantes_pago creada';
END
GO

CREATE NONCLUSTERED INDEX IX_Comprobantes_Cobro ON Comprobantes_pago(id_cobro);
CREATE NONCLUSTERED INDEX IX_Comprobantes_Estado ON Comprobantes_pago(estado) WHERE estado IN ('Pendiente', 'En revisión');
CREATE NONCLUSTERED INDEX IX_Comprobantes_Referencia ON Comprobantes_pago(referencia_bancaria, entidad_bancaria);
GO

-- =====================================================================================================================
-- PASO 10: FUNCIONES, VISTAS Y PROCEDIMIENTOS
-- =====================================================================================================================

IF OBJECT_ID('dbo.fn_EsAdministrativo', 'FN') IS NOT NULL
    DROP FUNCTION dbo.fn_EsAdministrativo;
GO

CREATE FUNCTION dbo.fn_EsAdministrativo(@id_persona INT)
RETURNS BIT
AS
BEGIN
    DECLARE @resultado BIT = 0;

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

IF OBJECT_ID('dbo.vw_Propietarios_Completo', 'V') IS NOT NULL
    DROP VIEW dbo.vw_Propietarios_Completo;
GO

CREATE VIEW dbo.vw_Propietarios_Completo AS
SELECT 
    prop.id_propietario,
    prop.registro_propietario AS registro,
    prop.estado,
    prop.ciudad_residencia AS ciudad,
    prop.direccion_residencia AS direccion,
    prop.fecha_registro_propietario AS fecha_registro,
    
    p.id_persona,
    p.tipo_documento,
    p.numero_documento AS documento,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) AS nombre,
    p.correo AS email,
    p.telefono,
    
    COUNT(DISTINCT pi.id_inmueble) AS cantidad_inmuebles,
    
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

-- Vista principal de inmuebles con amenities custom e imágenes
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
    
    p.id_persona AS id_propietario,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) AS nombre_propietario,
    p.correo AS email_propietario,
    p.telefono AS telefono_propietario,
    
    -- Amenities con campo custom (es_personalizada)
    (
        SELECT 
            c.nombre,
            ic.cantidad,
            ic.seleccionada,
            c.es_personalizada AS custom
        FROM Inmueble_Comodidades ic
        INNER JOIN Comodidades c ON ic.id_comodidad = c.id_comodidad
        WHERE ic.id_inmueble = i.id_inmueble 
          AND ic.seleccionada = 1
        FOR JSON PATH
    ) AS comodidades_json,

    -- Imágenes asociadas al inmueble (archivos subidos)
    (
        SELECT 
            img.id_imagen,
            img.nombre_archivo,
            img.ruta_archivo,
            img.titulo,
            img.descripcion,
            img.es_principal,
            img.orden
        FROM Inmueble_Imagenes img
        WHERE img.id_inmueble = i.id_inmueble
        ORDER BY img.es_principal DESC, img.orden ASC, img.id_imagen
        FOR JSON PATH
    ) AS imagenes_json,
    
    (SELECT COUNT(*) FROM Fichas_Tecnicas ft WHERE ft.id_inmueble = i.id_inmueble) AS total_fichas,
    
    i.fecha_registro,
    i.fecha_actualizacion
    
FROM Inmuebles i
LEFT JOIN Propiedad_inmueble pi 
    ON i.id_inmueble = pi.id_inmueble 
   AND pi.estado = 'Activo' 
   AND pi.es_propietario_actual = 1
LEFT JOIN Personas p ON pi.id_persona = p.id_persona
WHERE i.estado != 'Eliminado';
GO
PRINT '✅ Vista vw_Inmuebles_Completo creada';
GO

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

IF OBJECT_ID('dbo.vw_PersonalAdministrativo', 'V') IS NOT NULL
    DROP VIEW dbo.vw_PersonalAdministrativo;
GO

CREATE VIEW dbo.vw_PersonalAdministrativo AS
SELECT
    a.id_administrativo,
    a.codigo_empleado,
    a.cargo,
    a.departamento,
    a.fecha_ingreso,
    a.estado_laboral,
    p.id_persona,
    p.tipo_documento,
    p.numero_documento,
    p.correo,
    p.telefono,
    CONCAT(p.nombre_completo, ' ', p.apellido_completo) AS nombre_completo,
    STRING_AGG(r.nombre_rol, ', ') AS roles,
    acc.ultimo_acceso
FROM Administrativos a
INNER JOIN Personas p ON a.id_persona = p.id_persona
LEFT JOIN Acceso acc ON p.id_persona = acc.id_persona
LEFT JOIN Personas_rol pr ON p.id_persona = pr.id_persona AND pr.estado = 1
LEFT JOIN Roles r ON pr.id_rol = r.id_rol AND r.estado = 1
WHERE p.estado = 1
GROUP BY
    a.id_administrativo, a.codigo_empleado, a.cargo, a.departamento, a.fecha_ingreso, a.estado_laboral,
    p.id_persona, p.tipo_documento, p.numero_documento, p.correo, p.telefono,
    p.nombre_completo, p.apellido_completo,
    acc.ultimo_acceso;
GO
PRINT '✅ Vista vw_PersonalAdministrativo creada';
GO

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

-- Procedimientos para propietarios / inmuebles (se mantienen igual que tu versión original)
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
    @inmuebles_asignar NVARCHAR(MAX) = NULL,
    @id_usuario_creador INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @id_persona INT;
        DECLARE @registro_propietario VARCHAR(20);
        
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
        
        INSERT INTO Personas (
            tipo_documento, numero_documento, nombre_completo, apellido_completo,
            correo, telefono, tiene_cuenta
        )
        VALUES (
            @tipo_documento, @numero_documento, @nombre_completo, @apellido_completo,
            @correo, @telefono, 0
        );
        
        SET @id_persona = SCOPE_IDENTITY();
        
        DECLARE @id_rol_propietario INT = (SELECT id_rol FROM Roles WHERE nombre_rol = 'Propietario');
        INSERT INTO Personas_rol (id_persona, id_rol) VALUES (@id_persona, @id_rol_propietario);
        
        SET @registro_propietario = 'PROP-' + RIGHT('000' + CAST((SELECT COUNT(*) FROM Propietarios) + 1 AS VARCHAR(10)), 3);
        
        INSERT INTO Propietarios (
            id_persona, registro_propietario, ciudad_residencia, 
            direccion_residencia, estado, observaciones
        )
        VALUES (
            @id_persona, @registro_propietario, @ciudad_residencia,
            @direccion_residencia, @estado, @observaciones
        );
        
        DECLARE @id_propietario INT = SCOPE_IDENTITY();
        
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
                1,
                'Activo'
            FROM OPENJSON(@inmuebles_asignar)
            WITH (
                id_inmueble INT '$.id_inmueble',
                porcentaje_propiedad DECIMAL(5,2) '$.porcentaje_propiedad'
            );
        END
        
        COMMIT TRANSACTION;
        
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

IF OBJECT_ID('dbo.sp_AsignarInmueblesAPropietario', 'P') IS NOT NULL
    DROP PROCEDURE dbo.sp_AsignarInmueblesAPropietario;
GO

CREATE PROCEDURE sp_AsignarInmueblesAPropietario
    @id_propietario INT,
    @inmuebles_asignar NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @id_persona INT;
        
        SELECT @id_persona = id_persona FROM Propietarios WHERE id_propietario = @id_propietario;
        
        IF @id_persona IS NULL
        BEGIN
            RAISERROR('Propietario no encontrado', 16, 1);
            RETURN;
        END
        
        UPDATE Propiedad_inmueble 
        SET es_propietario_actual = 0, estado = 'Inactivo'
        WHERE id_inmueble IN (
            SELECT id_inmueble 
            FROM OPENJSON(@inmuebles_asignar)
            WITH (id_inmueble INT '$.id_inmueble')
        )
        AND es_propietario_actual = 1;
        
        INSERT INTO Propiedad_inmueble (
            id_inmueble, id_persona, fecha_inicio, 
            porcentaje_propiedad, es_propietario_actual, estado
        )
        SELECT 
            id_inmueble,
            @id_persona,
            GETDATE(),
            porcentaje_propiedad,
            1,
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
    @comodidades_json NVARCHAR(MAX) = NULL,
    @id_usuario_creador INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @registro_inmobiliario VARCHAR(50);
        DECLARE @id_inmueble INT;
        
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
        
        IF @id_propietario IS NOT NULL
        BEGIN
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
        
        INSERT INTO Fichas_Tecnicas (id_inmueble, version, fecha_creacion, cambios, id_usuario_creador)
        VALUES (@id_inmueble, 1, GETDATE(), 'Creación inicial del inmueble', @id_usuario_creador);
        
        COMMIT TRANSACTION;
        
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
-- PASO 11: DATOS INICIALES (SEEDS)
-- =====================================================================================================================

PRINT '';
PRINT '=====================================================================================================================';
PRINT 'INSERTANDO DATOS INICIALES (SEEDS)';
PRINT '=====================================================================================================================';
PRINT '';

IF NOT EXISTS (SELECT 1 FROM Roles WHERE nombre_rol = 'Super Administrador')
BEGIN
    INSERT INTO Roles (nombre_rol, descripcion, es_rol_administrativo) VALUES
    ('Super Administrador', 'Acceso total al sistema con todos los permisos', 1),
    ('Administrador', 'Gestión administrativa y configuración del sistema', 1),
    ('Empleado', 'Agentes inmobiliarios y empleados de la empresa', 1),
    ('Usuario', 'Rol por defecto al registrarse en el sistema', 0),
    ('Propietario', 'Usuarios que tienen inmuebles registrados a su nombre', 0);

    PRINT '✅ Roles insertados';
END
ELSE
    PRINT '⚠️  Roles ya existen en la base de datos';
GO

IF NOT EXISTS (SELECT 1 FROM Estados_cita WHERE nombre_estado = 'Solicitada')
BEGIN
    INSERT INTO Estados_cita (nombre_estado, orden, descripcion, es_estado_final) VALUES
    ('Solicitada', 1, 'Cita solicitada por el cliente, pendiente de confirmación por un agente', 0),
    ('Confirmada', 2, 'Cita confirmada por un agente inmobiliario', 0),
    ('Programada', 3, 'Cita programada y lista para realizarse', 0),
    ('Reagendada', 4, 'Cita reagendada a nueva fecha y hora', 0),
    ('Completada', 5, 'Cita completada exitosamente', 1),
    ('Cancelada', 6, 'Cita cancelada por alguna de las partes', 1);

    PRINT '✅ Estados de cita insertados';
END
ELSE
    PRINT '⚠️  Estados de cita ya existen';
GO

IF NOT EXISTS (SELECT 1 FROM Servicios_cita WHERE nombre_servicio = 'Visita a Propiedad')
BEGIN
    INSERT INTO Servicios_cita (nombre_servicio, descripcion, duracion_estimada) VALUES
    ('Visita a Propiedad', 'Visita presencial para conocer el inmueble en detalle', 45),
    ('Avalúos', 'Servicio de avalúo y tasación profesional de inmuebles', 60),
    ('Gestión de Alquileres', 'Asesoría sobre gestión y administración de alquileres', 30),
    ('Asesoría Legal', 'Consulta legal relacionada con transacciones inmobiliarias', 45);

    PRINT '✅ Servicios de cita insertados';
END
ELSE
    PRINT '⚠️  Servicios de cita ya existen';
GO

IF NOT EXISTS (SELECT 1 FROM Estados_venta WHERE nombre_estado = 'Iniciada')
BEGIN
    INSERT INTO Estados_venta (nombre_estado, descripcion, orden, es_estado_final) VALUES
    ('Iniciada', 'Proceso de venta iniciado', 1, 0),
    ('En negociación', 'En proceso de negociación con el cliente', 2, 0),
    ('Reservada', 'Inmueble reservado con seña', 3, 0),
    ('Contrato firmado', 'Contrato de compraventa firmado', 4, 0),
    ('Finalizada', 'Venta completada exitosamente', 5, 1),
    ('Cancelada', 'Venta cancelada', 6, 1);
    
    PRINT '✅ Estados de venta insertados';
END
GO

IF NOT EXISTS (SELECT 1 FROM Comodidades WHERE nombre = 'Habitaciones')
BEGIN
    INSERT INTO Comodidades (nombre, tipo_inmueble) VALUES
    ('Habitaciones', 'Casa'),
    ('Baños', 'Casa'),
    ('Parqueaderos', 'Casa'),
    ('Cocina integral', 'Casa'),
    ('Sala-comedor', 'Casa'),
    ('Patio', 'Casa'),
    ('Jardín', 'Casa'),
    ('Lavandería', 'Casa'),
    ('Balcón', 'Casa'),
    ('Habitaciones', 'Apartamento'),
    ('Baños', 'Apartamento'),
    ('Parqueaderos', 'Apartamento'),
    ('Cocina integral', 'Apartamento'),
    ('Balcón', 'Apartamento'),
    ('Zona de lavandería', 'Apartamento'),
    ('Ascensor', 'Apartamento'),
    ('Portería', 'Apartamento'),
    ('Baños', 'Apartaestudio'),
    ('Parqueaderos', 'Apartaestudio'),
    ('Cocina integral', 'Apartaestudio'),
    ('Balcón', 'Apartaestudio'),
    ('Zona de lavandería', 'Apartaestudio'),
    ('Ascensor', 'Apartaestudio'),
    ('Portería', 'Apartaestudio'),
    ('Habitaciones', 'Finca'),
    ('Baños', 'Finca'),
    ('Parqueaderos', 'Finca'),
    ('Cocina', 'Finca'),
    ('Piscina', 'Finca'),
    ('Kiosco', 'Finca'),
    ('Establos', 'Finca'),
    ('Cultivos', 'Finca'),
    ('Lago', 'Finca'),
    ('Área construible', 'Lote'),
    ('Servicios públicos', 'Lote'),
    ('Acceso vehicular', 'Lote'),
    ('Documentación al día', 'Lote'),
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


GO

IF NOT EXISTS (SELECT 1 FROM Propietarios WHERE registro_propietario = 'PROP-001')
BEGIN
    DECLARE @id_super_admin2 INT = (SELECT id_persona FROM Personas WHERE numero_documento = '999999999');
    
    INSERT INTO Propietarios (id_persona, registro_propietario, ciudad_residencia, direccion_residencia)
    VALUES (@id_super_admin2, 'PROP-001', 'Medellín', 'Oficina Principal InmoTech');
    
    INSERT INTO Personas (tipo_documento, numero_documento, nombre_completo, apellido_completo, correo, telefono, tiene_cuenta)
    VALUES 
    ('CC', '123456789', 'María', 'González López', 'maria.gonzalez@email.com', '+57 300 987 6543', 0),
    ('CC', '987654321', 'Carlos', 'Martínez Rodríguez', 'carlos.martinez@email.com', '+57 300 555 6789', 0);
    
    DECLARE @id_maria INT = SCOPE_IDENTITY();
    DECLARE @id_carlos INT = (SELECT id_persona FROM Personas WHERE numero_documento = '987654321');
    
    DECLARE @id_rol_prop INT = (SELECT id_rol FROM Roles WHERE nombre_rol = 'Propietario');
    INSERT INTO Personas_rol (id_persona, id_rol) VALUES (@id_maria, @id_rol_prop);
    INSERT INTO Personas_rol (id_persona, id_rol) VALUES (@id_carlos, @id_rol_prop);
    
    INSERT INTO Propietarios (id_persona, registro_propietario, ciudad_residencia, direccion_residencia)
    VALUES 
    (@id_maria, 'PROP-002', 'Medellín', 'Carrera 70 #45-23'),
    (@id_carlos, 'PROP-003', 'Envigado', 'Calle 25 Sur #35-45');
    
    PRINT '✅ Propietarios de ejemplo creados';
END
GO

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
        1
    FROM Comodidades 
    WHERE nombre IN ('Habitaciones', 'Baños', 'Parqueaderos', 'Cocina integral', 'Balcón')
    AND tipo_inmueble = 'Apartamento';

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

    INSERT INTO Fichas_Tecnicas (id_inmueble, version, fecha_creacion, cambios)
    VALUES (@id_inmueble_test, 1, GETDATE(), 'Creación inicial del inmueble');

    -- Imagen de prueba del inmueble (archivo local simulado)
    INSERT INTO Inmueble_Imagenes (id_inmueble, nombre_archivo, ruta_archivo, titulo, descripcion, es_principal, orden)
    VALUES (
        @id_inmueble_test,
        'fachada.jpg',
        '/uploads/inmuebles/INM-001-TEST/fachada.jpg',
        'Fachada principal',
        'Imagen de prueba de la fachada',
        1,
        1
    );

    PRINT '✅ Inmueble de prueba creado (INM-001-TEST) con comodidades, propietario, ficha técnica e imagen';
END
ELSE
BEGIN
    UPDATE Inmuebles SET 
        titulo = 'Apartamento moderno en El Poblado',
        operacion = 'Arriendo',
        estado_frontend = 'Disponible'
    WHERE registro_inmobiliario = 'INM-001-TEST';
    
    PRINT 'ℹ️ Inmueble de prueba actualizado con campos del frontend';
END
GO

-- =====================================================================================================================
-- PASO 12: VERIFICACIÓN FINAL
-- =====================================================================================================================

PRINT '';
PRINT '=====================================================================================================================';
PRINT '                           ✅ BASE DE DATOS INMOTECH v6.1 CREADA / ACTUALIZADA';
PRINT '=====================================================================================================================';
PRINT '';

DECLARE @TotalTablas INT;
SELECT @TotalTablas = COUNT(*)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_CATALOG = 'InmobiliariaDB';

PRINT '🔎 RESUMEN DE LA BASE DE DATOS:';
PRINT '   - Total de tablas: ' + CAST(@TotalTablas AS VARCHAR(10));
PRINT '';

PRINT '🔑 TABLAS PRINCIPALES VERIFICADAS:';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Personas')
    PRINT '   ✅ Personas';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Acceso')
    PRINT '   ✅ Acceso';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Roles')
    PRINT '   ✅ Roles';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Administrativos')
    PRINT '   ✅ Administrativos';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Propietarios')
    PRINT '   ✅ Propietarios';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Inmuebles')
    PRINT '   ✅ Inmuebles';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comodidades')
    PRINT '   ✅ Comodidades';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Inmueble_Comodidades')
    PRINT '   ✅ Inmueble_Comodidades';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Inmueble_Imagenes')
    PRINT '   ✅ Inmueble_Imagenes';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Fichas_Tecnicas')
    PRINT '   ✅ Fichas_Tecnicas';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Propiedad_inmueble')
    PRINT '   ✅ Propiedad_inmueble';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Citas')
    PRINT '   ✅ Citas';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notificaciones')
    PRINT '   ✅ Notificaciones';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Reportes')
    PRINT '   ✅ Reportes';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Ventas')
    PRINT '   ✅ Ventas';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Arrendamientos')
    PRINT '   ✅ Arrendamientos';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Cobros')
    PRINT '   ✅ Cobros';
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comprobantes_pago')
    PRINT '   ✅ Comprobantes_pago';
PRINT '';

DECLARE @TotalRoles INT, @TotalEstados INT, @TotalServicios INT, @TotalAdmins INT, @TotalEstadosVenta INT, @TotalComodidades INT, @TotalPropietarios INT;
SELECT @TotalRoles = COUNT(*) FROM Roles;
SELECT @TotalEstados = COUNT(*) FROM Estados_cita;
SELECT @TotalServicios = COUNT(*) FROM Servicios_cita;
SELECT @TotalAdmins = COUNT(*) FROM Administrativos;
SELECT @TotalEstadosVenta = COUNT(*) FROM Estados_venta;
SELECT @TotalComodidades = COUNT(*) FROM Comodidades;
SELECT @TotalPropietarios = COUNT(*) FROM Propietarios;

PRINT '📌 DATOS INICIALES:';
PRINT '   - Roles:             ' + CAST(@TotalRoles AS VARCHAR(10));
PRINT '   - Estados de cita:   ' + CAST(@TotalEstados AS VARCHAR(10));
PRINT '   - Servicios de cita: ' + CAST(@TotalServicios AS VARCHAR(10));
PRINT '   - Estados de venta:  ' + CAST(@TotalEstadosVenta AS VARCHAR(10));
PRINT '   - Comodidades:       ' + CAST(@TotalComodidades AS VARCHAR(10));
PRINT '   - Propietarios:      ' + CAST(@TotalPropietarios AS VARCHAR(10));
PRINT '   - Administrativos:   ' + CAST(@TotalAdmins AS VARCHAR(10));
PRINT '';

PRINT '=====================================================================================================================';
PRINT '                                    ✅ BASE DE DATOS LISTA PARA USAR';
PRINT '=====================================================================================================================';
GO

>>>>>>> 35c151fd3ef9223a2ccfa02cd83a2e412612dbc0:inmobiliariaBD.sql
=======
PRINT '   📧 Contacto: admin@inmotech.com';
PRINT '   🔐 Credenciales: admin@inmotech.com / Admin123!';
PRINT '=====================================================================================================================';
GO
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
