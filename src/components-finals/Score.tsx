import { styled } from "@linaria/react";
import { useState } from "react";

const StyledScore = styled.div`
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

const Score = ({
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
      <StyledScore {...props} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
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
      </StyledScore>
    );
  };

  export default Score;