import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Play, Dices, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Card, Avatar, BackButton } from '../components/ui';
import { useGameStore } from '../store/gameStore';
import { getTeamName } from '../lib/utils';
import type { Team } from '../types/game';

interface SwipeablePlayerCardProps {
  player: { id: string; name: string; team?: Team };
  index: number;
  onSwipe: (playerId: string, team: Team) => void;
}

// Player card in a team - can swipe/click to move to other team
interface TeamPlayerCardProps {
  player: { id: string; name: string; team?: Team };
  index: number;
  currentTeam: Team;
  onSwitch: (playerId: string, newTeam: Team) => void;
}

function TeamPlayerCard({ player, index, currentTeam, onSwitch }: TeamPlayerCardProps) {
  const [dragging, setDragging] = useState(false);
  const otherTeam = currentTeam === 'A' ? 'B' : 'A';

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    // Swipe left moves to A, swipe right moves to B
    if (currentTeam === 'A' && info.offset.x > 50) {
      onSwitch(player.id, 'B');
    } else if (currentTeam === 'B' && info.offset.x < -50) {
      onSwitch(player.id, 'A');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: currentTeam === 'A' ? -20 : 20 }}
      animate={{
        opacity: 1,
        x: 0,
        backgroundColor: dragging
          ? (currentTeam === 'A' ? '#fef9c3' : '#dbeafe')
          : (currentTeam === 'A' ? '#eff6ff' : '#fefce8')
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      onClick={() => onSwitch(player.id, otherTeam)}
      whileTap={{ scale: 0.95 }}
      className={`
        flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none touch-pan-y
        ${currentTeam === 'A' ? 'border-blue-200' : 'border-yellow-200'}
      `}
    >
      {currentTeam === 'B' && (
        <ChevronLeft className="w-3 h-3 text-blue-400 flex-shrink-0" />
      )}
      <Avatar name={player.name} index={index} size="sm" />
      <span className="text-sm text-gray-800 font-hand truncate flex-1">{player.name}</span>
      {currentTeam === 'A' && (
        <ChevronRight className="w-3 h-3 text-yellow-400 flex-shrink-0" />
      )}
    </motion.div>
  );
}

function SwipeablePlayerCard({ player, index, onSwipe }: SwipeablePlayerCardProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    ['#60a5fa', '#ffffff', '#fde047']
  );
  const teamIndicator = useTransform(
    x,
    [-100, -50, 0, 50, 100],
    ['Équipe Bleue ←', '', '', '', '→ Équipe Jaune']
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) {
      onSwipe(player.id, 'A');
    } else if (info.offset.x > 80) {
      onSwipe(player.id, 'B');
    }
  };

  return (
    <motion.div
      style={{ x }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      className="relative touch-pan-y"
    >
      <motion.div
        style={{ background }}
        className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-300 shadow-sm cursor-grab active:cursor-grabbing"
      >
        <Avatar name={player.name} index={index} size="md" />
        <span className="font-hand text-lg text-gray-800 flex-1">{player.name}</span>
        <motion.span
          style={{ opacity: useTransform(x, [-100, -50, 0, 50, 100], [1, 0.5, 0, 0.5, 1]) }}
          className="text-xs text-gray-500 font-hand"
        >
          {teamIndicator}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

export function TeamsPage() {
  const navigate = useNavigate();
  const { session, assignTeam, randomizeTeams, startGame } = useGameStore();

  useEffect(() => {
    if (!session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (!session) return null;

  const teamA = session.players.filter(p => p.team === 'A');
  const teamB = session.players.filter(p => p.team === 'B');
  const unassigned = session.players.filter(p => !p.team);

  const isBalanced = Math.abs(teamA.length - teamB.length) <= 1;
  const allAssigned = unassigned.length === 0;
  const canStart = allAssigned && teamA.length > 0 && teamB.length > 0;

  const handleStartGame = () => {
    startGame();
    navigate('/play');
  };

  const handleSwipe = (playerId: string, team: Team) => {
    assignTeam(playerId, team);
  };

  return (
    <div className="min-h-[100dvh] p-4 relative pb-safe">
      <BackButton className="absolute top-4 left-4 z-10" />
      <div className="max-w-md mx-auto pt-10">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold font-sketch text-gray-800 mb-1">
            Formez les équipes !
          </h1>
          <p className="text-gray-500 text-sm font-hand">
            Swipez les joueurs vers leur équipe
          </p>
        </div>

        {/* Randomize Button */}
        <div className="flex justify-center mb-4">
          <Button
            variant="secondary"
            onClick={randomizeTeams}
            icon={<Dices className="w-5 h-5" />}
            className="!px-10"
          >
            Mélanger au hasard
          </Button>
        </div>

        {/* Unassigned Players - Swipeable */}
        {unassigned.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs text-gray-500 font-hand">Joueurs à assigner</h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-blue-500">← Bleue</span>
                <span className="text-yellow-600">Jaune →</span>
              </div>
            </div>
            <div className="space-y-3">
              {unassigned.map((player) => (
                <SwipeablePlayerCard
                  key={player.id}
                  player={player}
                  index={session.players.indexOf(player)}
                  onSwipe={handleSwipe}
                />
              ))}
            </div>
          </div>
        )}

        {/* Teams Display */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Team A */}
          <Card variant="team-a" className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h2 className="font-bold text-sm font-hand text-blue-700">{getTeamName('A')}</h2>
            </div>
            <div className="space-y-1.5 min-h-[100px] overflow-y-auto">
              {teamA.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4 font-hand">
                  Swipez vers la gauche
                </p>
              ) : (
                teamA.map((player) => (
                  <TeamPlayerCard
                    key={player.id}
                    player={player}
                    index={session.players.indexOf(player)}
                    currentTeam="A"
                    onSwitch={handleSwipe}
                  />
                ))
              )}
            </div>
            <div className="text-center mt-2 text-sm font-bold text-blue-600">
              {teamA.length} joueur{teamA.length > 1 ? 's' : ''}
            </div>
          </Card>

          {/* Team B */}
          <Card variant="team-b" className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <h2 className="font-bold text-sm font-hand text-yellow-700">{getTeamName('B')}</h2>
            </div>
            <div className="space-y-1.5 min-h-[100px] overflow-y-auto">
              {teamB.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4 font-hand">
                  Swipez vers la droite
                </p>
              ) : (
                teamB.map((player) => (
                  <TeamPlayerCard
                    key={player.id}
                    player={player}
                    index={session.players.indexOf(player)}
                    currentTeam="B"
                    onSwitch={handleSwipe}
                  />
                ))
              )}
            </div>
            <div className="text-center mt-2 text-sm font-bold text-yellow-600">
              {teamB.length} joueur{teamB.length > 1 ? 's' : ''}
            </div>
          </Card>
        </div>

        {/* Warning */}
        {!isBalanced && allAssigned && (
          <div className="mb-4 p-2 bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-xl">
            <p className="text-yellow-700 text-xs text-center font-hand">
              ⚠️ Les équipes ne sont pas équilibrées
            </p>
          </div>
        )}

        {/* Start Button */}
        <Button
          fullWidth
          size="lg"
          variant="success"
          onClick={handleStartGame}
          disabled={!canStart}
          icon={<Play className="w-5 h-5" />}
        >
          {!allAssigned
            ? 'Assignez tous les joueurs'
            : !isBalanced
              ? 'Commencer quand même'
              : 'C\'est parti !'}
        </Button>
      </div>
    </div>
  );
}

