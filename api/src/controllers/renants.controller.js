const renantService = require('../services/renants.service');
const logger = require('../utils/logger');

class RenantsController {
  async createRenant(req, res, next) {
    try {
      const data = req.body;
      const newRenant = await renantService.createRenant(data);
      return res.status(201).json({ 
        success: true, 
        message: 'Arrendatario creado exitosamente',
        data: newRenant 
      });
    } catch (error) {
      if (error.message.includes('ya está registrado')) {
        return res.status(400).json({ 
          success: false, 
          message: error.message 
        });
      }
      next(error);
    }
  }

  async getAllRenants(req, res, next) {
    try {
      const filters = {};

      if (req.query.status) {
        filters.status = req.query.status;
      }

      if (req.query.renant_type) {
        filters.renant_type = req.query.renant_type;
      }

      const renants = await renantService.getAllRenants(filters);

      return res.status(200).json({
        success: true,
        message: 'Arrendatarios obtenidos exitosamente',
        data: renants,
        total: renants.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getRenantById(req, res, next) {
    try {
      const { id } = req.params;
      const renant = await renantService.getRenantById(parseInt(id));

      if (!renant) {
        return res.status(404).json({
          success: false,
          message: 'Arrendatario no encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Arrendatario obtenido exitosamente',
        data: renant
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRenant(req, res, next) {
    try {
      const { id } = req.params;
      const renant = await renantService.updateRenant(parseInt(id), req.body);

      return res.status(200).json({
        success: true,
        message: 'Arrendatario actualizado exitosamente',
        data: renant
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateRenant(req, res, next) {
    try {
      const { id } = req.params;
      const renant = await renantService.deactivateRenant(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Arrendatario desactivado exitosamente',
        data: renant
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRenant(req, res, next) {
    try {
      const { id } = req.params;
      const renant = await renantService.deleteRenant(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Arrendatario eliminado definitivamente',
        data: renant
      });
    } catch (error) {
      next(error);
    }
  }

  async searchRenants(req, res, next) {
    try {
      const { criterio } = req.params;
      const criteria = req.query;

      const renants = await renantService.searchRenants(criteria);

      return res.status(200).json({
        success: true,
        message: 'Búsqueda completada',
        data: renants,
        total: renants.length
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RenantsController();
