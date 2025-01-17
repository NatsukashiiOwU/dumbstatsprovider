import { styled } from "@linaria/react";
import { useState } from "react";

const StyledKills = styled.div`
  width: fit-content;
  min-width: 2em;
  height: 100%;
  color: #000000;
  font-size: 18px;
  font-family: 'Unbounded', sans-serif;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Kills = ({
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
        <StyledKills {...props} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
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
        </StyledKills>
    );
};

export default Kills;