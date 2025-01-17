import VerticalDivider from "./components-finals/Divider";
import Score from "./components-finals/Score";
import Title from "./components-finals/Title";
import { styled } from '@linaria/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import background from './assets/background.png';
import logos from './assets/logos-grayscaled.png';
import domToImage from 'dom-to-image';
import overlay from './assets/overlay.png';
import noise from './assets/noise.png';
import { useNavigate } from 'react-router';
import TeamName from './components-finals/TeamName';
import Index from './components-finals/Index';
import Earnings from './components-finals/Earnings';
import Kills from './components-finals/Kills';

const Container = styled.div`
  position: relative;
  width: 1920px;
  height: 1080px;
  background:  #D9D9D9;
  background-blend-mode: overlay;
`;

const BG = styled.div`
    position: absolute;
    top: -100%;
    left: -100%;
    width: 200%;
    height: 200%;
    background-clip: padding-box;
    background-image: url(${background});
    opacity:0.08;
    z-index:0;
`

const Noise = styled.img`
  background: url(${noise});
  mix-blend-mode: screen; 
  opacity: 0;
  z-index:1;
`

const TeamsContainer = styled.div<{ position: 'left' | 'right' }>`
  width: 62.5em;
  position: absolute;
  top: 16em;
  left: ${({ position }) => (position === 'left' ? '5em' : 'auto')};
  right: ${({ position }) => (position === 'right' ? '5em' : 'auto')};
  z-index:2;
`;

const StatsDesc = styled.div`
  color: #000000;
  font-size: 16px;
  font-family: 'Unbounded', sans-serif;
  display: block;
  left: 47.7em;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 6.7em;
  padding-bottom: 0.5em;
  z-index:2;
`
const TeamWrapper = styled.div`
  width: 100%;
  height: 4.2em;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 1em;
  z-index:2;
`;

const Team = styled.div`
  width: 100%;
  height: 100%;
    background-color: transparent;
  // dotted border
  border: dashed 1px #000000;
  color: #000000;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-inline: 1em;
  z-index:2;
`;

const TeamScore = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index:2;
`

const Logo = styled.div`
  position: absolute;
  width: 100%;
  height: 4em;
  background: url(${logos});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  margin: 0 auto;
  bottom: 2em;
  left: 50%;
  transform: translateX(-50%);
  z-index:2;
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
  z-index:2;
`;

const StyledSelect = styled.select`
  width: 200px;
  padding: 10px;
  font-size: 16px;
  color: #b0ff34;
  background-color: #1a1c1f;
  z-index:2;
`;

const Stage = styled.div`
  color: #000000;
  font-size: 16px;
  font-family: 'Unbounded', sans-serif;
  display: block;
  left: 4%;
  position: absolute;
  top: 94%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  padding-bottom: 0.5em;
  z-index:2;
`

const WINNER = styled.div`
  color: #000000;
  font-size: 16px;
  font-family: 'Unbounded', sans-serif;
  display: block;
  left: 91.5%;
  position: absolute;
  top: 94%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index:2;
`

const GRANDFINAL = styled.div`
  color: #000000;
  font-size: 54px;
  font-family: 'Unbounded', sans-serif;
  font-weight: 800;
  display: block;
  left: 37%;
  position: absolute;
  width:100%;
  top: 6%;
  z-index:2;
`

const REDRAGONX13YOG  = styled.div`
  color: #000000;
  font-size: 28px;
  font-family: 'Unbounded', sans-serif;
  font-weight: 800;
  display: block;
  left: 36%;
  position: absolute;
  top: 13%;
  z-index:2;
`

const LEAGUE = styled.div`
  color: #000000;
  background-color: #b0ff34;
  font-size: 28px;
  font-family: 'Unbounded', sans-serif;
  font-weight: 800;
  display: block;
  left: 55%;
  position: absolute;
  top: 13%;
  z-index:2;
`

const downloadImage = async (
    ref: React.RefObject<HTMLDivElement>,
    match: string,
    game?: string
) => {
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
    overall_stats: { position: string, score: string, kills: string, teamPlacement: string };
}

const ScoreboardFinals = ({ matchId, gameNumber, ui, setMatchId, setGameNumber }: { matchId: string, gameNumber: string, ui: boolean, setGameNumber: React.Dispatch<React.SetStateAction<string>>, setMatchId: React.Dispatch<React.SetStateAction<string>>, }) => {
    const scoreBoardRef = useRef<HTMLDivElement>(null);
    // dummy fetch
    // const { isLoading, error, data } = useQuery(
    //   {
    //     queryKey: ['matchSummary', matchId],
    //     queryFn: () =>
    //       fetch(dummyResp).then(
    //         (res) => res.json()
    //       )
    //   }
    // )

    const results = useQueries({
        queries: [
            {
                queryKey: ['match', matchId],
                queryFn: () => fetch(`https://overstat.gg/api/match/${matchId}`).then(res => res.json()),
            },
            {
                queryKey: ['overallStats', matchId],
                queryFn: () => fetch(`https://overstat.gg/api/stats/${matchId}/overall`).then(res => res.json()),
            },
            {
                queryKey: ['gameStats', matchId, gameNumber],
                queryFn: () => fetch(`https://overstat.gg/api/stats/${matchId}/${gameNumber}`).then(res => res.json()),
            },
        ],
    });

    const isLoading = results.some(result => result.isLoading);
    const error = results.find(result => result.error)?.error;

    useEffect(() => {
        if (error) {
            console.error('Error fetching data:', error);
        }
    }, [error]);

    const matchData = results[0].data;
    const overallStatsData = results[1].data;
    const gameStatsData = results[2].data;

    const teams = useMemo(() => {
        if (gameNumber !== 'OVERALL' && gameStatsData?.teams) {
            return gameStatsData.teams;
        } else if (overallStatsData?.teams) {
            return overallStatsData.teams;
        } else {
            return []
        }
    }, [gameNumber, gameStatsData, overallStatsData]);

    const [leftTeams, rightTeams] = useMemo(() => {
        return teams ? [teams.slice(0, Math.ceil(teams?.length / 2)), teams.slice(Math.ceil(teams?.length / 2))] : [[], []];
    }, [teams, gameNumber]);

    const matchName = useMemo(() => {
        return matchData?.eventId.toUpperCase().replace(/RD X 13YOG GRAND FINALS/g, '') || 'Match Name';
    }, [matchData, gameNumber]);

    const [matchTitle, matchSubtitle] = useMemo(() => {
        return matchName.split('|').length > 1 ? [matchName.split('|')[0], matchName.split('|')[1]] : [matchName, ""];
    }, [matchName, gameNumber])

    const navigate = useNavigate();

    const handleGameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (event.target.value === 'OVERALL') {
            setGameNumber('OVERALL');
            return;
        }
        setGameNumber(event.target.value);
    };

    return (
        <>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=Unbounded:wght@200..900&display=swap');
                </style>
            </head>

            <Container ref={scoreBoardRef}>
                {isLoading && <div>Loading...</div>}
                {error && <div>Error: {error?.message || "An error occurred"}</div>}
                <Noise src={noise} alt="noise"></Noise>
                {!isLoading && !error && matchData && (
                    <>
                        <div key={'titles' + gameNumber}>
                            <GRANDFINAL>GRAND FINAL</GRANDFINAL>
                            <REDRAGONX13YOG>REDRAGONX13YOG</REDRAGONX13YOG>
                            <LEAGUE>LEAGUE</LEAGUE>
                        </div>

                        <TeamsContainer key={'leftteams' + gameNumber} position="left">

                            <StatsDesc>
                                <span>kills</span>
                                <span>score</span>
                            </StatsDesc>

                            {leftTeams.map((team: TeamData) => (
                                <TeamWrapper key={team.name}>
                                    <Index text={gameNumber !== 'OVERALL' ? team.overall_stats.teamPlacement : team.overall_stats.position } />
                                    <Team>
                                        <TeamName text={team.name} />
                                        <TeamScore>
                                            <Earnings text='' />
                                            <Kills text={team.overall_stats.kills} />
                                            {(team.overall_stats.kills === '' || team.overall_stats.score === '') ? <VerticalDivider /> : <VerticalDivider shown />}
                                            <Score text={team.overall_stats.score} />
                                        </TeamScore>
                                    </Team>
                                </TeamWrapper>
                            ))}
                        </TeamsContainer>
                        <TeamsContainer key={'rightteams' + gameNumber} position="right">

                            <StatsDesc>
                                <span>kills</span>
                                <span>score</span>
                            </StatsDesc>

                            {rightTeams.map((team: TeamData) => (
                                <TeamWrapper key={team.name}>
                                    <Index text={gameNumber !== 'OVERALL' ? team.overall_stats.teamPlacement : team.overall_stats.position } />
                                    <Team>
                                        <TeamName text={team.name} />
                                        <TeamScore>
                                            <Earnings text='' />
                                            <Kills text={team.overall_stats.kills} />
                                            {(team.overall_stats.kills === '' || team.overall_stats.score === '') ? <VerticalDivider /> : <VerticalDivider shown />}
                                            <Score text={team.overall_stats.score} />
                                        </TeamScore>
                                    </Team>
                                </TeamWrapper>
                            ))}
                        </TeamsContainer>
                        <Logo />
                        <Stage>GROUP STAGE</Stage>
                        <WINNER>WINNERS</WINNER>
                    </>
                )}
                <BG/>
            </Container>
            {ui && matchData && overallStatsData && (
                <div style={{display: "flex", width: 1920}}>
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

export default ScoreboardFinals;
