import { Modal, Card, Avatar } from '../ui';
import { useGameStore } from '../../store/gameStore';
import { getTeamName } from '../../lib/utils';

interface TeamCompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeamCompositionModal({ isOpen, onClose }: TeamCompositionModalProps) {
  const { session, getTeamPlayers } = useGameStore();

  if (!session) return null;

  const teamAPlayers = getTeamPlayers('A');
  const teamBPlayers = getTeamPlayers('B');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Les équipes">
      <div className="space-y-4">
        <Card variant="team-a">
          <h3 className="font-bold text-sm font-hand text-blue-700 mb-3">
            {getTeamName('A')}
          </h3>
          <div className="space-y-2">
            {teamAPlayers.map((player) => {
              const playerIndex = session.players.findIndex(p => p.id === player.id);
              return (
                <div key={player.id} className="flex items-center gap-2">
                  <Avatar name={player.name} index={playerIndex} size="sm" />
                  <span className="font-hand text-sm text-gray-800">{player.name}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card variant="team-b">
          <h3 className="font-bold text-sm font-hand text-yellow-700 mb-3">
            {getTeamName('B')}
          </h3>
          <div className="space-y-2">
            {teamBPlayers.map((player) => {
              const playerIndex = session.players.findIndex(p => p.id === player.id);
              return (
                <div key={player.id} className="flex items-center gap-2">
                  <Avatar name={player.name} index={playerIndex} size="sm" />
                  <span className="font-hand text-sm text-gray-800">{player.name}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Modal>
  );
}
