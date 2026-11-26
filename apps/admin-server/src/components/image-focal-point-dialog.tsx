import React, { useRef, useState } from 'react';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from './ui/dialog';

export type FocalPoint = { x: number; y: number };

const clampPercent = (value: number) =>
  Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 50;

export const clampFocalPoint = (point: FocalPoint): FocalPoint => ({
  x: clampPercent(point.x),
  y: clampPercent(point.y),
});

export const pointFromClick = (
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number }
): FocalPoint => {
  if (!rect.width || !rect.height) return { x: 50, y: 50 };
  return clampFocalPoint({
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100,
  });
};

const KEY_STEPS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export const movePointByKey = (
  point: FocalPoint,
  key: string,
  shiftKey: boolean
): FocalPoint | null => {
  const step = KEY_STEPS[key];
  if (!step) return null;
  const size = shiftKey ? 10 : 1;
  return clampFocalPoint({
    x: point.x + step[0] * size,
    y: point.y + step[1] * size,
  });
};

export const focalPointHintAfterCrop = (
  previous: FocalPoint | null | undefined
): string | null =>
  previous
    ? 'Afbeelding bijgesneden. Het focuspunt is gewist: stel het opnieuw in als dat nodig is.'
    : null;

export const describeFocalPoint = (point: FocalPoint) =>
  `Links ${Math.round(point.x)}%, boven ${Math.round(point.y)}%`;

const THIRDS_GRID =
  'linear-gradient(to right, transparent calc(33.333% - 0.5px), rgba(255,255,255,.7) calc(33.333% - 0.5px), rgba(255,255,255,.7) calc(33.333% + 0.5px), transparent calc(33.333% + 0.5px), transparent calc(66.666% - 0.5px), rgba(255,255,255,.7) calc(66.666% - 0.5px), rgba(255,255,255,.7) calc(66.666% + 0.5px), transparent calc(66.666% + 0.5px)),' +
  'linear-gradient(to bottom, transparent calc(33.333% - 0.5px), rgba(255,255,255,.7) calc(33.333% - 0.5px), rgba(255,255,255,.7) calc(33.333% + 0.5px), transparent calc(33.333% + 0.5px), transparent calc(66.666% - 0.5px), rgba(255,255,255,.7) calc(66.666% - 0.5px), rgba(255,255,255,.7) calc(66.666% + 0.5px), transparent calc(66.666% + 0.5px))';

const PercentField: React.FC<{
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ id, label, value, onChange }) => {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center rounded-md border focus-within:ring-2 focus-within:ring-ring">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          step={1}
          className="w-20 bg-transparent px-2 py-1 text-sm outline-none"
          value={draft ?? String(Math.round(value))}
          onChange={(event) => {
            setDraft(event.target.value);
            if (event.target.value !== '') onChange(Number(event.target.value));
          }}
          onBlur={() => setDraft(null)}
        />
        <span className="pr-2 text-sm text-muted-foreground">%</span>
      </div>
    </div>
  );
};

export const ImageFocalPointDialog: React.FC<{
  imageUrl: string;
  initialPoint?: FocalPoint | null;
  onSave: (point: FocalPoint | null) => void;
  onClose: () => void;
}> = ({ imageUrl, initialPoint, onSave, onClose }) => {
  const [point, setPoint] = useState<FocalPoint>(
    initialPoint ? clampFocalPoint(initialPoint) : { x: 50, y: 50 }
  );
  const [loadFailed, setLoadFailed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);
  const stopDragging = () => {
    draggingRef.current = false;
    setDragging(false);
  };
  const [focused, setFocused] = useState(false);
  const [keyAxis, setKeyAxis] = useState<'x' | 'y'>('x');

  const setFromPointer = (event: React.PointerEvent<HTMLDivElement>) =>
    setPoint(
      pointFromClick(
        event.clientX,
        event.clientY,
        event.currentTarget.getBoundingClientRect()
      )
    );

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <DialogContent className="max-w-xl">
        <DialogTitle>Focuspunt instellen</DialogTitle>
        <DialogDescription>
          Sleep de punt naar het belangrijkste deel van de foto. Klikken of de
          pijltjestoetsen werken ook.
        </DialogDescription>
        {loadFailed ? (
          <p className="p-4 text-center text-sm" role="alert">
            Deze afbeelding kan niet worden weergegeven.
          </p>
        ) : (
          <div
            role="slider"
            tabIndex={0}
            aria-label="Focuspunt"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(point[keyAxis])}
            aria-valuetext={describeFocalPoint(point)}
            className="relative mx-auto w-fit max-w-full cursor-crosshair touch-none select-none rounded outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              draggingRef.current = true;
              setDragging(true);
              setFromPointer(event);
            }}
            onPointerMove={(event) => {
              if (draggingRef.current) setFromPointer(event);
            }}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(event) => {
              const next = movePointByKey(point, event.key, event.shiftKey);
              if (!next) return;
              event.preventDefault();
              setKeyAxis(
                event.key === 'ArrowUp' || event.key === 'ArrowDown' ? 'y' : 'x'
              );
              setPoint(next);
            }}>
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              className="pointer-events-none block h-auto w-auto max-h-80 max-w-full"
              onError={() => setLoadFailed(true)}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 transition-opacity motion-reduce:transition-none"
              style={{
                backgroundImage: THIRDS_GRID,
                opacity: dragging || focused ? 1 : 0,
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-white/25 shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_2px_8px_rgba(0,0,0,0.4)]"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          </div>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <PercentField
            id="focal-point-left"
            label="Links"
            value={point.x}
            onChange={(x) =>
              setPoint((prev) => clampFocalPoint({ ...prev, x }))
            }
          />
          <PercentField
            id="focal-point-top"
            label="Boven"
            value={point.y}
            onChange={(y) =>
              setPoint((prev) => clampFocalPoint({ ...prev, y }))
            }
          />
        </div>
        {!loadFailed && (
          <div
            aria-hidden="true"
            className="w-48 overflow-hidden rounded border"
            style={{ aspectRatio: '16 / 9' }}>
            <img
              src={imageUrl}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectPosition: `${point.x}% ${point.y}%` }}
            />
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onSave(null)}>
            Herstellen naar midden
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuleren
          </Button>
          <Button
            type="button"
            disabled={loadFailed}
            onClick={() => onSave(clampFocalPoint(point))}>
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
