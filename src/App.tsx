import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { styled } from '@linaria/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ArchivedScoreboard from './archived/Scoreboard';
import ArchivedScoreboardFinals from './archived/Scoreboard-finals';
import Scoreboard from './Scoreboard';

const InputForm = styled.div`
  position: relative;
  width: 1920px;
  background-color: #B0FF34;
  color: #1A1C1F;
  z-index: 2;
`;

const StyledInput = styled.input`
  padding: 0;
  width: auto;
  font-size: 2em;
  border: none;
  background-color: #1A1C1F;
  color: white;
  font-family: "Unbounded", sans-serif;
`;

const StyledSpan = styled.span`
  font-size: 2em;
  font-family: "Unbounded", sans-serif;
  color: #1A1C1F;
`;

function App() {
  const basename = import.meta.env.VITE_APP_BASE_URL || '/';

  return (
    <Routes>
      <Route path={`${basename}`} element={<Home />} />

      <Route path={`${basename}scoreboard/:matchId`} element={<ScoreboardS2Wrapper />} /> {/* s2 style */}
      <Route path={`${basename}scoreboard/:matchId/:gameNumber`} element={<ScoreboardS2Wrapper />} /> {/* s2 style */}

      <Route path={`${basename}archive/scoreboard/:matchId`} element={<ScoreboardWrapper />} />
      <Route path={`${basename}archive/scoreboard/:matchId/:gameNumber`} element={<ScoreboardWrapper />} />

      <Route path={`${basename}archive/scoreboard-finals/:matchId`} element={<ScoreboardFinalsWrapper />} />
      <Route path={`${basename}archive/scoreboard-finals/:matchId/:gameNumber`} element={<ScoreboardFinalsWrapper />} />
    </Routes>
  );
}

function Home() {
  const navigate = useNavigate();
  const [matchUrl, setMatchUrl] = useState('');

  const extractMatchId = (url: string) => {
    const match = url.match(/\/stats\/(\d+)\//);
    return match ? match[1] : '';
  };

  const handleSubmit = () => {
    const matchId = extractMatchId(matchUrl);
    if (matchId) {
      navigate(`/scoreboard/${matchId}?game=OVERALL&ui=true`);
    }
  };

  return (
    <InputForm>
      <StyledSpan>Enter Overstat URL: </StyledSpan>
      <StyledInput
        placeholder="https://overstat.gg/api/stats/9887/summary"
        value={matchUrl}
        onChange={(e) => setMatchUrl(e.target.value)}
        onBlur={handleSubmit}
      />
    </InputForm>
  );
}

function ScoreboardS2Wrapper() {
  const { matchId = '', gameNumber = 'OVERALL' } = useParams<{ matchId: string; gameNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [ui, setUi] = useState(true);
  const [finals, setFinals] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setUi(urlParams.get('ui') !== 'false');
    setFinals(urlParams.get('finals') === 'true');
  }, [location]);

  const setMatchId = (newMatchId: string) => {
    navigate(`/scoreboard/${newMatchId}/${gameNumber}?ui=${ui}&finals=${finals}`);
  };

  const setGameNumber = (newGameNumber: string) => {
    navigate(`/scoreboard/${matchId}/${newGameNumber}?ui=${ui}&finals=${finals}`);
  };

  return (
    <QueryClientProvider client={new QueryClient()}>
      <Scoreboard
        matchId={matchId || ''}
        gameNumber={gameNumber}
        setMatchId={() => { }}
        setGameNumber={setGameNumber}
        ui={ui}
      />
    </QueryClientProvider>
  );
}

function ScoreboardWrapper() {
  const { matchId = '', gameNumber = 'OVERALL' } = useParams<{ matchId: string; gameNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [ui, setUi] = useState(true);
  const [finals, setFinals] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setUi(urlParams.get('ui') !== 'false');
    setFinals(urlParams.get('finals') === 'true');
  }, [location]);

  const setMatchId = (newMatchId: string) => {
    navigate(`/scoreboard/${newMatchId}/${gameNumber}?ui=${ui}&finals=${finals}`);
  };

  const setGameNumber = (newGameNumber: string) => {
    navigate(`/scoreboard/${matchId}/${newGameNumber}?ui=${ui}&finals=${finals}`);
  };

  return (
    <QueryClientProvider client={new QueryClient()}>
      <ArchivedScoreboard
        matchId={matchId || ''}
        gameNumber={gameNumber}
        setMatchId={() => { }}
        setGameNumber={setGameNumber}
        ui={ui}
      />
    </QueryClientProvider>
  );
}

function ScoreboardFinalsWrapper() {
  const { matchId = '', gameNumber = 'OVERALL' } = useParams<{ matchId: string; gameNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [ui, setUi] = useState(true);
  const [finals, setFinals] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    setUi(urlParams.get('ui') !== 'false');
    setFinals(urlParams.get('finals') === 'true');
  }, [location]);

  const setMatchId = (newMatchId: string) => {
    navigate(`/scoreboard/${newMatchId}/${gameNumber}?ui=${ui}&finals=${finals}`);
  };

  const setGameNumber = (newGameNumber: string) => {
    navigate(`/scoreboard/${matchId}/${newGameNumber}?ui=${ui}&finals=${finals}`);
  };

  return (
    <QueryClientProvider client={new QueryClient()}>
      <ArchivedScoreboardFinals
        matchId={matchId || ''}
        gameNumber={gameNumber}
        setMatchId={() => { }}
        setGameNumber={setGameNumber}
        ui={ui}
      />
    </QueryClientProvider>
  );
}



export default App;