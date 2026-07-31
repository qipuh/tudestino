import sequelize from '../../config/database-mysql.js';
import Department from './department.model.js';
import Province from './province.model.js';
import District from './district.model.js';
import Country from '../countries/country.model.js';
import { Op } from 'sequelize';

export const getCountries = async (req, res) => {
  try {
    const countries = await Country.findAll({
      where: { active: true },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: countries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const { countryId } = req.params;
    const departments = await Department.findAll({
      where: { countryId },
      order: [['name', 'ASC']],
      include: [
        { model: Country, as: 'country', attributes: ['id', 'name', 'code'] },
      ],
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProvinces = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const provinces = await Province.findAll({
      where: { departmentId },
      order: [['name', 'ASC']],
      include: [
        { model: Department, as: 'department', attributes: ['id', 'name', 'code'] },
      ],
    });
    res.json({ success: true, data: provinces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const { provinceId } = req.params;
    const districts = await District.findAll({
      where: { provinceId },
      order: [['name', 'ASC']],
      include: [
        { model: Province, as: 'province', attributes: ['id', 'name', 'code'] },
      ],
    });
    res.json({ success: true, data: districts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchDistricts = async (req, res) => {
  try {
    const { q, countryId } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = `%${q.trim()}%`;
    let whereClause = {
      [Op.or]: [
        { name: { [Op.like]: searchTerm } },
        { code: { [Op.like]: searchTerm } },
      ],
    };

    if (countryId) {
      whereClause.provinceId = {
        [Op.in]: sequelize.literal(
          `(SELECT p.id FROM provinces p JOIN departments d ON p.department_id = d.id WHERE d.country_id = ${countryId})`
        ),
      };
    }

    const districts = await District.findAll({
      where: whereClause,
      include: [
        {
          model: Province,
          as: 'province',
          attributes: ['id', 'name', 'code'],
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name', 'code'],
              include: [
                { model: Country, as: 'country', attributes: ['id', 'name', 'code'] },
              ],
            },
          ],
        },
      ],
      limit: 20,
      order: [['name', 'ASC']],
    });

    res.json({ success: true, data: districts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDistrictById = async (req, res) => {
  try {
    const { districtId } = req.params;
    const district = await District.findByPk(districtId, {
      include: [
        {
          model: Province,
          as: 'province',
          include: [
            {
              model: Department,
              as: 'department',
              include: [{ model: Country, as: 'country' }],
            },
          ],
        },
      ],
    });

    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }

    res.json({ success: true, data: district });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
