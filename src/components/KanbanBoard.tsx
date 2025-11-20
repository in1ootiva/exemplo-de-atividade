import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { StudentCard } from './StudentCard';
import { ObservacaoModal } from './ObservacaoModal';
import { DroppableColumn } from './DroppableColumn';
import { AlunoCardWithDetails, ColumnId, ACADEMIC_COLUMNS } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAlunoCards } from '@/hooks/useAlunoCards';
import { useAuth } from '@/hooks/useAuth';

export function KanbanBoard() {
  useAuth();
  const { cards, loading, moverCard } = useAlunoCards();
  const [activeCard, setActiveCard] = useState<AlunoCardWithDetails | null>(null);
  const [observacaoModalOpen, setObservacaoModalOpen] = useState(false);
  const [cardToMove, setCardToMove] = useState<{
    cardId: string;
    novaColuna: ColumnId;
    alunoNome: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeCard = cards.find((c) => c.id === activeId);
    if (!activeCard) return;

    // Verificar se o overId é uma coluna
    const overColumn = ACADEMIC_COLUMNS.find((col) => col.id === overId);
    if (!overColumn) return;

    const novaColuna = overColumn.id;

    // Se for mover para "Contato Realizado", abrir modal
    if (novaColuna === 'contato_realizado') {
      setCardToMove({
        cardId: activeCard.id,
        novaColuna,
        alunoNome: activeCard.aluno_nome,
      });
      setObservacaoModalOpen(true);
    } else {
      // Mover direto para outras colunas
      try {
        await moverCard(activeCard.id, novaColuna);
      } catch (error) {
        console.error('Erro ao mover card:', error);
      }
    }
  };

  const handleSaveObservacao = async (observacao: string) => {
    if (!cardToMove) return;

    try {
      await moverCard(cardToMove.cardId, cardToMove.novaColuna, observacao);
      setCardToMove(null);
    } catch (error) {
      console.error('Erro ao mover card com observação:', error);
      throw error;
    }
  };

  const handleCardClick = (card: AlunoCardWithDetails) => {
    // Mostrar detalhes do card em um modal (futuro)
    console.log('Card clicado:', card);
  };

  const getColumnCards = (columnId: ColumnId): AlunoCardWithDetails[] => {
    return cards.filter((card) => card.column_id === columnId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando quadro de acompanhamento...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {ACADEMIC_COLUMNS.map((column) => {
            const columnCards = getColumnCards(column.id);
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-72 bg-muted/30 rounded-lg p-3"
              >
                {/* Cabeçalho da Coluna */}
                <div className="mb-4">
                  <div
                    className="h-2 rounded-t-lg mb-2"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-bold text-sm mb-1">{column.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{column.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-200 rounded-full">
                      {columnCards.length} aluno(s)
                    </span>
                  </div>
                </div>

                {/* Cards da Coluna */}
                <SortableContext
                  items={columnCards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn id={column.id}>
                    {columnCards.map((card) => (
                      <StudentCard
                        key={card.id}
                        card={card}
                        onClick={() => handleCardClick(card)}
                      />
                    ))}
                    {columnCards.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        Nenhum aluno nesta categoria
                      </div>
                    )}
                  </DroppableColumn>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="rotate-3 opacity-80">
              <StudentCard card={activeCard} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal de Observação */}
      <ObservacaoModal
        open={observacaoModalOpen}
        onOpenChange={setObservacaoModalOpen}
        alunoNome={cardToMove?.alunoNome || ''}
        onSave={handleSaveObservacao}
      />
    </>
  );
}

