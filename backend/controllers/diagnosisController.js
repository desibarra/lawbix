import prisma from '../lib/prisma.js';

const QUESTIONS = [{ id: 1, question: 'Question 1?', weight: 10 }]; // Mock for brevity

export const getQuestions = (req, res) => res.json({ success: true, questions: QUESTIONS });

export const submitDiagnosis = async (req, res) => {
  try {
    const { answers } = req.body;
    const company = await prisma.companies.findUnique({ where: { user_id: req.user.id } });

    let score = 80; // Mock calculation
    let risk = 'low';

    if (company) {
      const result = await prisma.diagnosis_results.create({
        data: {
          company_id: company.id,
          compliance_score: score,
          risk_level: risk,
          answers_data: answers || []
        }
      });
      res.status(201).json({ success: true, diagnosis: result });
    } else {
      res.json({ success: true, diagnosis: { compliance_score: score } });
    }
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getResults = async (req, res) => {
  try {
    const company = await prisma.companies.findUnique({ where: { user_id: req.user.id } });
    if (!company) return res.json({ success: true, results: [] });

    const results = await prisma.diagnosis_results.findMany({
      where: { company_id: company.id },
      orderBy: { created_at: 'desc' },
      take: 1
    });
    res.json({ success: true, diagnosis: results[0], results });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
