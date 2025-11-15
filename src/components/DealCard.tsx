import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DealCard as DealCardType } from '@/types';
import { Mail, Phone, User, DollarSign } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DealCardProps {
  deal: DealCardType;
  onClick: () => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">{deal.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {deal.value && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-green-600">
                {formatCurrency(deal.value)}
              </span>
            </div>
          )}
          
          {deal.contact_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{deal.contact_name}</span>
            </div>
          )}
          
          {deal.contact_email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{deal.contact_email}</span>
            </div>
          )}
          
          {deal.contact_phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{deal.contact_phone}</span>
            </div>
          )}
          
          {deal.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-2 pt-2 border-t">
              {deal.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

