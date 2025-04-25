import { useEffect, useRef, useState } from 'react'
import Scoreboard from './Scoreboard';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ScoreboardS1 from './archived/Scoreboard';
import ScoreboardS1Finals from './archived/Scoreboard-finals';



const InputForm = styled.div`
  position:relative;
  width:1920px;
  background-color: #B0FF34;
  color: #1A1C1F;
  z-index: 2;
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
  const [style, setStyle] = useState('default');

  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    console.log(urlParams)
    setMatchId(urlParams.get('match') || '');
    setGameNumber(urlParams.get('game') || 'OVERALL');
    if (urlParams.has('ui')) {
      setUi(urlParams.get('ui') === 'true');
    }
    setStyle(urlParams.get('style') || 'default');
    console.log(urlParams, ui, style)
  }, [location]);

  return <Renderer matchId={matchId} gameNumber={gameNumber} setGameNumber={setGameNumber} setMatchId={setMatchId} ui={ui} style={style} />;
}

function Renderer({ matchId, gameNumber, setMatchId, setGameNumber, ui, style }: { matchId: string, gameNumber: string, setGameNumber: React.Dispatch<React.SetStateAction<string>>, setMatchId: React.Dispatch<React.SetStateAction<string>>, ui: boolean, style: string }) {
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

  switch(style){
    case 's1':
      return (
        <>
          {ui && <InputForm>
            <StyledSpan>{'Enter Overstat URL: '}</StyledSpan>
            <StyledInput placeholder='https://overstat.gg/api/stats/9887/summary' onBlur={(e) => setMatchUrl(e.target.value)} onChange={handleInputChange} />
          </InputForm>}
          <QueryClientProvider client={queryClient}>
            {
              matchId &&
              <>
                <div ref={scoreBoardRef}>
                {/* <Scoreboard matchId={matchId} gameNumber={gameNumber} setMatchId={setMatchId} setGameNumber={setGameNumber} ui={ui} /> */}
                <ScoreboardS1 matchId={matchId} gameNumber={gameNumber} setMatchId={setMatchId} setGameNumber={setGameNumber} ui={ui} />
                </div>
              </>
            }
          </QueryClientProvider>
        </>
      )
      case 's1final':
        return (
          <>
            {ui && <InputForm>
              <StyledSpan>{'Enter Overstat URL: '}</StyledSpan>
              <StyledInput placeholder='https://overstat.gg/api/stats/9887/summary' onBlur={(e) => setMatchUrl(e.target.value)} onChange={handleInputChange} />
            </InputForm>}
            <QueryClientProvider client={queryClient}>
              {
                matchId &&
                <>
                  <div ref={scoreBoardRef}>
                  {/* <Scoreboard matchId={matchId} gameNumber={gameNumber} setMatchId={setMatchId} setGameNumber={setGameNumber} ui={ui} /> */}
                  <ScoreboardS1Finals matchId={matchId} gameNumber={gameNumber} setMatchId={setMatchId} setGameNumber={setGameNumber} ui={ui} />
                  </div>
                </>
              }
            </QueryClientProvider>
          </>
        )
  }


  return (
    <>
      {ui && <InputForm>
        <StyledSpan>{'Enter Overstat URL: '}</StyledSpan>
        <StyledInput placeholder='https://overstat.gg/api/stats/9887/summary' onBlur={(e) => setMatchUrl(e.target.value)} onChange={handleInputChange} />
      </InputForm>}
      <QueryClientProvider client={queryClient}>
        {
          matchId &&
          <>
            <div ref={scoreBoardRef}>
            {/* <Scoreboard matchId={matchId} gameNumber={gameNumber} setMatchId={setMatchId} setGameNumber={setGameNumber} ui={ui} /> */}
            <Scoreboard matchId={matchId} gameNumber={gameNumber} setMatchId={setMatchId} setGameNumber={setGameNumber} ui={ui} />
            </div>
          </>
        }
      </QueryClientProvider>
    </>
  )
}

export default App