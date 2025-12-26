import prisma from '../lib/prisma.js';

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    const response = "Respuesta automática: " + message;

    await prisma.chat_history.createMany({
      data: [
        { user_id: userId, message, sender: 'user' },
        { user_id: userId, message: response, sender: 'bot' }
      ]
    });
    res.json({ success: true, response });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const getChatHistory = async (req, res) => {
  try {
    const msgs = await prisma.chat_history.findMany({ where: { user_id: req.user.id }, take: 50, orderBy: { created_at: 'desc' } });
    res.json({ success: true, messages: msgs.reverse() });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

export const clearHistory = async (req, res) => {
  try {
    await prisma.chat_history.deleteMany({ where: { user_id: req.user.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
