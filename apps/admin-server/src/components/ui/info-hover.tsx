import React from "react";
import * as HoverCard from '@radix-ui/react-hover-card';
import InfoIcon from "@/components/info-icon";

interface InfoDialogProps {
    content: React.ReactNode;
}

const InfoDialog: React.FC<InfoDialogProps> = ({ content }) => {
    const hoverCardStyle: React.CSSProperties = {
        borderRadius: '6px',
        padding: '20px',
        width: '300px',
        backgroundColor: 'white',
        boxShadow: 'rgba(14, 18, 22, 0.3) 0px 7px 30px 0px',
        fontSize: '1rem',
        fontWeight: '400',
        lineHeight: '1.3rem',
        zIndex: '11',
    };

    return (
        <HoverCard.Root openDelay={0.2} closeDelay={0}>
            <HoverCard.Trigger style={{ display: 'inline-block', verticalAlign: 'text-bottom' }}><InfoIcon /></HoverCard.Trigger>
            <HoverCard.Content
                style={hoverCardStyle}
                sideOffset={5}
                side="top"
            >
                {content}
            </HoverCard.Content>
        </HoverCard.Root>
    );
};

export default InfoDialog;
