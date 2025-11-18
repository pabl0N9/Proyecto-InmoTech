const { sequelize } = require('../config/database');

async function ensureRenantNullableFields() {
  const targetColumns = ['id_inmueble', 'fecha_inicio_arrendamiento', 'valor_arriendo_mensual'];
  const checkConstraints = ['CHK_Arrendatarios_ValorArriendo'];

  for (const column of targetColumns) {
    try {
      const results = await sequelize.query(
        `
          SELECT IS_NULLABLE
               ,DATA_TYPE
               ,CHARACTER_MAXIMUM_LENGTH
               ,NUMERIC_PRECISION
               ,NUMERIC_SCALE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = 'Arrendatarios'
            AND COLUMN_NAME = :columnName
        `,
        {
          replacements: { columnName: column },
          type: sequelize.QueryTypes.SELECT
        }
      );

      const columnInfo = results?.[0];
      const isNullable = columnInfo?.IS_NULLABLE;

      if (isNullable === 'NO' && columnInfo) {
        let sqlType = columnInfo.DATA_TYPE?.toUpperCase() || 'INT';

        if (['CHAR', 'VARCHAR', 'NCHAR', 'NVARCHAR'].includes(sqlType) && columnInfo.CHARACTER_MAXIMUM_LENGTH) {
          sqlType += `(${columnInfo.CHARACTER_MAXIMUM_LENGTH === -1 ? 'MAX' : columnInfo.CHARACTER_MAXIMUM_LENGTH})`;
        }

        if (['DECIMAL', 'NUMERIC'].includes(sqlType) && columnInfo.NUMERIC_PRECISION) {
          const precision = columnInfo.NUMERIC_PRECISION || 18;
          const scale = columnInfo.NUMERIC_SCALE || 0;
          sqlType += `(${precision},${scale})`;
        }

        await sequelize.query(
          `ALTER TABLE Arrendatarios ALTER COLUMN ${column} ${sqlType} NULL;`
        );
      }
    } catch (error) {
      console.error(
        `[Schema] No fue posible ajustar la columna ${column} de Arrendatarios: ${error.message}`
      );
      throw error;
    }
  }

  for (const constraintName of checkConstraints) {
    try {
      const query = `
        IF EXISTS (
          SELECT 1
          FROM sys.check_constraints
          WHERE name = :constraintName
            AND parent_object_id = OBJECT_ID('dbo.Arrendatarios')
        )
        BEGIN
          ALTER TABLE dbo.Arrendatarios DROP CONSTRAINT [${constraintName}];
        END
      `;
      await sequelize.query(query, {
        replacements: { constraintName }
      });
    } catch (error) {
      console.error(`[Schema] No fue posible eliminar la restriccion ${constraintName}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = {
  ensureRenantNullableFields
};
