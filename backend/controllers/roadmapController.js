const pool = require('../database/db');

// @desc    Get roadmap for company
// @route   GET /api/roadmap
// @access  Private
exports.getRoadmap = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const userId = req.user.id;

    let items = [];

    // Try roadmap_items table first
    try {
      if (companyId) {
        [items] = await pool.query(
          'SELECT * FROM roadmap_items WHERE company_id = ? ORDER BY priority DESC, due_date ASC',
          [companyId]
        );
      } else {
        [items] = await pool.query(
          'SELECT * FROM roadmap_items WHERE user_id = ? ORDER BY priority DESC, due_date ASC',
          [userId]
        );
      }
    } catch (dbError) {
      // If roadmap_items doesn't exist, try roadmap_steps
      if (dbError.code === 'ER_NO_SUCH_TABLE') {
        console.log('roadmap_items table not found, trying roadmap_steps...');
        try {
          if (companyId) {
            [items] = await pool.query(
              'SELECT * FROM roadmap_steps WHERE company_id = ? ORDER BY order_index ASC',
              [companyId]
            );
          } else {
            [items] = await pool.query(
              'SELECT * FROM roadmap_steps WHERE user_id = ? ORDER BY order_index ASC',
              [userId]
            );
          }
        } catch (altError) {
          if (altError.code === 'ER_NO_SUCH_TABLE') {
            console.warn('Neither roadmap_items nor roadmap_steps tables exist. Returning empty roadmap.');
            // Return empty roadmap instead of error
            return res.status(200).json({
              success: true,
              count: 0,
              roadmap: [],
              message: 'Roadmap tables not yet created. Please run database migrations.'
            });
          }
          throw altError;
        }
      } else {
        throw dbError;
      }
    }

    res.status(200).json({
      success: true,
      count: items.length,
      roadmap: items
    });
  } catch (error) {
    console.error('Get roadmap error:', error);
    console.error('Error details:', {
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });

    res.status(500).json({
      success: false,
      message: 'Error fetching roadmap',
      error: error.message
    });
  }
};

// @desc    Get roadmap items by priority
// @route   GET /api/roadmap/priority/:level
// @access  Private
exports.getByPriority = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const priority = req.params.level;

    const [items] = await pool.query(
      'SELECT * FROM roadmap_items WHERE company_id = ? AND priority = ? ORDER BY due_date ASC',
      [companyId, priority]
    );

    res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    console.error('Get by priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching roadmap items'
    });
  }
};

// @desc    Create roadmap item
// @route   POST /api/roadmap
// @access  Private
exports.createRoadmapItem = async (req, res) => {
  try {
    const { title, description, priority, due_date, category } = req.body;
    const companyId = req.user.company_id;

    const [result] = await pool.query(
      'INSERT INTO roadmap_items (company_id, title, description, priority, due_date, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [companyId, title, description, priority, due_date, category, 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Roadmap item created',
      item: {
        id: result.insertId,
        title,
        priority,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Create roadmap item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating roadmap item'
    });
  }
};

// @desc    Update roadmap item
// @route   PUT /api/roadmap/:id
// @access  Private
exports.updateRoadmapItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { title, description, priority, due_date, status } = req.body;

    await pool.query(
      'UPDATE roadmap_items SET title = ?, description = ?, priority = ?, due_date = ?, status = ? WHERE id = ?',
      [title, description, priority, due_date, status, itemId]
    );

    res.status(200).json({
      success: true,
      message: 'Roadmap item updated'
    });
  } catch (error) {
    console.error('Update roadmap item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating roadmap item'
    });
  }
};

// @desc    Mark roadmap item as completed
// @route   PATCH /api/roadmap/:id/complete
// @access  Private
exports.markAsCompleted = async (req, res) => {
  try {
    const itemId = req.params.id;

    await pool.query(
      'UPDATE roadmap_items SET status = ?, completed_at = NOW() WHERE id = ?',
      ['completed', itemId]
    );

    res.status(200).json({
      success: true,
      message: 'Roadmap item marked as completed'
    });
  } catch (error) {
    console.error('Mark as completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking item as completed'
    });
  }
};

// @desc    Delete roadmap item
// @route   DELETE /api/roadmap/:id
// @access  Private
exports.deleteRoadmapItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    await pool.query('DELETE FROM roadmap_items WHERE id = ?', [itemId]);

    res.status(200).json({
      success: true,
      message: 'Roadmap item deleted'
    });
  } catch (error) {
    console.error('Delete roadmap item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting roadmap item'
    });
  }
};
