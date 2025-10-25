import { styled } from '@linaria/react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import domToImage from 'dom-to-image';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Index from './components/Index';
import TeamName from './components/TeamName';
import Earnings from './components/Earnings';
import Kills from './components/Kills';
import Score from './components/Score';
import VerticalDivider from './components/Divider';
import background from './assets/mask_group.png';
import backgroundVid from './assets/statsgif1.webm';
import backgroundTeams from './assets/mask_group_teams.png';
import logos from './assets/Sponsors.png';
import logosTeams from './assets/logos_black.png';
import RCC from './assets/RCC.png';
import overlay from './assets/texture-overlay.png';
import noise from './assets/grunge_texture.png';
import testImage from './assets/test_image.png';
import { getMatch, getOverallStats, getMatchSettings, getGameStats } from './utils/api';

const TestImage = styled.div`
    position: absolute;
    width: 1920px;
    height: 1080px;
    opacity: 0.5;
    z-index: 10;
    background: url(${testImage});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
`;

const Container = styled.div<{ mode: 'scores' | 'teams' }>`
    position: relative;
    width: 1920px;
    height: 1080px;
    background: ${(props) => (props.mode === 'scores' ? `#000000` : `#1A1C1F`)};
    background-blend-mode: overlay;
`;

const BG = styled.div<{ mode: 'scores' | 'teams' }>`
    position: absolute;
    top: -100%;
    left: -100%;
    width: 200%;
    height: 200%;
    background-clip: padding-box;
    /* background-image: ${(props) => (props.mode === 'scores' ? `url(${backgroundVid})` : `url(${backgroundTeams})`)}; */
    opacity: 1;
    z-index: 0;
`;

const StyledVid = styled.video`
    position: absolute;
    top: 0%;
    left: 0%;
    width: 100%;
    height: 100%;
    filter: brightness(500%) blur(5px);
`

const Noise = styled.img`
    position: absolute;
    background: url(${noise});
    mix-blend-mode: lighten;
    opacity: 0.7;
    z-index: 1;
    width: 100%;
    height: 100%;
`;

const Overlay = styled.img`
    position: absolute;
    background: url(${overlay});
    mix-blend-mode: lighten;
    opacity: 1;
    z-index: 1;
    width: 100%;
    height: 100%;
`;

const TeamsContainer = styled.div<{ position: 'left' | 'right' }>`
    width: 62.9em;
    position: absolute;
    top: 15.4%;
    left: ${({ position }) => (position === 'left' ? '3.1%' : 'auto')};
    right: ${({ position }) => (position === 'right' ? '3.1%' : 'auto')};
    z-index: 2;
`;

const StatsDesc = styled.div`
    color: #fcfcfc;
    font-size: 10px;
    font-family: 'Involve', sans-serif;
    display: flex;
    left: 0.5%;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    letter-spacing: 1.35%;
    width: 7.4em;
    padding-bottom: 0.5em;
    z-index: 2;
`;

const TeamWrapper = styled.div`
    width: 100%;
    height: 4.25em;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin-bottom: 0.97em;
    z-index: 2;
`;

type wrapperType = {
    mp: boolean;
    mode: 'scores' | 'teams';
};

const Team = styled.div<wrapperType>`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-inline-start: 1.4em;
    padding-inline-end: 1em;
    z-index: 2;

    /* Conditional background and text color */
    background-color: ${(props) => (props.mode === 'teams' ? '#1A1C1F' : props.mp ? '#1A1C1F' : '#400202')};
    border: 2px solid #FF0000;
    color: ${(props) => (props.mode === 'teams' ? '#FFFFFF' : props.mp ? '#FFFFFF' : '#FCFCFC')};
`;

const TeamScore = styled.div`
    width: fit-content;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #fcfcfc;
    z-index: 2;
`;

const Logo = styled.div<{ mode: "scores" | "teams" }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  z-index: 1;
  img {
    height: 100%;
    width: 100%;
    object-fit: contain;
    background-color: transparent;
    pointer-events: none;
  }
`;

const ExportButton = styled.button`
    width: 1920px;
    background-color: #b0ff34;
    color: #1a1c1f;
    font-family: 'Unbounded', sans-serif;
    font-weight: 900;
    font-size: 2em;
    border: none;
    padding: 0.5em 1em;
    cursor: pointer;
    z-index: 2;
`;

const StyledSelect = styled.select`
    width: 200px;
    padding: 10px;
    font-size: 16px;
    color: #b0ff34;
    background-color: #1a1c1f;
    z-index: 2;
`;

const Stage = styled.div`
    color: #f6f5f5;
    font-size: 16px;
    font-family: 'Adderley', 'Unbounded', sans-serif;
    display: block;
    left: 3.7%;
    position: absolute;
    top: 94%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 0.5em;
    z-index: 2;
`;

const WINNER = styled.div`
    color: #f6f5f5;
    font-size: 16px;
    font-family: 'Adderley', 'Unbounded', sans-serif;
    display: block;
    left: 91.5%;
    position: absolute;
    top: 94%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    z-index: 2;
`;

const TitleBlock = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: minmax(0, 1fr);
  justify-items: center;
  align-items: center;
  height: 120px; /* parent defines bounds for row fr sizing */
  padding-inline: 4em;
  overflow: hidden;
`;

const TITLE = styled.div`
    color: #f6f5f5;
    font-size: 113px;
    font-family: 'Adderley', 'Unbounded', sans-serif;
    font-weight: 800;
    letter-spacing: 1.35%;
    z-index: 2;
`;

const XVSX = styled.div<{ mode: 'scores' | 'teams' }>`
    color: ${(props) => (props.mode === 'scores' ? '#f6f5f5' : '#1a1c1f')};
    font-size: 42px;
    font-family: 'Involve', 'Unbounded', sans-serif;
    font-weight: 800;
    letter-spacing: 1.35%;
    z-index: 2;
`;

const RESULTS = styled.div<{ mode: 'scores' | 'teams' }>`
    color: ${(props) => (props.mode === 'scores' ? '#f6f5f5' : '#1a1c1f')};
    font-size: 42px;
    font-family: 'Involve', 'Unbounded', sans-serif;
    font-weight: 800;
    letter-spacing: 1.35%;
    z-index: 2;
`;

const GROUP = styled.div<{ mode: 'scores' | 'teams' }>`
    color: ${(props) => (props.mode === 'scores' ? '#f6f5f5' : '#1a1c1f')};
    font-size: 42px;
    font-family: 'Involve', 'Unbounded', sans-serif;
    font-weight: 800;
    display: block;
    // right: 85%;
    letter-spacing: 1.35%;
    z-index: 2;
`;

const GAMENUMBER = styled.div<{ mode: 'scores' | 'teams' }>`
    color: ${(props) => (props.mode === 'scores' ? '#f6f5f5' : '#1a1c1f')};
    font-size: 42px;
    font-family: 'Involve', 'Unbounded', sans-serif;
    font-weight: 800;
    letter-spacing: 1.35%;
    z-index: 2;
`;

const downloadImage = async (ref: React.RefObject<HTMLDivElement>, match: string, game?: string) => {
    if (ref.current === null) return;

    try {
        const dataUrl = await domToImage.toPng(ref.current, {
            width: 1920,
            height: 1080,
        });

        const link = document.createElement('a');
        link.download = `${match}-game#${game}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Error capturing image:', error);
    }
};

interface TeamData {
    name: string;
    overall_stats: { position: string; score: string; kills: string; teamPlacement: string };
}

const Scoreboard = ({
    matchId,
    gameNumber,
    ui,
    setMatchId,
    setGameNumber,
    mode,
    isLive
}: {
    matchId: string;
    gameNumber: string;
    ui: boolean;
    setGameNumber: React.Dispatch<React.SetStateAction<string>>;
    setMatchId: React.Dispatch<React.SetStateAction<string>>;
    mode: 'scores' | 'teams';
    isLive?: boolean;
}) => {
    const scoreBoardRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    const results = useQueries(
        {
            queries: [
                {
                    queryKey: ['match', matchId],
                    queryFn: () => getMatch(matchId),
                },
                {
                    queryKey: ['overallStats', matchId],
                    queryFn: () => getOverallStats(matchId),
                },
                {
                    queryKey: ['settings', matchId],
                    queryFn: () => getMatchSettings(matchId),
                },
                {
                    queryKey: ['gameStats', matchId, gameNumber],
                    queryFn: () => getGameStats(matchId, gameNumber),
                },
            ],
        },
        queryClient
    );


    const isLoading = results.some((result) => result.isLoading);
    const error = results.find((result) => result.error)?.error;

    useEffect(() => {
        if (error) {
            console.error('[SCOREBOARD-ERROR] Error fetching data:', error);
        }
    }, [error]);

    const matchData = results[0].data;
    const overallStatsData = results[1].data;
    const settings = results[2].data;
    const gameStatsData = results[3].data;

    const teams = useMemo(() => {
        if (gameNumber !== 'OVERALL' && gameStatsData?.teams) {
            return gameStatsData.teams;
        } else if (overallStatsData?.teams) {
            return overallStatsData.teams;
        } else {
            return [];
        }
    }, [gameNumber, gameStatsData, overallStatsData]);

    const [leftTeams, rightTeams] = useMemo(() => {
        return teams
            ? [teams.slice(0, Math.ceil(teams?.length / 2)), teams.slice(Math.ceil(teams?.length / 2))]
            : [[], []];
    }, [teams, gameNumber]);

    const matchName = useMemo(() => {

        console.log("🚀 ~ Scoreboard ~ matchData:", matchData)
        return (
            matchData?.eventId?.toUpperCase()
                .replace(/RCC/g, '')
                .replace(/LOBBY\s[a-zA-Z0-9]+/, '') || 'Match Name'
        );
    }, [matchData, gameNumber]);

    const group = useMemo(() => {
        return matchData?.eventId?.toUpperCase().match(/LOBBY\s[a-zA-Z0-9]+/);
    }, [matchData, gameNumber]);

    const currentGame = useMemo(() => {
        return overallStatsData?.games?.length || '';
    }, [overallStatsData]);

    const [matchTitle, matchSubtitle] = useMemo(() => {
        return matchName.split('|').length > 1 ? [matchName.split('|')[0], matchName.split('|')[1]] : [matchName, ''];
    }, [matchName, gameNumber]);

    const handleGameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value === 'OVERALL') {
            setGameNumber('OVERALL');
            return;
        }
        setGameNumber(event.target.value);
    };

    return (
        <>
            <Container mode={mode} ref={scoreBoardRef}>
                {isLoading && <div style={{ width: 0, height: 0 }}></div>}
                {error && <div>Error: {error?.message || 'An error occurred'}</div>}
                {/* <TestImage /> */}
                {!isLoading && !error && matchData && (
                    <>
                        {/* <Noise src={noise} alt="noise" />
                        <Overlay src={overlay} alt="overlay" /> */}
                        <div key={'titles' + gameNumber}>
                            <TitleBlock style={{ paddingTop: '1em' }}>
                                <XVSX mode={mode}>{matchName}</XVSX>
                                <Logo mode={mode}>
                                    <img src={RCC} alt=' ' style={{scale: '450%', paddingTop:'1%'}} />
                                </Logo>
                                {mode === 'scores' ? (
                                    <RESULTS mode={mode}>RESULTS</RESULTS>
                                ) : (
                                    <RESULTS mode={mode}>TEAMS</RESULTS>
                                )}
                            </TitleBlock>
                        </div>

                        <TeamsContainer key={'leftteams' + gameNumber} position="left">
                            {mode === 'scores' && (
                                <>
                                    <StatsDesc>
                                        <span style={{ marginLeft: "0.5em" }} >NUMBER</span>
                                        <span style={{ marginLeft: "2em", textWrap: 'nowrap' }}>TEAM NAME</span>
                                        <span style={{ marginLeft: "63em" }}>KILLS</span>
                                        <span style={{ marginLeft: "3em" }}>SCORE</span>
                                    </StatsDesc>
                                </>
                            )}

                            {leftTeams.map((team: TeamData, index: number) => (
                                <TeamWrapper key={team.name}>
                                    <Index
                                        text={gameNumber !== 'OVERALL' ? `${index + 1}` : team.overall_stats.position}
                                        mode={mode}
                                        mp={
                                            settings?.scoring?.useMatchPoint &&
                                            Number(team.overall_stats.score) >= settings?.scoring?.matchPointThreshold
                                        }
                                    />
                                    <Team
                                        mode={mode}
                                        mp={
                                            settings?.scoring?.useMatchPoint &&
                                            Number(team.overall_stats.score) >= settings?.scoring?.matchPointThreshold
                                        }
                                    >
                                        <TeamName text={team.name} />
                                        {mode === 'scores' && (
                                            <TeamScore>
                                                <Earnings text="" />
                                                {team.overall_stats.kills === '' || team.overall_stats.score === '' ? (
                                                    <VerticalDivider />
                                                ) : (
                                                    <VerticalDivider shown />
                                                )}
                                                <Kills text={team.overall_stats.kills} />
                                                {team.overall_stats.kills === '' || team.overall_stats.score === '' ? (
                                                    <VerticalDivider />
                                                ) : (
                                                    <VerticalDivider shown />
                                                )}
                                                <Score text={team.overall_stats.score} />
                                            </TeamScore>
                                        )}
                                    </Team>
                                </TeamWrapper>
                            ))}
                        </TeamsContainer>
                        <TeamsContainer key={'rightteams' + gameNumber} position="right">
                            {mode === 'scores' && (
                                <StatsDesc>
                                    <span style={{ marginLeft: "0.5em" }} >NUMBER</span>
                                    <span style={{ marginLeft: "2em", textWrap: 'nowrap' }}>TEAM NAME</span>
                                    <span style={{ marginLeft: "63em" }}>KILLS</span>
                                    <span style={{ marginLeft: "3em" }}>SCORE</span>
                                </StatsDesc>
                            )}

                            {rightTeams.map((team: TeamData, index: number) => (
                                <TeamWrapper key={team.name}>
                                    <Index
                                        text={gameNumber !== 'OVERALL' ? `${index + 1}` : team.overall_stats.position}
                                        mode={mode}
                                        mp={
                                            settings?.scoring?.useMatchPoint &&
                                            Number(team.overall_stats.score) >= settings?.scoring?.matchPointThreshold
                                        }
                                    />
                                    <Team
                                        mode={mode}
                                        mp={
                                            settings?.scoring?.useMatchPoint &&
                                            Number(team.overall_stats.score) >= settings?.scoring?.matchPointThreshold
                                        }
                                    >
                                        <TeamName text={team.name} />
                                        {mode === 'scores' && (
                                            <TeamScore>
                                                <Earnings text="" />
                                                {team.overall_stats.kills === '' || team.overall_stats.score === '' ? (
                                                    <VerticalDivider />
                                                ) : (
                                                    <VerticalDivider shown />
                                                )}
                                                <Kills text={team.overall_stats.kills} />
                                                {team.overall_stats.kills === '' || team.overall_stats.score === '' ? (
                                                    <VerticalDivider />
                                                ) : (
                                                    <VerticalDivider shown />
                                                )}
                                                <Score text={team.overall_stats.score} />
                                            </TeamScore>
                                        )}
                                    </Team>
                                </TeamWrapper>
                            ))}
                        </TeamsContainer>
                        <TitleBlock style={{ paddingBottom: '1em', bottom: "-73%", position: 'relative', minHeight: '10%', alignItems: 'center', gridTemplateColumns: '1fr 1.5fr 1fr' }}>
                            <GROUP mode={mode}>{group}</GROUP>
                            <Logo mode={mode}>
                                <img src={logos} alt=' ' style={{scale: '120%'}} />
                            </Logo>
                            {mode === 'scores' && overallStatsData?.games?.length > 0 && gameNumber === 'OVERALL' && isLive ? (
                                <GAMENUMBER mode={mode}>{`AFTER ${currentGame} GAMES`}</GAMENUMBER>
                            ) : gameNumber !== 'OVERALL' ? (
                                <GAMENUMBER mode={mode}>{`GAME ${gameNumber}`}</GAMENUMBER>
                            ) : ''}
                        </TitleBlock>
                    </>
                )}
                <StyledVid loop autoPlay>
                    <source src={backgroundVid} type="video/webm" />
                </StyledVid>

                <BG mode={mode} />
            </Container>
            {ui && matchData && overallStatsData && (
                <div style={{ display: 'flex', width: 1920 }}>
                    <StyledSelect value={gameNumber} onChange={handleGameChange}>
                        <option value="OVERALL">OVERALL</option>
                        {Array.from({ length: overallStatsData?.games?.length || 0 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                Game {i + 1}
                            </option>
                        ))}
                    </StyledSelect>
                    <ExportButton onClick={() => downloadImage(scoreBoardRef, matchData?.eventId, gameNumber)}>
                        Export
                    </ExportButton>
                </div>
            )}
        </>
    );
};

export default Scoreboard;
