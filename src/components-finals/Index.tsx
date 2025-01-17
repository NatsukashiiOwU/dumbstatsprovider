import { styled } from "@linaria/react";
import { useState } from "react";

const StyledIndex = styled.div`
  width: 3.5em;
  height: 100%;
  background-color: transparent;
  // dotted border
  border: dashed 1px #000000;
  color: #000000;
  display: flex;
  justify-content: center;
  font-family: 'Unbounded', sans-serif;
  font-weight: 600;
  font-size: 18px;
  align-items: center;
  margin-right: 0.22em;
`;

const Index = ({
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
      <StyledIndex {...props} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
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
      </StyledIndex>
    );
  };

  export default Index;