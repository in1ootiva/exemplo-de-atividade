import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailQuota, QuotaStatus } from '@/types';

export function useEmailQuota() {
  const [quota, setQuota] = useState<EmailQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = async () => {
    try {
      setLoading(true);
      
      // Buscar a quota (deve ter apenas 1 registro)
      const { data, error: fetchError } = await supabase
        .from('email_quota')
        .select('*')
        .single();

      if (fetchError) {
        // Se não existir, criar
        if (fetchError.code === 'PGRST116') {
          const { data: newQuota, error: insertError } = await supabase
            .from('email_quota')
            .insert([{
              daily_count: 0,
              daily_limit: 100,
              last_reset: new Date().toISOString().split('T')[0],
              warning_threshold: 80,
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          setQuota(newQuota);
        } else {
          throw fetchError;
        }
      } else {
        setQuota(data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching email quota:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetIfNeeded = async (): Promise<boolean> => {
    if (!quota) return false;

    try {
      const hoje = new Date().toISOString().split('T')[0];
      const lastReset = quota.last_reset.split('T')[0];

      // Se a última reset foi antes de hoje, resetar
      if (lastReset < hoje) {
        const { data, error } = await supabase
          .from('email_quota')
          .update({
            daily_count: 0,
            last_reset: hoje,
          })
          .eq('id', quota.id)
          .select()
          .single();

        if (error) throw error;
        setQuota(data);
        return true;
      }

      return false;
    } catch (err: any) {
      setError(err.message);
      console.error('Error resetting quota:', err);
      return false;
    }
  };

  const incrementCount = async (amount: number = 1): Promise<boolean> => {
    if (!quota) return false;

    try {
      // Resetar se necessário antes de incrementar
      await resetIfNeeded();

      const newCount = quota.daily_count + amount;

      const { data, error } = await supabase
        .from('email_quota')
        .update({ daily_count: newCount })
        .eq('id', quota.id)
        .select()
        .single();

      if (error) throw error;
      setQuota(data);
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error incrementing quota:', err);
      return false;
    }
  };

  const canSendEmail = (amount: number = 1): boolean => {
    if (!quota) return false;
    
    // Verificar se ultrapassaria o limite
    return (quota.daily_count + amount) <= quota.daily_limit;
  };

  const getQuotaStatus = (): QuotaStatus => {
    if (!quota) {
      return {
        current: 0,
        limit: 100,
        percentage: 0,
        canSend: false,
        status: 'safe',
      };
    }

    const percentage = (quota.daily_count / quota.daily_limit) * 100;
    
    let status: 'safe' | 'warning' | 'critical' | 'limit' = 'safe';
    if (quota.daily_count >= quota.daily_limit) {
      status = 'limit';
    } else if (percentage >= 95) {
      status = 'critical';
    } else if (percentage >= quota.warning_threshold) {
      status = 'warning';
    }

    return {
      current: quota.daily_count,
      limit: quota.daily_limit,
      percentage: Math.round(percentage),
      canSend: quota.daily_count < quota.daily_limit,
      status,
    };
  };

  const getRemainingEmails = (): number => {
    if (!quota) return 0;
    return Math.max(0, quota.daily_limit - quota.daily_count);
  };

  const getStatusColor = (): string => {
    const status = getQuotaStatus().status;
    
    switch (status) {
      case 'safe':
        return '#10b981'; // green
      case 'warning':
        return '#f59e0b'; // yellow
      case 'critical':
        return '#ef4444'; // red
      case 'limit':
        return '#991b1b'; // dark red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusMessage = (): string => {
    const status = getQuotaStatus();
    
    if (status.status === 'limit') {
      return 'Limite diário atingido! Aguarde o reset.';
    }
    
    if (status.status === 'critical') {
      return `Atenção! Apenas ${getRemainingEmails()} emails restantes hoje.`;
    }
    
    if (status.status === 'warning') {
      return `Aviso: ${getRemainingEmails()} emails restantes (${status.percentage}% usado).`;
    }
    
    return `${getRemainingEmails()} emails disponíveis hoje.`;
  };

  useEffect(() => {
    fetchQuota();
    
    // Verificar reset a cada minuto
    const interval = setInterval(() => {
      resetIfNeeded();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    quota,
    loading,
    error,
    incrementCount,
    canSendEmail,
    resetIfNeeded,
    getQuotaStatus,
    getRemainingEmails,
    getStatusColor,
    getStatusMessage,
    refetch: fetchQuota,
  };
}

