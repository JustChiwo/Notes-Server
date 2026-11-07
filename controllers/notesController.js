// Use the signed-in user's client so Supabase applies row-level security.
const { getUserClient } = require('../config/supabase');

// Get the signed-in user's notes, newest first.
async function getNotes(req, res) {
  try {
    const { data, error } = await getUserClient(req.token)
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Get notes failed:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
}

// Create a note owned by the signed-in user.
async function createNote(req, res) {
  try {
    const { title, content } = req.body || {};

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const { data, error } = await getUserClient(req.token)
      .from('notes')
      .insert({
        title,
        content: content === undefined ? '' : content,
        user_id: req.user.id,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error('Create note failed:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
}

// Update the supplied fields on a note owned by the signed-in user.
async function updateNote(req, res) {
  try {
    const { title, content } = req.body || {};

    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ message: 'Title cannot be empty.' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;

    const { data, error } = await getUserClient(req.token)
      .from('notes')
      .update(updates)
      .eq('id', req.params.id)
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('Update note failed:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
}

// Delete a note and confirm that a row was removed.
async function deleteNote(req, res) {
  try {
    const { data, error } = await getUserClient(req.token)
      .from('notes')
      .delete()
      .eq('id', req.params.id)
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    return res.status(200).json({ message: 'Note deleted successfully.' });
  } catch (error) {
    console.error('Delete note failed:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
}

module.exports = { getNotes, createNote, updateNote, deleteNote };
