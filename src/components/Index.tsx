import { styled } from '@linaria/react';
import { useState } from 'react';

type propsType = {
    mp: boolean;
    mode: 'scores' | 'teams';
};

const StyledIndex = styled.div<propsType>`
    width: 7.15%;
    height: 100%;
    display: flex;
    justify-content: center;
    font-family: 'Orbitron', sans-serif;
    font-size: 18px;
    align-items: center;
    /* margin-right: 0.5%; */
    /* Conditional background and text color */
    background-color: ${(props) => (props.mode === 'teams' ? '#1A1C1F' : props.mp ? '#000000' : '#400202')};
    border: 2px solid #FF0000;
    color: ${(props) => (props.mode === 'teams' ? '#FFFFFF' : props.mp ? '#FFFFFF' : '#FCFCFC')};
`;

const Index = ({
    text,
    mp,
    mode,
    ...props
}: {
    text: string;
    mp: boolean;
    mode: 'scores' | 'teams';
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
        if (indexText === '') setIndexText('Enter index...');
    };

    const placeholderHide = () => {
        if (indexText === 'Enter index...' || indexText === '') setIndexText('');
    };

    return (
        <StyledIndex
            {...props}
            mp={mp}
            mode={mode}
            onDoubleClick={handleDoubleClick}
            onMouseEnter={placeholderShow}
            onMouseLeave={placeholderHide}
        >
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
