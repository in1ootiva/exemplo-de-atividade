import { useEmailQuota } from '@/hooks/useEmailQuota';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Mail, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailQuotaDashboardProps {
  onViewLogs?: () => void;
}

export function EmailQuotaDashboard({ onViewLogs }: EmailQuotaDashboardProps) {
  const {
    loading,
    getQuotaStatus,
    getRemainingEmails,
    getStatusColor,
    getStatusMessage,
  } = useEmailQuota();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = getQuotaStatus();
  const statusColor = getStatusColor();
  const statusMessage = getStatusMessage();

  const getIcon = () => {
    switch (status.status) {
      case 'safe':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
      case 'limit':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Mail className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (status.status) {
      case 'safe':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
      case 'limit':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`border-2 ${getBackgroundColor()}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {getIcon()}
          <span>Quota de Emails</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Barra de Progresso */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-3xl font-bold">{status.current}</span>
              <span className="text-sm text-gray-600">de {status.limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(status.percentage, 100)}%`,
                  backgroundColor: statusColor,
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-600">{status.percentage}% usado</span>
              <span className="text-xs font-semibold" style={{ color: statusColor }}>
                {getRemainingEmails()} restantes
              </span>
            </div>
          </div>

          {/* Mensagem de Status */}
          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{statusMessage}</p>
          </div>

          {/* Botão de Logs */}
          {onViewLogs && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={onViewLogs}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver Histórico
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

