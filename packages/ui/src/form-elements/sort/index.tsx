// Drag-and-drop sort field using @dnd-kit/core

import React, { FC, useState, ReactNode, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormFieldDescription, Paragraph, } from "@utrecht/component-library-react";

import "./sort.css";

type OptionTitle = {
    key: string;
};

type Option = {
    titles?: OptionTitle[];
};

export type SortFieldProps = {
    options?: Option[];
    title?: string;
    description?: string;
    onSort?: (sorted: Option[]) => void;
    fieldKey: string;
    type?: string;
    defaultValue?: string;
    fieldOptions?: { value: string; label: string }[];
    onChange?: (e: { name: string; value: any }, triggerSetLastKey?: boolean) => void;
    prevPageText?: string;
    nextPageText?: string;
};

type SortableItemProps = {
    id: string;
    dragHandle: ReactNode;
    children: ReactNode;
};

const SortableItem: FC<SortableItemProps> = ({ id, dragHandle, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <span {...listeners}>{dragHandle}</span>
            {children}
        </div>
    );
};

const SortField: FC<SortFieldProps> = ({
    options = [],
    title,
    description,
    onChange,
    onSort,
    fieldKey
}) => {
    const [items, setItems] = useState(options);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex(opt => opt.titles?.[0]?.key === active.id);
            const newIndex = items.findIndex(opt => opt.titles?.[0]?.key === over?.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);
            if (onSort) onSort(newItems);
        }
    };

    useEffect(() => {
        const value = items.filter(opt => !!opt.titles)?.map(opt => opt.titles?.[0]?.key);
        onChange && onChange({
            name: fieldKey,
            value: JSON.stringify(value)
        });
    }, [items]);

    return (
        <div className="sort-field-container">
            <div className="sortable-intro">
                {title && (
                    <Paragraph className="utrecht-form-field__label">
                        <strong>{title}</strong>
                    </Paragraph>
                )}
                {description &&
                    <FormFieldDescription dangerouslySetInnerHTML={{ __html: description }} />
                }
            </div>
            <div className="sortable-context">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={items.map(opt => opt.titles?.[0]?.key || "")}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map((option, index) => (
                            <SortableItem
                                key={option.titles?.[0]?.key || index}
                                id={option.titles?.[0]?.key || String(index)}
                                dragHandle={<i className="ri-draggable"></i>}
                            >
                                <Paragraph className="sortable-item-title">{option.titles?.[0]?.key}</Paragraph>
                                <div className="sortable-item-actions">
                                    <button
                                        aria-label="Zet omhoog"
                                        disabled={index === 0}
                                        onClick={(e) => {
                                            if (index > 0) {
                                                const newItems = arrayMove(items, index, index - 1);
                                                setItems(newItems);
                                                if (onSort) onSort(newItems);
                                            }
                                            e.preventDefault();
                                        }}
                                    >
                                        <i className="ri-arrow-up-line"></i>
                                    </button>
                                    <button
                                        aria-label="Zet omlaag"
                                        disabled={index === items.length - 1}
                                        onClick={(e) => {
                                            if (index < items.length - 1) {
                                                const newItems = arrayMove(items, index, index + 1);
                                                setItems(newItems);
                                                if (onSort) onSort(newItems);
                                            }
                                            e.preventDefault();
                                        }}
                                    >
                                        <i className="ri-arrow-down-line"></i>
                                    </button>
                                </div>
                            </SortableItem>
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};

export default SortField;
