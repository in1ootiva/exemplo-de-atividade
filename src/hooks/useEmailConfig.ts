import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EmailConfig } from '@/types';
import { useAuth } from './useAuth';

export function useEmailConfig() {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchConfig = async () => {
    if (!user) {
      setConfig(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('email_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // Se não existir, criar configuração padrão
        if (fetchError.code === 'PGRST116') {
          const { data: newConfig, error: insertError } = await supabase
            .from('email_config')
            .insert([{
              user_id: user.id,
              auto_envio_ativo: false,
              horario_envio: '18:00',
              emails_destinatarios: [user.email || ''],
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          setConfig(newConfig);
        } else {
          throw fetchError;
        }
      } else {
        setConfig(data);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching email config:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<EmailConfig>) => {
    if (!user || !config) return;

    try {
      const { data, error: updateError } = await supabase
        .from('email_config')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setConfig(data);
      setError(null);
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating email config:', err);
      throw err;
    }
  };

  const toggleAutoEnvio = async () => {
    if (!config) return;
    
    return updateConfig({ auto_envio_ativo: !config.auto_envio_ativo });
  };

  const setHorarioEnvio = async (horario: string) => {
    return updateConfig({ horario_envio: horario });
  };

  const addDestinatario = async (email: string) => {
    if (!config) return;
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }

    // Verificar se já existe
    if (config.emails_destinatarios.includes(email)) {
      throw new Error('Email já está na lista');
    }

    const novosDestinatarios = [...config.emails_destinatarios, email];
    return updateConfig({ emails_destinatarios: novosDestinatarios });
  };

  const removeDestinatario = async (email: string) => {
    if (!config) return;
    
    const novosDestinatarios = config.emails_destinatarios.filter(e => e !== email);
    return updateConfig({ emails_destinatarios: novosDestinatarios });
  };

  const setDestinatarios = async (emails: string[]) => {
    // Validar todos os emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailsInvalidos = emails.filter(email => !emailRegex.test(email));
    
    if (emailsInvalidos.length > 0) {
      throw new Error(`Emails inválidos: ${emailsInvalidos.join(', ')}`);
    }

    return updateConfig({ emails_destinatarios: emails });
  };

  const isAutoEnvioAtivo = (): boolean => {
    return config?.auto_envio_ativo || false;
  };

  const getHorarioEnvio = (): string => {
    return config?.horario_envio || '18:00';
  };

  const getDestinatarios = (): string[] => {
    return config?.emails_destinatarios || [];
  };

  const getTotalDestinatarios = (): number => {
    return config?.emails_destinatarios.length || 0;
  };

  useEffect(() => {
    fetchConfig();
  }, [user]);

  return {
    config,
    loading,
    error,
    updateConfig,
    toggleAutoEnvio,
    setHorarioEnvio,
    addDestinatario,
    removeDestinatario,
    setDestinatarios,
    isAutoEnvioAtivo,
    getHorarioEnvio,
    getDestinatarios,
    getTotalDestinatarios,
    refetch: fetchConfig,
  };
}

