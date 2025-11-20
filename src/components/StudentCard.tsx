import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { AlunoCardWithDetails } from '@/types';
import { Calendar, AlertCircle, Phone, Mail, CheckCircle } from 'lucide-react';

interface StudentCardProps {
  card: AlunoCardWithDetails;
  onClick: () => void;
}

export function StudentCard({ card, onClick }: StudentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getUrgencyColor = () => {
    if (card.faltas_consecutivas >= 3) return 'border-l-red-500 bg-red-50';
    if (card.faltas_consecutivas === 2) return 'border-l-orange-500 bg-orange-50';
    if (card.column_id === 'faltas_intercaladas') return 'border-l-pink-500 bg-pink-50';
    if (card.column_id === 'contato_realizado') return 'border-l-green-500 bg-green-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const getUrgencyBadge = () => {
    if (card.faltas_consecutivas >= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3" />
          URGENTE
        </span>
      );
    }
    if (card.faltas_consecutivas === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
          <AlertCircle className="h-3 w-3" />
          ATENÇÃO
        </span>
      );
    }
    return null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`mb-3 cursor-pointer transition-all hover:shadow-md ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <Card className={`border-l-4 ${getUrgencyColor()}`}>
        <CardContent className="p-4">
          {/* Nome e Badge */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm text-gray-900 flex-1">
              {card.aluno_nome}
            </h3>
            {getUrgencyBadge()}
          </div>

          {/* Estatísticas de Faltas e Atividades */}
          <div className="flex gap-3 mb-3">
            <div className="flex items-center gap-1 text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-lg text-red-600">
                  {card.total_faltas}
                </span>
                <span className="text-gray-500 text-[10px]">Total</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-lg text-orange-600">
                  {card.faltas_consecutivas}
                </span>
                <span className="text-gray-500 text-[10px]">Seguidas</span>
              </div>
            </div>
            {card.atividades_entregues !== undefined && (
              <div className="flex items-center gap-1 text-xs ml-auto">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-lg text-green-600">
                    {card.atividades_entregues}
                  </span>
                  <span className="text-gray-500 text-[10px] flex items-center gap-1">
                    <CheckCircle className="h-2.5 w-2.5" />
                    Atividades
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Última Falta */}
          {card.ultima_falta && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <Calendar className="h-3 w-3" />
              <span>
                Última falta: {new Date(card.ultima_falta).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}

          {/* Contatos */}
          <div className="space-y-1">
            {card.aluno_email && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{card.aluno_email}</span>
              </div>
            )}
            {card.aluno_telefone && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span>{card.aluno_telefone}</span>
              </div>
            )}
          </div>

          {/* Observação se existir */}
          {card.observacao && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 italic">
                "{card.observacao}"
              </p>
            </div>
          )}

          {/* Turma */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              {card.turma_nome}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

