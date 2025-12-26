import prisma from '../lib/prisma.js';

export const getRisks = async (req, res) => {
  try {
    const company = await prisma.companies.findUnique({ where: { user_id: req.user.id } });
    if (!company) return res.json({ success: true, risks: [] });

    const risks = await prisma.risks.findMany({ where: { company_id: company.id } });
    res.json({ success: true, risks });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const createRisk = async (req, res) => {
  try {
    const { title, severity } = req.body;
    const company = await prisma.companies.findUnique({ where: { user_id: req.user.id } });
    if (!company) return res.status(400).json({ success: false, message: 'No company' });

    const risk = await prisma.risks.create({
      data: {
        company_id: company.id,
        title,
        severity,
        status: 'open'
      }
    });
    res.status(201).json({ success: true, risk });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const updateRisk = async (req, res) => {
  try {
    await prisma.risks.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    res.json({ success: true, message: 'Updated' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const deleteRisk = async (req, res) => {
  try {
    await prisma.risks.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
