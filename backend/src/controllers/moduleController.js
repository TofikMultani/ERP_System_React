/* eslint-disable no-undef */
/* eslint-env node */
const pool = require('../config/database');

const MODULE_SELECT = `
  SELECT
    module_key,
    label,
    is_active,
    price
  FROM module_catalog
  ORDER BY id ASC
`;

function mapModuleRow(row) {
  return {
    key: row.module_key,
    label: row.label,
    isActive: row.is_active,
    price: Number(row.price) || 0,
  };
}

const getModules = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';

    const query = includeInactive
      ? MODULE_SELECT
      : `${MODULE_SELECT.replace('ORDER BY id ASC', 'WHERE is_active = true ORDER BY id ASC')}`;

    const result = await pool.query(query);

    res.status(200).json({
      status: 'OK',
      data: result.rows.map(mapModuleRow),
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error fetching modules',
      error: error.message,
    });
  }
};

const updateModule = async (req, res) => {
  try {
    const { moduleKey } = req.params;
    const { isActive, price } = req.body;

    if (typeof isActive !== 'boolean' && typeof price !== 'number') {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Provide at least one valid field: isActive (boolean) or price (number)',
      });
    }

    if (typeof price === 'number' && price < 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Price must be zero or greater',
      });
    }

    const result = await pool.query(
      `
        UPDATE module_catalog
        SET
          is_active = COALESCE($2, is_active),
          price = COALESCE($3, price),
          updated_at = CURRENT_TIMESTAMP
        WHERE module_key = $1
        RETURNING module_key, label, is_active, price
      `,
      [
        moduleKey,
        typeof isActive === 'boolean' ? isActive : null,
        typeof price === 'number' ? price : null,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Module not found',
      });
    }

    res.status(200).json({
      status: 'OK',
      message: 'Module updated successfully',
      data: mapModuleRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Error updating module',
      error: error.message,
    });
  }
};

module.exports = {
  getModules,
  updateModule,
};
