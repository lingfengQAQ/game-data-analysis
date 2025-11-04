import { Regiment, Position } from '../../../types';
import { SquadSlot } from './SquadSlot';

interface RegimentContainerProps {
  regiment: Regiment;
  onRemovePlayer: (position: Position) => void;
}

export function RegimentContainer({ regiment, onRemovePlayer }: RegimentContainerProps) {
  const playerCount = regiment.squads.reduce(
    (count, squad) => count + squad.players.filter(p => p !== null).length,
    0
  );

  return (
    <div className="regiment-container">
      <div className="regiment-header">
        <h3>{regiment.name}</h3>
        <span className="regiment-count">({playerCount}/30)</span>
      </div>
      <div className="regiment-squads">
        {regiment.squads.map(squad => (
          <SquadSlot
            key={squad.id}
            squad={squad}
            regimentId={regiment.id}
            onRemovePlayer={onRemovePlayer}
          />
        ))}
      </div>
    </div>
  );
}
