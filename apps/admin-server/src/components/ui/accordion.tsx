import React, { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

const AccordionUI = ({ items }) => {
    const [openIndex, setOpenIndex] = useState(-1);

    const handleAccordionChange = (index) => {
        setOpenIndex((prevIndex) => (prevIndex === index ? -1 : index));
    };

    const isItemOpen = (index) => index === openIndex;

    return (
        <Accordion.Root className="AccordionRoot" type="single" collapsible>
            {items.map((item, index) => (
                <Accordion.Item key={index} className="AccordionItem" value={`item-${index}`}>
                    <Accordion.Header className="AccordionHeader" style={{paddingBottom: '10px', borderBottom: '1px solid hsl(214.3 31.8% 91.4%)', marginBottom: '15px'}}>
                        <Accordion.Trigger className="AccordionTrigger" onClick={() => handleAccordionChange(index)} style={{display: 'grid', justifyContent: 'space-between', gridTemplateColumns: 'repeat(2, auto)', width: '100%'}}>
                            {item.header}
                            {isItemOpen(index) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="AccordionContent" hidden={index !== openIndex}>
                        <div className="AccordionContentText">{item.content}</div>
                    </Accordion.Content>
                </Accordion.Item>
            ))}
        </Accordion.Root>
    );
};

export default AccordionUI;
