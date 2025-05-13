import { useEffect, useRef, useState } from 'react';
import Scoreboard from './Scoreboard';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import ScoreboardS1 from './archived/Scoreboard';
import ScoreboardS1Finals from './archived/Scoreboard-finals';
import { css } from '@linaria/core';

const InputForm = styled.div`
    position: relative;
    width: 1920px;
    background-color: #b0ff34;
    color: #1a1c1f;
    z-index: 2;
`;

const VisibleHeader = styled.div`
    position: relative;
    width: 100%;
    background: #b0ff34;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
    z-index: 1000;
`;

const HiddenHeader = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #b0ff34;
    color: white;
    text-align: center;
    transition: transform 0.3s ease;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;

    transform: translateY(-100%);

    /* Extended hover area with pseudo-element */
    &::before {
        content: '';
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        height: 20px;
        z-index: -1;
    }

    &:hover {
        transform: translateY(0);
    }
`;

const StyledSelect = styled.select`
    width: 200px;
    padding: 10px;
    font-size: 16px;
    color: #b0ff34;
    background-color: #1a1c1f;
    z-index: 2;
`;

const StyledInput = styled.input`
    padding: 0;
    width: auto;
    font-size: 2em;
    border: none;
    background-color: #1a1c1f;
    color: white;
    font-family: 'Unbounded', sans-serif;
`;

const StyledSpan = styled.span`
    font-size: 2em;
    font-family: 'Unbounded', sans-serif;
    color: #1a1c1f;
`;

function App() {
    const [matchId, setMatchId] = useState('');
    const [gameNumber, setGameNumber] = useState('OVERALL');
    const [ui, setUi] = useState(true);
    const [style, setStyle] = useState('default');
    const [mode, setMode] = useState<'scores' | 'teams'>('scores');

    const location = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        setMatchId(urlParams.get('match') || '');
        setGameNumber(urlParams.get('game') || 'OVERALL');
        if (urlParams.has('ui')) {
            setUi(urlParams.get('ui') === 'true');
        }
        setStyle(urlParams.get('style') || 'default');
        setMode((urlParams.get('mode') as 'scores' | 'teams') || 'scores');
    }, [location]);

    return (
        <Renderer
            matchId={matchId}
            gameNumber={gameNumber}
            setGameNumber={setGameNumber}
            setMatchId={setMatchId}
            ui={ui}
            style={style}
            mode={mode}
        />
    );
}

function Renderer({
    matchId,
    gameNumber,
    setMatchId,
    setGameNumber,
    ui,
    style,
    mode,
}: {
    matchId: string;
    gameNumber: string;
    setGameNumber: React.Dispatch<React.SetStateAction<string>>;
    setMatchId: React.Dispatch<React.SetStateAction<string>>;
    ui: boolean;
    style: string;
    mode: 'scores' | 'teams';
}) {
    const [matchUrl, setMatchUrl] = useState('');
    const queryClient = new QueryClient();

    const matchList = useQuery(
        {
            queryKey: ['list'],
            queryFn: () => fetch(`https://overstat.gg/api/settings/match_list/13yog`).then((res) => res.json()),
        },
        queryClient
    );

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

    switch (style) {
        case 's1':
            return (
                <>
                    {ui && (
                        <InputForm>
                            <StyledSpan>{'Enter Overstat URL: '}</StyledSpan>
                            <StyledInput
                                placeholder="https://overstat.gg/api/stats/9887/summary"
                                onBlur={(e) => setMatchUrl(e.target.value)}
                                onChange={handleInputChange}
                            />
                        </InputForm>
                    )}
                    <QueryClientProvider client={queryClient}>
                        {matchId && (
                            <>
                                <div ref={scoreBoardRef}>
                                    <ScoreboardS1
                                        matchId={matchId}
                                        gameNumber={gameNumber}
                                        setMatchId={setMatchId}
                                        setGameNumber={setGameNumber}
                                        ui={ui}
                                    />
                                </div>
                            </>
                        )}
                    </QueryClientProvider>
                </>
            );
        case 's1final':
            return (
                <>
                    {ui && (
                        <InputForm>
                            <StyledSpan>{'Enter Overstat URL: '}</StyledSpan>
                            <StyledInput
                                placeholder="https://overstat.gg/api/stats/9887/summary"
                                onBlur={(e) => setMatchUrl(e.target.value)}
                                onChange={handleInputChange}
                            />
                        </InputForm>
                    )}
                    <QueryClientProvider client={queryClient}>
                        {matchId && (
                            <>
                                <div ref={scoreBoardRef}>
                                    <ScoreboardS1Finals
                                        matchId={matchId}
                                        gameNumber={gameNumber}
                                        setMatchId={setMatchId}
                                        setGameNumber={setGameNumber}
                                        ui={ui}
                                    />
                                </div>
                            </>
                        )}
                    </QueryClientProvider>
                </>
            );
    }

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <InputForm>
                    {ui ? (
                        <VisibleHeader>
                            {matchList.isSuccess && (
                                <>
                                    <StyledSelect value={matchId || ''} onChange={(e) => setMatchId(e.target.value)}>
                                        {matchList.data.map(
                                            (match: { id: number; eventId: string; archived: boolean }) => (
                                                <option key={match.id} value={match.id}>
                                                    {match.eventId}
                                                </option>
                                            )
                                        )}
                                    </StyledSelect>
                                    <StyledSpan>{'or'}</StyledSpan>
                                </>
                            )}
                            <StyledSpan>{'Enter Overstat URL: '}</StyledSpan>
                            <StyledInput
                                placeholder="https://overstat.gg/api/stats/9887/summary"
                                onBlur={(e) => setMatchUrl(e.target.value)}
                                onChange={handleInputChange}
                            />
                        </VisibleHeader>
                    ) : (
                        <HiddenHeader>
                            {matchList.isSuccess && (
                                <>
                                    <StyledSelect value={matchId || ''} onChange={(e) => setMatchId(e.target.value)}>
                                        {matchList.data.map(
                                            (match: { id: number; eventId: string; archived: boolean }) => (
                                                <option key={match.id} value={match.id}>
                                                    {match.eventId}
                                                </option>
                                            )
                                        )}
                                    </StyledSelect>
                                    <StyledSpan>{'or'}</StyledSpan>
                                </>
                            )}
                            <StyledSpan>{'Enter Overstat URL: '}</StyledSpan>
                            <StyledInput
                                placeholder="https://overstat.gg/api/stats/9887/summary"
                                onBlur={(e) => setMatchUrl(e.target.value)}
                                onChange={handleInputChange}
                            />
                        </HiddenHeader>
                    )}
                </InputForm>

                {matchId && (
                    <>
                        <div ref={scoreBoardRef}>
                            <Scoreboard
                                matchId={matchId}
                                gameNumber={gameNumber}
                                setMatchId={setMatchId}
                                setGameNumber={setGameNumber}
                                ui={ui}
                                mode={mode}
                            />
                        </div>
                    </>
                )}
            </QueryClientProvider>
        </>
    );
}

export default App;
