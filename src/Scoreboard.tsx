import { styled } from '@linaria/react';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import background from './assets/background.png';
import logos from './assets/logos.png';
import domToImage from 'dom-to-image';
// import dummyResp from './assets/dummyResp.json?url'

const BackgroundImage = styled.div`
  position: relative;
  width: 1920px;
  height: 1080px;
  background: url(${background}), #1E1E1E;
  background-blend-mode: overlay;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
`;

type TitleProps = {
  position?: 'left' | 'right' | 'center';
  filled?: boolean;
  accentColor?: boolean;
  subTitle?: boolean;
};

const Title = styled.span<TitleProps>`
  //prop based positioning
  position: absolute;
  top: 1em;
  left: ${({ position }) =>
    position === 'left' ? '2em' : position === 'center' ? '50%' : 'auto'};
  right: ${({ position }) => (position === 'right' ? '2em' : 'auto')};
  transform: ${({ position }) =>
    position === 'center' ? 'translateX(-50%)' : 'none'};
  width: ${({ position }) => (position === 'center' ? 'auto' : 'fit-content')};
  text-align: ${({ position }) => {
    if (position === 'left') return 'left';
    if (position === 'right') return 'right';
    return 'center';
  }};

  margin-top: ${({ subTitle }) => (subTitle ? '1.2em' : '0')};

  //styling

  background-color: ${({ filled }) => (filled ? '#B0FF34' : 'transparent')};
  color: ${({ filled, accentColor }) =>
    filled ? '#1A1C1F' : accentColor ? '#B0FF34' : 'white'};
  font-family: 'Unbounded', sans-serif;
  font-weight: 900;
  font-size: 48px;
  padding-inline: 0.2em;
`;

const TeamsContainer = styled.div<{ position: 'left' | 'right' }>`
  width: 60em;
  position: absolute;
  top: 15em;
  left: ${({ position }) => (position === 'left' ? '7em' : 'auto')};
  right: ${({ position }) => (position === 'right' ? '7em' : 'auto')};
`;

const TeamWrapper = styled.div`
  width: 100%;
  height: 4.5em;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 0.8em;
`;

const Team = styled.div`
  width: 100%;
  height: 100%;
  background-color: #2a2c2d;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-inline: 1em;
`;

const TeamScore = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const TeamName = styled.div`
  height: 100%;
  min-width: 2em;
  font-family: 'Unbounded', sans-serif;
  font-size: 18px;
  color: #fcfcfc;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Index = styled.div`
  width: 3.5em;
  height: 100%;
  background-color: #2a2c2d;
  color: #fcfcfc;
  display: flex;
  justify-content: center;
  font-family: 'Unbounded', sans-serif;
  font-size: 18px;
  align-items: center;
  margin-right: 0.2em;
`;

const Earnings = styled.div`
  width: fit-content;
  min-width: 2em;
  height: 100%;
  color: #B0FF34;
  font-size: 18px;
  font-family: 'Unbounded', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 1em;
`;

const Score = styled.div`
  width: fit-content;
  min-width: 2em;
  height: 100%;
  color: #fcfcfc;
  font-size: 18px;
  font-family: 'Unbounded', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DividerWrapper = styled.div`
  width: fit-content;
  min-width: 2em;
  height: 100%;
  display: flex;
  color: #fcfcfc;
  justify-content: center;
  align-items: center;
`

const VerticalDivider = styled.div`
  margin-inline: 0.5em;
  height: calc(100% - 3em);
  width: 1px;
  background-color: #ffffff;
`;

const Kills = styled.div`
  width: fit-content;
  min-width: 2em;
  height: 100%;
  color: #fcfcfc;
  font-size: 18px;
  font-family: 'Unbounded', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StatsDesc = styled.div`
  color: #fcfcfc;
  font-size: 16px;
  font-family: 'Unbounded', sans-serif;
  display: block;
  left: 45.5em;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 6.65em;
`

const Logo = styled.div`
  position: absolute;
  width: 100%;
  height: 4em;
  background-image: url(${logos});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  margin: 0 auto;
  bottom: 2em;
  left: 50%;
  transform: translateX(-50%);
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
`;

const downloadImage = async (
  ref: React.RefObject<HTMLDivElement>,
  filename: string
) => {
  if (ref.current === null) return;

  try {
    const dataUrl = await domToImage.toPng(ref.current, {
      width: 1920,
      height: 1080,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error capturing image:', error);
  }
};

const EditableTitle = ({
  text,
  ...props
}: {
  text: string;
  [key: string]: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleText, setTitleText] = useState(text);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleText(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <Title {...props} onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <input
          placeholder="..."
          value={titleText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            backgroundColor: 'transparent',
            color: 'inherit',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
          }}
        />
      ) : (
        titleText
      )}
    </Title>
  );
};

const EditableTeamName = ({
  text,
  ...props
}: {
  text: string;
  [key: string]: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [teamText, setTeamText] = useState(text);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTeamText(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const placeholderShow = () => {
    if (teamText === '')
      setTeamText('Enter team name...')
  }

  const placeholderHide = () => {
    if (teamText === 'Enter team name...' || teamText === '')
      setTeamText('')
  }

  return (
    <TeamName {...props} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
      {isEditing ? (
        <input
          placeholder="..."
          value={teamText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            backgroundColor: 'transparent',
            color: 'inherit',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
          }}
        />
      ) : (
        teamText
      )}
    </TeamName>
  );
};

const EditableIndex = ({
  text,
  ...props
}: {
  text: string;
  [key: string]: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [indexText, setIndexText] = useState(text);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIndexText(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const placeholderShow = () => {
    if (indexText === '')
      setIndexText('Enter index...')
  }

  const placeholderHide = () => {
    if (indexText === 'Enter index...' || indexText === '')
      setIndexText('')
  }

  return (
    <Index {...props} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
      {isEditing ? (
        <input
          placeholder="..."
          value={indexText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            backgroundColor: 'transparent',
            color: 'inherit',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
          }}
        />
      ) : (
        indexText
      )}
    </Index>
  );
};

const EditableEarnings = ({
  text,
  ...props
}: {
  text: string;
  [key: string]: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [earningsText, setEarningsText] = useState(text);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEarningsText(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const placeholderShow = () => {
    if (earningsText === '')
      setEarningsText('Enter earnings...')
  }

  const placeholderHide = () => {
    if (earningsText === 'Enter earnings...' || earningsText === '')
      setEarningsText('')
  }

  return (
    <Earnings {...props} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
      {isEditing ? (
        <input
          placeholder="..."
          value={earningsText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            backgroundColor: 'transparent',
            color: 'inherit',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
          }}
        />
      ) : (
        earningsText
      )}
    </Earnings>
  );
};

const EditableKills = ({
  text,
  ...props
}: {
  text: string;
  [key: string]: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [killsText, setKillsText] = useState(text);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKillsText(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const placeholderShow = () => {
    if (killsText === '')
      setKillsText('Enter kills...')
  }

  const placeholderHide = () => {
    if (killsText === 'Enter kills...' || killsText === '')
      setKillsText('')
  }

  return (
    <Kills {...props} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
      {isEditing ? (
        <input
          placeholder="..."
          value={killsText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            backgroundColor: 'transparent',
            color: 'inherit',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
          }}
        />
      ) : (
        killsText
      )}
    </Kills>
  );
};

const EditableScore = ({
  text,
  ...props
}: {
  text: string;
  [key: string]: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [scoreText, setScoreText] = useState(text);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScoreText(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const placeholderShow = () => {
    if (scoreText === '')
      setScoreText('Enter score...')
  }

  const placeholderHide = () => {
    if (scoreText === 'Enter score...' || scoreText === '')
      setScoreText('')
  }

  return (
    <Score {...props} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
      {isEditing ? (
        <input
          placeholder="..."
          value={scoreText}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            backgroundColor: 'transparent',
            color: 'inherit',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
          }}
        />
      ) : (
        scoreText
      )}
    </Score>
  );
};

const EditableVerticalDivider = ({
  shown,
  ...props
}: {
  shown?: boolean;
  [key: string]: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [dividerShow, setdividerShow] = useState(shown || false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setdividerShow(event.target.checked);
  };

  const placeholderShow = () => {
    setIsEditing(true);
  }

  const placeholderHide = () => {
    setIsEditing(false);
  }

  return (
    <DividerWrapper {...props} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
      {isEditing ? (
        <input
          type='checkbox'
          placeholder="..."
          title='divider?'
          checked={dividerShow}
          onChange={handleInputChange}
        />
      ) : (
        dividerShow ? <VerticalDivider /> : dividerShow
      )}
    </DividerWrapper>
  );
}

interface TeamData {
  name: string;
  overall_stats: { position: string, score: string, kills: string };
}

const Scoreboard = ({ matchId, ui }: { matchId: string, ui: boolean }) => {
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

  const { isLoading:isLoadingMatch, error:errorMatch, data:matchData } = useQuery(
    {
      queryKey: ['match', matchId],
      queryFn: () =>
        fetch(`https://overstat.gg/api/match/${matchId}`).then(
          (res) => res.json()
        ),
    },
  );

  const { isLoading:isLoadingStats, error:errorStats, data:statsData } = useQuery(
    {
      queryKey: ['matchSummary', matchId],
      queryFn: () =>
        fetch(`https://overstat.gg/api/stats/${matchId}/overall`).then(
          (res) => res.json()
        ),
    },
  );

  useEffect(() => {
    if (errorMatch || errorStats) {
      console.error('Error fetching data:', errorMatch || errorStats);
    }
  }, [errorMatch || errorStats]);

  const teams = statsData?.teams || [];

  const displayedTeams: TeamData[] = teams.length < 20 ? [
    ...teams,
    ...Array.from({ length: 20 - teams.length }, (_, i) => ({
      name: '',
      overall_stats: { position: '', score: '', kills: '' },
    })),
  ] : teams;

  const leftTeams = displayedTeams.slice(0, 10);
  const rightTeams = displayedTeams.slice(10);

  //remove RD x 13YOG
  const matchName = matchData?.eventId.toUpperCase().replace(/RD X 13YOG/g, '') || 'Match Name';
  const matchTitle = matchName.split('|')[0];
  const matchSubtitle = matchName.split('|')[1];

  return (
    <>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=Unbounded:wght@200..900&display=swap');
        </style>
      </head>
      <BackgroundImage ref={scoreBoardRef}>
        {!(isLoadingMatch||isLoadingStats) && <EditableTitle text={matchTitle} position="left">
          QUALIFIER #2
        </EditableTitle>
        }
        {!(isLoadingMatch||isLoadingStats) && <EditableTitle text={matchSubtitle} position="left" filled subTitle>
          {''}
        </EditableTitle>
        }
        <EditableTitle text="REDRAGON X 13YOG" position="right">
          REDRAGON X 13YOG
        </EditableTitle>

        <EditableTitle text="LEAGUE" position="right" filled subTitle>
          LEAGUE
        </EditableTitle>

        <TeamsContainer position="left">
          {(isLoadingMatch||isLoadingStats) && <div>Loading teams...</div>}
          {!(isLoadingMatch||isLoadingStats) &&
            <StatsDesc>
            <span>kills</span>
            <span>score</span>
            </StatsDesc>}
          {!(isLoadingMatch||isLoadingStats) &&
            leftTeams.map((team: TeamData) => (
              <TeamWrapper key={team.name}>
                <EditableIndex text={team.overall_stats.position} />
                <Team>
                    <EditableTeamName text={team.name} />
                    <TeamScore>
                      <EditableEarnings text='' />
                      <EditableKills text={team.overall_stats.kills} />
                      {(team.overall_stats.kills === '' || team.overall_stats.score === '') ? <EditableVerticalDivider /> : <EditableVerticalDivider shown />}
                      <EditableScore text={team.overall_stats.score} />
                    </TeamScore>
                </Team>
              </TeamWrapper>
            ))}
        </TeamsContainer>
        <TeamsContainer position="right">
          {(isLoadingMatch||isLoadingStats) && <div>Loading teams...</div>}
          {!(isLoadingMatch||isLoadingStats) &&
            <StatsDesc>
            <span>kills</span>
            <span>score</span>
            </StatsDesc>}
          {!(isLoadingMatch||isLoadingStats) &&
            rightTeams.map((team: TeamData) => (
              <TeamWrapper key={team.name}>
                <EditableIndex text={team.overall_stats.position} />
                <Team>
                    <EditableTeamName text={team.name} />
                    <TeamScore>
                      <EditableEarnings text='' />
                      <EditableKills text={team.overall_stats.kills} />
                      {(team.overall_stats.kills === '' || team.overall_stats.score === '') ? <EditableVerticalDivider /> : <EditableVerticalDivider shown />}
                      <EditableScore text={team.overall_stats.score} />
                    </TeamScore>
                </Team>
              </TeamWrapper>
            ))}
        </TeamsContainer>
        <Logo />
      </BackgroundImage>
      {ui && <ExportButton onClick={() => downloadImage(scoreBoardRef, matchId)}>
        Export
      </ExportButton>}
    </>
  );
};

export default Scoreboard;
