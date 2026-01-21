import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  SetupPage,
  WordsPage,
  TeamsPage,
  PlayPage,
  PhaseSummaryPage,
  GameOverPage,
  JoinPage
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SetupPage />} />
        <Route path="/words" element={<WordsPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/phase-summary" element={<PhaseSummaryPage />} />
        <Route path="/game-over" element={<GameOverPage />} />
        <Route path="/join/:peerId" element={<JoinPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
