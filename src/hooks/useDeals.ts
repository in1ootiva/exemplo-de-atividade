import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DealCard } from '@/types';
import { useAuth } from './useAuth';

export function useDeals() {
  const [deals, setDeals] = useState<DealCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDeals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true });

      if (fetchError) throw fetchError;
      setDeals(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const addDeal = async (deal: Omit<DealCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const newDeal = {
        ...deal,
        user_id: user.id,
      };

      const { data, error: insertError } = await supabase
        .from('deals')
        .insert([newDeal])
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) setDeals([...deals, data]);
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding deal:', err);
      throw err;
    }
  };

  const updateDeal = async (id: string, updates: Partial<DealCard>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setDeals(deals.map((deal) => (deal.id === id ? data : deal)));
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating deal:', err);
      throw err;
    }
  };

  const updateMultipleDeals = async (updates: { id: string; data: Partial<DealCard> }[]) => {
    try {
      // Atualizar em lote
      const promises = updates.map(({ id, data }) =>
        supabase.from('deals').update(data).eq('id', id).select().single()
      );

      const results = await Promise.all(promises);
      
      // Verificar erros
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error('Error updating multiple deals');
      }

      // Atualizar estado local
      const updatedDeals = results.map((r) => r.data).filter(Boolean) as DealCard[];
      setDeals((current) =>
        current.map((deal) => {
          const updated = updatedDeals.find((u) => u.id === deal.id);
          return updated || deal;
        })
      );
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating multiple deals:', err);
      throw err;
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setDeals(deals.filter((deal) => deal.id !== id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting deal:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [user]);

  return {
    deals,
    loading,
    error,
    addDeal,
    updateDeal,
    updateMultipleDeals,
    deleteDeal,
    refetch: fetchDeals,
  };
}

