import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { DealCard } from './DealCard';
import { DealDialog } from './DealDialog';
import { ColumnHeader } from './ColumnHeader';
import { DroppableColumn } from './DroppableColumn';
import { DealCard as DealCardType, Column } from '@/types';
import { Plus, Loader2 } from 'lucide-react';
import { useColumns } from '@/hooks/useColumns';
import { useDeals } from '@/hooks/useDeals';
import { useAuth } from '@/hooks/useAuth';

export function KanbanBoard() {
  const { user } = useAuth();
  const { columns, loading: columnsLoading, addColumn, updateColumn, deleteColumn } = useColumns();
  const { deals, loading: dealsLoading, addDeal, updateDeal, updateMultipleDeals, deleteDeal } = useDeals();
  const [activeCard, setActiveCard] = useState<DealCardType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [editingCard, setEditingCard] = useState<DealCardType | undefined>(undefined);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loading = columnsLoading || dealsLoading;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = deals.find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeCard = deals.find((c) => c.id === activeId);
    const overCard = deals.find((c) => c.id === overId);

    if (!activeCard) return;

    // Se estamos sobre outra card
    if (overCard) {
      const activeColumnId = activeCard.column_id;
      const overColumnId = overCard.column_id;

      if (activeColumnId !== overColumnId) {
        updateDeal(activeCard.id, { column_id: overColumnId });
      }
    } else {
      // Se estamos sobre uma coluna
      const overColumn = columns.find((col) => col.id === overId);
      if (overColumn && activeCard.column_id !== overColumn.id) {
        updateDeal(activeCard.id, { column_id: overColumn.id });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeCard = deals.find((c) => c.id === activeId);
    const overCard = deals.find((c) => c.id === overId);

    if (!activeCard) return;

    if (overCard && activeCard.column_id === overCard.column_id) {
      const columnCards = deals.filter((c) => c.column_id === activeCard.column_id);
      const oldIndex = columnCards.findIndex((c) => c.id === activeId);
      const newIndex = columnCards.findIndex((c) => c.id === overId);

      const reorderedColumnCards = arrayMove(columnCards, oldIndex, newIndex);

      // Atualizar ordem de múltiplos cards
      const updates = reorderedColumnCards.map((card, index) => ({
        id: card.id,
        data: { order: index },
      }));

      try {
        await updateMultipleDeals(updates);
      } catch (error) {
        console.error('Error reordering cards:', error);
      }
    }
  };

  const handleAddCard = (columnId: string) => {
    setSelectedColumnId(columnId);
    setEditingCard(undefined);
    setDialogOpen(true);
  };

  const handleEditCard = (card: DealCardType) => {
    setEditingCard(card);
    setDialogOpen(true);
  };

  const handleSaveCard = async (dealData: Omit<DealCardType, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingCard) {
        // Editar card existente
        await updateDeal(editingCard.id, dealData);
      } else {
        // Criar novo card
        const columnDeals = deals.filter((c) => c.column_id === dealData.column_id);
        await addDeal({
          ...dealData,
          order: columnDeals.length,
        });
      }
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleRenameColumn = async (columnId: string, newTitle: string) => {
    try {
      await updateColumn(columnId, { title: newTitle });
    } catch (error) {
      console.error('Error renaming column:', error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteColumn(columnId);
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  const handleAddColumn = async () => {
    const newColumnTitle = window.prompt('Digite o nome da nova coluna:');
    if (!newColumnTitle || !newColumnTitle.trim()) return;

    try {
      await addColumn(newColumnTitle.trim(), '#6366f1');
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  const getColumnCards = (columnId: string) => {
    return deals
      .filter((card) => card.column_id === columnId)
      .sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seu CRM...</p>
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
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {columns.map((column) => {
            const columnCards = getColumnCards(column.id);
            return (
              <div
                key={column.id}
                className="flex-shrink-0 w-80 bg-muted/30 rounded-lg p-4"
              >
                <ColumnHeader
                  column={column}
                  cardCount={columnCards.length}
                  onRename={handleRenameColumn}
                  onDelete={handleDeleteColumn}
                />

                <SortableContext
                  items={columnCards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn id={column.id}>
                    {columnCards.map((card) => (
                      <DealCard
                        key={card.id}
                        deal={card}
                        onClick={() => handleEditCard(card)}
                      />
                    ))}
                  </DroppableColumn>
                </SortableContext>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAddCard(column.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Negociação
                </Button>
              </div>
            );
          })}

          {/* Botão para adicionar nova coluna */}
          <div className="flex-shrink-0 w-80">
            <Button
              variant="outline"
              className="w-full h-full min-h-[100px] border-dashed"
              onClick={handleAddColumn}
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Coluna
            </Button>
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="rotate-3 opacity-80">
              <DealCard deal={activeCard} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveCard}
        columnId={selectedColumnId}
        existingDeal={editingCard}
      />
    </>
  );
}

