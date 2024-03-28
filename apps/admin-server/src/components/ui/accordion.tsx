import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';

type Item = {
    header: React.ReactNode;
    content: React.ReactNode;
};

type AccordionUIProps = {
    items: Item[];
};

const AccordionUI: React.FC<AccordionUIProps> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleAccordionChange = (index: number) => {
        setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    const isItemOpen = (index: number) => index === openIndex;

    return (
        <Accordion.Root className="AccordionRoot" type="single" collapsible>
            {items.map((item, index) => (
                <Accordion.Item key={index} className="AccordionItem" value={`item-${index}`}>
                    <Accordion.Header className="AccordionHeader" style={{ paddingBottom: '10px', borderBottom: '1px solid hsl(214.3 31.8% 91.4%)', marginBottom: '15px' }}>
                        <Accordion.Trigger className="AccordionTrigger" onClick={() => handleAccordionChange(index)} style={{ display: 'grid', justifyContent: 'space-between', gridTemplateColumns: 'repeat(2, auto)', width: '100%' }}>
                            {item.header}
                            {isItemOpen(index) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="AccordionContent" hidden={!isItemOpen(index)}>
                        <div className="AccordionContentText">{item.content}</div>
                    </Accordion.Content>
                </Accordion.Item>
            ))}
        </Accordion.Root>
    );
};

export default AccordionUI;
