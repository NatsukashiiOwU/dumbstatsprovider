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
import logos from './assets/logos.png';
import overlay from './assets/texture-overlay.png';
import noise from './assets/grunge_texture.png';
import testImage from './assets/test_image.png';

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

const Container = styled.div`
  position: relative;
  width: 1920px;
  height: 1080px;
  background: #D11F2D;
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
  opacity: 1;
  z-index: 0;
`;

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
  color: #FCFCFC;
  font-size: 16px;
  font-family: 'Unbounded', sans-serif;
  display: block;
  left: 85.5%;
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
};

const Team = styled.div<wrapperType>`
  width: 100%;
  height: 100%;
  background-color: ${({ mp }) => (mp === true ? '#1A1C1F' : '#D11F2D')};
  color: ${({ mp }) => (mp === true ? '#FFFFFF' : '#FCFCFC')};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-inline-start: 1.4em;
  padding-inline-end: 1em;
  z-index: 2;
`;

const TeamScore = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #FCFCFC;
  z-index: 2;
`;

const Logo = styled.div`
  position: absolute;
  width: 239px;
  height: 86.6px;
  background: url(${logos});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  margin: 0 auto;
  bottom: 3.5%;
  left: 50%;
  transform: translateX(-50.12%);
  z-index: 4;
  opacity: 1;
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
  color: #F6F5F5;
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
  color: #F6F5F5;
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

const TITLE = styled.div`
  color: #F6F5F5;
  font-size: 113px;
  font-family: 'Adderley', 'Unbounded', sans-serif;
  font-weight: 800;
  display: block;
  left: 37%;
  position: absolute;
  letter-spacing: 1.35%;
  width: 100%;
  top: 3.1%;
  z-index: 2;
`;

const XVSX = styled.div`
  color: #F6F5F5;
  font-size: 56px;
  font-family: 'Adderley', 'Unbounded', sans-serif;
  font-weight: 800;
  display: block;
  right: 66.4%;
  position: absolute;
  letter-spacing: 1.35%;
  top: 5.9%;
  z-index: 2;
`;

const RESULTS = styled.div`
  color: #F6F5F5;
  font-size: 56px;
  font-family: 'Adderley', 'Unbounded', sans-serif;
  font-weight: 800;
  left: 66.4%;
  position: absolute;
  letter-spacing: 1.35%;
  top: 5.8%;
  z-index: 2;
`;

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
  overall_stats: { position: string; score: string; kills: string; teamPlacement: string };
}

const Scoreboard = ({
  matchId,
  gameNumber,
  ui,
  setMatchId,
  setGameNumber,
}: {
  matchId: string;
  gameNumber: string;
  ui: boolean;
  setGameNumber: (newGameNumber: string) => void;
  setMatchId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const scoreBoardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

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
        queryFn: () => fetch(`https://overstat.gg/api/match/${matchId}`).then((res) => res.json()),
      },
      {
        queryKey: ['overallStats', matchId],
        queryFn: () => fetch(`https://overstat.gg/api/stats/${matchId}/overall`).then((res) => res.json()),
      },
      {
        queryKey: ['settings', matchId],
        queryFn: () => fetch(`	https://overstat.gg/api/settings/match/${matchId}`).then((res) => res.json()),
      },
      {
        queryKey: ['gameStats', matchId, gameNumber],
        queryFn: () => fetch(`https://overstat.gg/api/stats/${matchId}/${gameNumber}`).then((res) => res.json()),
      },
    ],
  });

  const isLoading = results.some((result) => result.isLoading);
  const error = results.find((result) => result.error)?.error;

  useEffect(() => {
    if (error) {
      console.error('Error fetching data:', error);
    }
  }, [error]);

  const matchData = results[0].data;
  const overallStatsData = results[1].data;
  const settings = results[2].data
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
    return matchData?.eventId.toUpperCase().replace(/RD X 13YOG LEAGUE SEASON 2/g, '') || 'Match Name';
  }, [matchData, gameNumber]);

  const [matchTitle, matchSubtitle] = useMemo(() => {
    return matchName.split('|').length > 1 ? [matchName.split('|')[0], matchName.split('|')[1]] : [matchName, ''];
  }, [matchName, gameNumber]);

  const handleGameChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newGameNumber = event.target.value;
    setGameNumber(newGameNumber);
    // Preserve query parameters (ui)
    const urlParams = new URLSearchParams(location.search);
    navigate(`/scoreboard/${matchId}/${newGameNumber}?${urlParams.toString()}`);
  };

  return (
    <>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=Unbounded:wght@200..900&display=swap');
        </style>
      </head>

      <Container ref={scoreBoardRef}>
        {isLoading && <div style={{ width: 0, height: 0 }}></div>}
        {error && <div>Error: {error?.message || 'An error occurred'}</div>}
        {/* <TestImage /> */}
        {!isLoading && !error && matchData && (
          <>
            <Noise src={noise} alt="noise" />
            <Overlay src={overlay} alt="overlay" />
            <div key={'titles' + gameNumber}>
              <TITLE>THE DRAGON II</TITLE>
              <XVSX>{matchName}</XVSX>
              <RESULTS>RESULTS</RESULTS>
            </div>

            <TeamsContainer key={'leftteams' + gameNumber} position="left">
              <StatsDesc>
                <span>kills</span>
                <span>score</span>
              </StatsDesc>

              {leftTeams.map((team: TeamData, index: number) => (
                <TeamWrapper key={team.name}>
                  <Index
                    text={gameNumber !== 'OVERALL' ? `${index + 1}` : team.overall_stats.position}
                    mp={settings.scoring.useMatchPoint && Number(team.overall_stats.score) >= settings.scoring.matchPointThreshold}
                  />
                  <Team mp={settings.scoring.useMatchPoint && Number(team.overall_stats.score) >= settings.scoring.matchPointThreshold}>
                    <TeamName text={team.name} />
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
                  </Team>
                </TeamWrapper>
              ))}
            </TeamsContainer>
            <TeamsContainer key={'rightteams' + gameNumber} position="right">
              <StatsDesc>
                <span>kills</span>
                <span>score</span>
              </StatsDesc>

              {rightTeams.map((team: TeamData, index: number) => (
                <TeamWrapper key={team.name}>
                  <Index
                    text={gameNumber !== 'OVERALL' ? `${leftTeams.length + index + 1}` : team.overall_stats.position}
                    mp={settings.scoring.useMatchPoint && Number(team.overall_stats.score) >= settings.scoring.matchPointThreshold}
                  />
                  <Team mp={settings.scoring.useMatchPoint && Number(team.overall_stats.score) >= settings.scoring.matchPointThreshold}>
                    <TeamName text={team.name} />
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
                  </Team>
                </TeamWrapper>
              ))}
            </TeamsContainer>
            <Logo />
          </>
        )}
        <BG />
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