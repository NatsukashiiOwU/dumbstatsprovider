import { useEffect, useRef, useState } from 'react'
import Scoreboard from './Scoreboard';
import { styled } from '@linaria/react';
import { useSearchParams } from 'react-router-dom';


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
  const [ui, setUi] = useState(true);

  const [urlParams] = useSearchParams();

  useEffect(() => {
    const urlId = urlParams.get('id');
    if (urlId) {
      setMatchId(urlId);
    }
    
    if (urlParams.has('ui')) {
      setUi(false)
    }
  }, []);

  return <Renderer matchId={matchId} setMatchId={setMatchId} ui={ui} />;
}

function Renderer({ matchId, setMatchId, ui }: { matchId: string, setMatchId: React.Dispatch<React.SetStateAction<string>>, ui: boolean }) {
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

  return (
    <>
    {ui && <InputForm>
    <StyledSpan>{'Enter Overstat URL: '}</StyledSpan>
      <StyledInput placeholder='https://overstat.gg/api/stats/9887/summary' onBlur={(e) => setMatchUrl(e.target.value)} onChange={handleInputChange} />
    </InputForm>}
      
      {
        matchId &&
        <>
          <div ref={scoreBoardRef}>
            <Scoreboard matchId={matchId} ui={ui} />
          </div>
        </>

      }
    </>
  )
}

export default App
