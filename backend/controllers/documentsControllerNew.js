import prisma from '../lib/prisma.js';

export const listDocuments = async (req, res) => {
  try {
    const company = await prisma.companies.findUnique({ where: { user_id: req.user.id } });
    if (!company) return res.json({ success: true, documents: [] });
    const docs = await prisma.documents.findMany({ where: { company_id: company.id }, orderBy: { created_at: 'desc' } });
    res.json({ success: true, documents: docs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const generateDocument = async (req, res) => {
  try {
    const { type } = req.body;
    const company = await prisma.companies.findUnique({ where: { user_id: req.user.id } });
    if (!company) return res.status(400).json({ success: false, message: 'No company' });

    // Mock PDF generation logic
    const doc = await prisma.documents.create({
      data: {
        company_id: company.id,
        name: type === 'risk' ? 'Risk Matrix' : 'Diagnosis Report',
        type: 'PDF',
        url: '/documents/mock.pdf'
      }
    });
    res.status(201).json({ success: true, document: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const deleteDocument = async (req, res) => {
  try {
    await prisma.documents.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getTemplates = async (req, res) => {
  res.json({ success: true, templates: [{ id: 'diag', name: 'Diagnosis' }, { id: 'risk', name: 'Risk' }] });
};
