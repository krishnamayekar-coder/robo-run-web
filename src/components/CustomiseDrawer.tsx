import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GripVertical, Layout, Eye, EyeOff, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface WidgetConfig {
  id: string;
  name: string;
  icon: string;
  visible: boolean;
  order: number;
}

interface CustomiseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgets: WidgetConfig[];
  onWidgetsChange: (widgets: WidgetConfig[]) => void;
  defaultWidgets: WidgetConfig[];
}

function SortableWidgetItem({
  widget,
  index,
  total,
  visibleIndex,
  totalVisible,
  onToggleVisibility,
  isDisabled,
}: {
  widget: WidgetConfig;
  index: number;
  total: number;
  visibleIndex: number;
  totalVisible: number;
  onToggleVisibility: (id: string) => void;
  isDisabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: widget.id,
    disabled: isDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : (isDisabled ? 0.6 : 1),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card rounded-xl p-4 transition-all duration-300 ${isDisabled ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center gap-3">
        {isDisabled ? (
          <div className="cursor-not-allowed opacity-50">
            <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        ) : (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Label className={`text-sm font-medium ${isDisabled ? 'text-muted-foreground' : 'text-foreground'} cursor-pointer`}>
              {widget.name}
            </Label>
            {widget.visible ? (
              <Eye className="h-3.5 w-3.5 text-success" />
            ) : (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {widget.visible 
              ? `Section ${visibleIndex + 1} of ${totalVisible}` 
              : 'Hidden'}
          </p>
        </div>

        <Switch
          checked={widget.visible}
          onCheckedChange={() => onToggleVisibility(widget.id)}
          className="data-[state=checked]:bg-primary"
          disabled={false}
        />
      </div>
    </div>
  );
}

export function CustomiseDrawer({ open, onOpenChange, widgets, onWidgetsChange, defaultWidgets }: CustomiseDrawerProps) {
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[]>(widgets);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleToggleVisibility = (id: string) => {
    const updated = localWidgets.map(w => 
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    
    const visibleWidgets = updated.filter(w => w.visible).sort((a, b) => a.order - b.order);
    const hiddenWidgets = updated.filter(w => !w.visible).sort((a, b) => a.order - b.order);
    
    const reordered = [
      ...visibleWidgets.map((w, i) => ({ ...w, order: i })),
      ...hiddenWidgets.map((w, i) => ({ ...w, order: visibleWidgets.length + i }))
    ];
    
    setLocalWidgets(reordered);
    onWidgetsChange(reordered);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeWidget = localWidgets.find(w => w.id === active.id);
    const overWidget = localWidgets.find(w => w.id === over.id);

    if (!activeWidget || !overWidget || !activeWidget.visible || !overWidget.visible) {
      return;
    }

    const visibleWidgets = localWidgets.filter(w => w.visible).sort((a, b) => a.order - b.order);
    const hiddenWidgets = localWidgets.filter(w => !w.visible).sort((a, b) => a.order - b.order);

    const oldIndex = visibleWidgets.findIndex((w) => w.id === active.id);
    const newIndex = visibleWidgets.findIndex((w) => w.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedVisible = arrayMove(visibleWidgets, oldIndex, newIndex).map((w, i) => ({
      ...w,
      order: i,
    }));

    const reordered = [
      ...reorderedVisible,
      ...hiddenWidgets.map((w, i) => ({ ...w, order: reorderedVisible.length + i }))
    ];

    setLocalWidgets(reordered);
    onWidgetsChange(reordered);
  };

  const handleResetToDefault = () => {
    const resetWidgets = defaultWidgets.map((w, i) => ({
      ...w,
      order: i,
    }));
    setLocalWidgets(resetWidgets);
    onWidgetsChange(resetWidgets);
  };

  const visibleWidgets = localWidgets.filter(w => w.visible).sort((a, b) => a.order - b.order);
  const hiddenWidgets = localWidgets.filter(w => !w.visible).sort((a, b) => a.order - b.order);
  const sortedWidgets = [...visibleWidgets, ...hiddenWidgets];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="glass-sheet sm:max-w-md w-full p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Layout className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg font-bold text-foreground">Customise Dashboard</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                Toggle visibility and reorder sections to personalize your dashboard
              </SheetDescription>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="glass-card rounded-xl px-3 py-2 h-auto border-0 bg-transparent hover:bg-transparent w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] px-6 pt-4 pb-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleWidgets.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 pb-2">
                {sortedWidgets.map((widget, index) => {
                  const isVisible = widget.visible;
                  const visibleIndex = isVisible ? visibleWidgets.findIndex(w => w.id === widget.id) : -1;
                  
                  return (
                    <SortableWidgetItem
                      key={widget.id}
                      widget={widget}
                      index={index}
                      total={sortedWidgets.length}
                      visibleIndex={visibleIndex}
                      totalVisible={visibleWidgets.length}
                      onToggleVisibility={handleToggleVisibility}
                      isDisabled={!isVisible}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

