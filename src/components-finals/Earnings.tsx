import { styled } from "@linaria/react";
import { useState } from "react";

const StyledEarnings = styled.div`
  width: fit-content;
  min-width: 2em;
  height: 100%;
  color: #B0FF34;
  font-size: 18px;
  font-family: 'Unbounded', sans-serif;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 1em;
`;

const Earnings = ({
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
      <StyledEarnings {...props} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
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
      </StyledEarnings>
    );
  };

  export default Earnings;