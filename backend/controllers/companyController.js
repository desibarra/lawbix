import prisma from '../lib/prisma.js';

export const upsertCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, industry, employees, incorporationDate, country, corporateVehicle } = req.body;

    // Check existing
    const existing = await prisma.companies.findUnique({ where: { user_id: userId } });

    let result;
    if (existing) {
      result = await prisma.companies.update({
        where: { id: existing.id },
        data: { name, industry, employees, incorporation_date: incorporationDate ? new Date(incorporationDate) : null, country, corporate_vehicle: corporateVehicle }
      });
    } else {
      result = await prisma.companies.create({
        data: { user_id: userId, name, industry, employees, incorporation_date: incorporationDate ? new Date(incorporationDate) : null, country, corporate_vehicle: corporateVehicle }
      });
      // Link to user
      await prisma.users.update({ where: { id: userId }, data: { company_id: result.id } });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const company = await prisma.companies.findUnique({ where: { id } });
    if (!company) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const list = await prisma.companies.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, companies: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCompany = async (req, res) => {
  // Admin only creation usually, but mapped for compatibility
  return upsertCompany(req, res);
};

export const updateCompany = async (req, res) => {
  // Mapped for compatibility
  return upsertCompany(req, res);
};

export const deleteCompany = async (req, res) => {
  try {
    await prisma.companies.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
