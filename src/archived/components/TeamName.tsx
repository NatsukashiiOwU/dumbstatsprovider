import { styled } from "@linaria/react";
import { useState } from "react";

const StyledTeamName = styled.div`
  height: 100%;
  min-width: 2em;
  font-family: 'Unbounded', sans-serif;
  font-size: 18px;
  color: #fcfcfc;
  display: flex;
  justify-content: center;
  align-items: center;
`

const TeamName = ({
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
        <StyledTeamName {...props} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
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
        </StyledTeamName>
    );
};

export default TeamName;