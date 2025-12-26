import prisma from '../lib/prisma.js';

export const getRoadmap = async (req, res) => {
  try {
    const company = await prisma.companies.findUnique({ where: { user_id: req.user.id } });
    if (!company) return res.json({ success: true, roadmap: [] });

    const items = await prisma.roadmap_items.findMany({
      where: { company_id: company.id },
      orderBy: { priority: 'asc' }
    });
    res.json({ success: true, roadmap: items });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const createRoadmapItem = async (req, res) => {
  try {
    const { title, priority, due_date } = req.body;
    const company = await prisma.companies.findUnique({ where: { user_id: req.user.id } });
    if (!company) return res.status(400).json({ success: false, message: 'No company' });

    const item = await prisma.roadmap_items.create({
      data: {
        company_id: company.id,
        title,
        priority: priority || 'Medium',
        due_date: due_date ? new Date(due_date) : null,
        status: 'pending'
      }
    });
    res.json({ success: true, item });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const updateRoadmapItem = async (req, res) => {
  try {
    const updated = await prisma.roadmap_items.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    res.json({ success: true, data: updated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const deleteRoadmapItem = async (req, res) => {
  try {
    await prisma.roadmap_items.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
