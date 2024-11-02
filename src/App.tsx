import { useEffect, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import Scoreboard from './Scoreboard';
import { styled } from '@linaria/react';

const InputForm = styled.div`
  width:1920px;
  background-color: #B0FF34;
  color: #1A1C1F;
`

const StyledInput = styled.input`
  padding: 0;
  width: 82.35%;
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
  const [matchUrl, setMatchUrl] = useState('')
  const [matchId, setMatchId] = useState('')
  
  const extractMatchId = (url: string) => {
    const match = url.match(/\/stats\/(\d+)\//);
    return match ? match[1] : '';
  };

  useEffect(() => {
    const id = extractMatchId(matchUrl);
    setMatchId(id);
  }, [matchUrl]);

  const scoreBoardRef = useRef<HTMLDivElement>(null);

  return (
    <>
    <InputForm>
    <StyledSpan>{'Enter Overstat URL: '}</StyledSpan>
      <StyledInput placeholder='https://overstat.gg/api/stats/9887/summary' onBlur={(e) => setMatchUrl(e.target.value)} />
    </InputForm>
      
      {
        matchId &&
        <>
          <div ref={scoreBoardRef}>
            <Scoreboard matchId={matchId} />
          </div>
        </>

      }
    </>
  )
}

export default App
