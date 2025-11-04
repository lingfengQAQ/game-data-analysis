import { Squad, Position } from '../../../types';
import { PlayerSlot } from './PlayerSlot';

interface SquadSlotProps {
  squad: Squad;
  regimentId: number;
  onRemovePlayer: (position: Position) => void;
}

export function SquadSlot({ squad, regimentId, onRemovePlayer }: SquadSlotProps) {
  return (
    <div className="squad-slot">
      <div className="squad-header">队伍 {squad.id}</div>
      <div className="squad-players">
        {squad.players.map((player, index) => (
          <PlayerSlot
            key={index}
            player={player}
            position={{ regimentId, squadId: squad.id, position: index }}
            onRemove={() => onRemovePlayer({ regimentId, squadId: squad.id, position: index })}
          />
        ))}
      </div>
    </div>
  );
}
