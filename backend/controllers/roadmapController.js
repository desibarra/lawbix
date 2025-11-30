import { supabase } from '../lib/db.js';

// @desc    Get roadmap for company
// @route   GET /api/roadmap
// @access  Private
export const getRoadmap = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const userId = req.user.id;

    let items = [];
    let error = null;

    // Try roadmap_items table first
    if (companyId) {
      const { data, error: dbError } = await supabase
        .from('roadmap_items')
        .select('*')
        .eq('company_id', companyId)
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true });

      if (!dbError) items = data;
      else error = dbError;
    } else {
      const { data, error: dbError } = await supabase
        .from('roadmap_items')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true });

      if (!dbError) items = data;
      else error = dbError;
    }

    if (error) {
      // If roadmap_items fails (e.g. table doesn't exist), try roadmap_steps
      if (error.code === '42P01') { // Postgres "undefined_table"
        console.log('roadmap_items table not found, trying roadmap_steps...');
        let stepError = null;
        if (companyId) {
          const { data, error: altError } = await supabase
            .from('roadmap_steps')
            .select('*')
            .eq('company_id', companyId)
            .order('order_index', { ascending: true });
          if (!altError) items = data;
          else stepError = altError;
        } else {
          const { data, error: altError } = await supabase
            .from('roadmap_steps')
            .select('*')
            .eq('user_id', userId)
            .order('order_index', { ascending: true });
          if (!altError) items = data;
          else stepError = altError;
        }

        if (stepError) {
          if (stepError.code === '42P01') {
            console.warn('Neither roadmap_items nor roadmap_steps tables exist. Returning empty roadmap.');
            return res.status(200).json({
              success: true,
              count: 0,
              roadmap: [],
              message: 'Roadmap tables not yet created.'
            });
          }
          throw stepError;
        }
      } else {
        throw error;
      }
    }

    res.status(200).json({
      success: true,
      count: items ? items.length : 0,
      roadmap: items || []
    });
  } catch (error) {
    console.error('Get roadmap error:', error);
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
export const getByPriority = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const priority = req.params.level;

    const { data: items, error } = await supabase
      .from('roadmap_items')
      .select('*')
      .eq('company_id', companyId)
      .eq('priority', priority)
      .order('due_date', { ascending: true });

    if (error) throw error;

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
export const createRoadmapItem = async (req, res) => {
  try {
    const { title, description, priority, due_date, category } = req.body;
    const companyId = req.user.company_id;

    const { data: newItem, error } = await supabase
      .from('roadmap_items')
      .insert([
        {
          company_id: companyId,
          title,
          description,
          priority,
          due_date,
          category,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Roadmap item created',
      item: newItem
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
export const updateRoadmapItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { title, description, priority, due_date, status } = req.body;

    const { error } = await supabase
      .from('roadmap_items')
      .update({
        title,
        description,
        priority,
        due_date,
        status
      })
      .eq('id', itemId);

    if (error) throw error;

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
export const markAsCompleted = async (req, res) => {
  try {
    const itemId = req.params.id;

    const { error } = await supabase
      .from('roadmap_items')
      .update({
        status: 'completed',
        completed_at: new Date()
      })
      .eq('id', itemId);

    if (error) throw error;

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
export const deleteRoadmapItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    const { error } = await supabase
      .from('roadmap_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

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
