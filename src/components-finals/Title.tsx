import { styled } from "@linaria/react";
import { useState } from "react";

type TitleProps = {
    position?: 'left' | 'right' | 'center';
    filled?: boolean;
    accentColor?: boolean;
    subTitle?: boolean;
};

const StyledTitle = styled.span<TitleProps>`
  //prop based positioning
  position: absolute;
  top: 1.3em;
  left: ${({ position }) =>
        position === 'left' ? '1.2em' : position === 'center' ? '50%' : 'auto'};
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
  z-index:2;
`;

const Title = ({
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
        <StyledTitle {...props} onDoubleClick={handleDoubleClick}>
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
        </StyledTitle>
    );
};

export default Title;