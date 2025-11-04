import { useTeamStore } from '../../../stores/teamStore';
import { RegimentContainer } from './RegimentContainer';
import './styles.css';

export function TeamBoard() {
  const configuration = useTeamStore(state => state.configuration);
  const removePlayerFromTeam = useTeamStore(state => state.removePlayerFromTeam);

  return (
    <div className="team-board-container">
      <div className="team-board-grid" id="team-board-export">
        {configuration.regiments.map(regiment => (
          <RegimentContainer
            key={regiment.id}
            regiment={regiment}
            onRemovePlayer={removePlayerFromTeam}
          />
        ))}
      </div>
    </div>
  );
}
