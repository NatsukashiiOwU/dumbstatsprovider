import { styled } from "@linaria/react";
import { useState } from "react";

const DividerWrapper = styled.div`
  width: fit-content;
  min-width: 2em;
  height: 100%;
  display: flex;
  color: #000000;
  justify-content: center;
  align-items: center;
`

const StyledVerticalDivider = styled.div`
  margin-inline: 0.5%;
  height: calc(100% - 20%);
  width: 0.1px;
  background-color: transparent;
  border: dashed 1px #000000;
  opacity: 0.35;
`;

const VerticalDivider = ({
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
                dividerShow ? <StyledVerticalDivider></StyledVerticalDivider> : dividerShow
            )}
        </DividerWrapper>
    );
}

export default VerticalDivider;
