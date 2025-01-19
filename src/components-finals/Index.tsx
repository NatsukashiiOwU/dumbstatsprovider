import { styled } from "@linaria/react";
import { useState } from "react";

type propsType = {
  mp: boolean;
}

const StyledIndex = styled.div<propsType>`
  width: 7%;
  height: 100%;
  background-color: ${({mp}) => mp === true ? '#1a1c1f49' : 'transparent'};
  // dotted border
  border: dashed 1px #000000;
  color: ${({mp}) => mp === true ? '#FFFFFF' : '#000000'};
  display: flex;
  justify-content: center;
  font-family: 'Unbounded', sans-serif;
  font-weight: 500;
  font-size: 18px;
  align-items: center;
  margin-right: 0.5%;
`;

const Index = ({
    text,
    mp,
    ...props
  }: {
    text: string;
    mp: boolean;
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
      <StyledIndex {...props} mp={mp} onDoubleClick={handleDoubleClick} onMouseEnter={placeholderShow} onMouseLeave={placeholderHide}>
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