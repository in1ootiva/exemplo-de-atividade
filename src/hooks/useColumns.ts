import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Column, DEFAULT_COLUMNS } from '@/types';
import { useAuth } from './useAuth';

export function useColumns() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchColumns = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('columns')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true });

      if (fetchError) throw fetchError;

      // Se não houver colunas, criar as colunas padrão
      if (!data || data.length === 0) {
        await initializeDefaultColumns();
      } else {
        setColumns(data);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching columns:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultColumns = async () => {
    if (!user) return;

    try {
      const defaultColumnsWithUserId = DEFAULT_COLUMNS.map((col) => ({
        ...col,
        user_id: user.id,
      }));

      const { data, error: insertError } = await supabase
        .from('columns')
        .insert(defaultColumnsWithUserId)
        .select();

      if (insertError) throw insertError;
      if (data) setColumns(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error initializing columns:', err);
    }
  };

  const addColumn = async (title: string, color?: string) => {
    if (!user) return;

    try {
      const newColumn = {
        user_id: user.id,
        title,
        order: columns.length,
        color: color || '#6366f1',
      };

      const { data, error: insertError } = await supabase
        .from('columns')
        .insert([newColumn])
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) setColumns([...columns, data]);
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding column:', err);
    }
  };

  const updateColumn = async (id: string, updates: Partial<Column>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('columns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setColumns(columns.map((col) => (col.id === id ? data : col)));
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating column:', err);
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setColumns(columns.filter((col) => col.id !== id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting column:', err);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [user]);

  return {
    columns,
    loading,
    error,
    addColumn,
    updateColumn,
    deleteColumn,
    refetch: fetchColumns,
  };
}

