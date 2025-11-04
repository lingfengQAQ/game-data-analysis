import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Player, Position } from '../../../types';
import { getClassColor } from '../../../utils/colorUtils';

interface PlayerSlotProps {
  player: Player | null;
  position: Position;
  onRemove?: () => void;
}

export function PlayerSlot({ player, position, onRemove }: PlayerSlotProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `slot-${position.regimentId}-${position.squadId}-${position.position}`,
    data: { type: 'slot', position }
  });

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: player ? `team-player-${player.id}` : `empty-${position.regimentId}-${position.squadId}-${position.position}`,
    data: player ? { type: 'teamPlayer', player, position } : undefined,
    disabled: !player
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    if (player && onRemove) {
      e.preventDefault();
      onRemove();
    }
  };

  return (
    <div
      ref={setDropRef}
      className={`player-slot ${isOver ? 'drop-target' : ''} ${player ? 'filled' : 'empty'}`}
      onContextMenu={handleContextMenu}
    >
      {player ? (
        <div
          ref={setDragRef}
          {...attributes}
          {...listeners}
          className={`player-card ${isDragging ? 'dragging' : ''}`}
          style={{ 
            backgroundColor: getClassColor(player.class),
            opacity: isDragging ? 0 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          <div className="player-name">{player.name}</div>
          <div className="player-info">
            <span className="player-power">{player.combatPower.toLocaleString()}</span>
            <span className="player-class">{player.class}</span>
          </div>
        </div>
      ) : (
        <div className="empty-slot">空位</div>
      )}
    </div>
  );
}
