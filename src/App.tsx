import { useEffect, useRef, useState } from 'react'
import Scoreboard from './Scoreboard';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const InputForm = styled.div`
  width:1920px;
  background-color: #B0FF34;
  color: #1A1C1F;
`

const StyledInput = styled.input`
  padding: 0;
  width: auto;
  font-size: 2em;
  border: none;
  background-color: #1A1C1F;
  color: white;
  font-family: "Unbounded", sans-serif;
`
const StyledSpan = styled.span`
  font-size: 2em;
  font-family: "Unbounded", sans-serif;
  color: #1A1C1F;
`

function App() {
  const [matchId, setMatchId] = useState('');
  const [gameNumber, setGameNumber] = useState('OVERALL');
  const [ui, setUi] = useState(true);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname) {
      const matchId = location.pathname.split('/')[1];
      setMatchId(matchId);
    }

    if (location.pathname.includes('game')) {
      const gameNumber = location.pathname.split('/')[3];
      setGameNumber(gameNumber);
    } else {
      setGameNumber('OVERALL');
    }

    if (location.search.includes('ui')) {
      setUi(false)
    }
  }, [location]);

  return <Renderer matchId={matchId} gameNumber={gameNumber} setMatchId={setMatchId} ui={ui} />;
}

function Renderer({ matchId, gameNumber, setMatchId, ui }: { matchId: string, gameNumber: string, setMatchId: React.Dispatch<React.SetStateAction<string>>, ui: boolean }) {
  const [matchUrl, setMatchUrl] = useState('')

  const extractMatchId = (url: string) => {
    const match = url.match(/\/stats\/(\d+)\//);
    return match ? match[1] : '';
  };

  useEffect(() => {
    const id = extractMatchId(matchUrl);
    setMatchId(id);
  }, [matchUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMatchUrl(e.target.value);
  };

  const scoreBoardRef = useRef<HTMLDivElement>(null);

  const queryClient = new QueryClient();


  return (
    <>
    {ui && <InputForm>
    <StyledSpan>{'Enter Overstat URL: '}</StyledSpan>
      <StyledInput placeholder='https://overstat.gg/api/stats/9887/summary' onBlur={(e) => setMatchUrl(e.target.value)} onChange={handleInputChange} />
    </InputForm>}
      <QueryClientProvider client={queryClient}>
      {
        // matchId &&
        <>
          <div ref={scoreBoardRef}>
            <Scoreboard matchId={matchId} gameNumber={gameNumber} ui={ui} />
          </div>
        </>
      }
      </QueryClientProvider>
    </>
  )
}

export default App
