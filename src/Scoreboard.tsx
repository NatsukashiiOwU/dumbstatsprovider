import { styled } from '@linaria/react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import background from './assets/background.png'
import logos from './assets/logos.png'
import domToImage from 'dom-to-image';


const BackgroundImage = styled.div`
  position: relative;
  width: 1920px;
  height: 1080px;
  background: url(${background}), #1E1E1E;
  background-blend-mode: overlay;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
`

type TitleProps = {
  position?: "left" | "right" | "center",
  filled?: boolean,
  accentColor?: boolean,
  subTitle?: boolean
}

const Title = styled.span<TitleProps>`

        //prop based positioning
        position: absolute;
        top: 1em;
        left: ${({ position }) => (position === 'left' ? '2em' : (position === 'center' ? '50%' : 'auto'))};
        right: ${({ position }) => (position === 'right' ? '2em' : 'auto')};
        transform: ${({ position }) => (position === 'center' ? 'translateX(-50%)' : 'none')};
        width: ${({ position }) => (position === 'center' ? 'auto' : 'fit-content')};
        text-align: ${({ position }) => {
          if (position === 'left') return 'left';
          if (position === 'right') return 'right';
          return 'center';
        }};

        margin-top: ${({ subTitle }) => (subTitle ? '1.2em' : '0')};

        //styling

        background-color: ${({ filled }) => (filled ? '#B0FF34' : 'transparent')};
        color: ${({ filled, accentColor }) => (filled ? '#1A1C1F' : (accentColor ? '#B0FF34' : 'white'))};
        font-family: "Unbounded", sans-serif;
        font-weight: 900;
        font-size: 48px;
`


const TeamsContainer = styled.div<{ position: "left" | "right" }>`
    width: 61em;
    position: absolute;
    top: 16em;
    left: ${({ position }) => (position === 'left' ? '5%' : 'auto')};
    right: ${({ position }) => (position === 'right' ? '5%' : 'auto')};
`

const TeamWrapper = styled.div`
  width: 100%;
  height: 4.5em;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 0.8em;
`

const Team = styled.div`
  width: 100%;
  height: 100%;
  background-color: #2A2C2D;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: "Unbounded", sans-serif;
  font-size: 18px;
  color: #FCFCFC;
  padding-left: 1em;
`

const Place = styled.div`
  width: 3.5em;
  height: 100%;
  background-color: #2A2C2D;
  color: #FCFCFC;
  display: flex;
  justify-content: center;
  font-family: "Unbounded", sans-serif;
  font-size: 18px;
  align-items: center;
  margin-right: 0.2em;
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
`

const ExportButton = styled.button`
width:1920px;
background-color: #B0FF34;
color: #1A1C1F;
font-family: "Unbounded", sans-serif;
font-weight: 900;
font-size: 2em;
border: none;
padding: 0.5em 1em;
cursor: pointer;
`

const downloadImage = async (ref: React.RefObject<HTMLDivElement>, filename: string) => {
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

const EditableTitle = ({ text, ...props }: { text: string, [key: string]: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [titleText, setTitleText] = useState(text);

  const handleMouseEnter = () => {
    setIsEditing(true);
  };

  const handleMouseLeave = () => {
    setIsEditing(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleText(event.target.value);
  };

  

  return (
    <Title {...props} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {isEditing ? (
        <input
          placeholder='...'
          value={titleText}
          onChange={handleInputChange}
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

const Scoreboard = ({ matchId }: { matchId: string }) => {
    const scoreBoardRef = React.useRef<HTMLDivElement>(null);

    const { isLoading, error, data } = useQuery(
        {
            queryKey: ['matchSummary', matchId],
            queryFn: () => fetch(`https://overstat.gg/api/stats/${matchId}/overall`).then((res) =>
              res.json()
            ),
        }
    );

    if (isLoading) return <div>Loading...</div>;

    if (error) return <div>An error has occurred: {error.message}</div>;

    // Split the teams into two arrays: leftTeams (max 10) and rightTeams
    const leftTeams = data.teams.slice(0, 10);
    const rightTeams = data.teams.slice(10);

    return (
        <>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=Unbounded:wght@200..900&display=swap');
                </style>
            </head>
            <BackgroundImage ref={scoreBoardRef}>
            
                <EditableTitle position="left" accentColor text="QUALIFIER#2" />

                <Title position="right">REDRAGON X 13YOG</Title>

                <Title position="right" filled subTitle>LEAGUE</Title>

                <TeamsContainer position='left'>
                    {leftTeams.map((team: any, index: number) => (
                        <TeamWrapper color={team.color}>
                            <Place>{index + 1}</Place>
                            <Team>{team.name}</Team>
                        </TeamWrapper>
                    ))}
                </TeamsContainer>
                <TeamsContainer position='right'>
                    {rightTeams.map((team: any, index: number) => (
                        <TeamWrapper color={team.color}>
                            <Place>{index + leftTeams.length + 1}</Place>
                            <Team>{team.name}</Team>
                        </TeamWrapper>
                    ))}
                </TeamsContainer>
                <Logo />
            </BackgroundImage>
            <ExportButton onClick={() => downloadImage(scoreBoardRef, matchId)}>Export</ExportButton>
        </>
    );
};

export default Scoreboard;