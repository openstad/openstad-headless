import {
  CropRect,
  parseImageCropUrl,
} from '@openstad-headless/lib/image-crop/crop-url';
import React, { FC, useEffect, useRef, useState } from 'react';
import Cropper, { Area, MediaSize } from 'react-easy-crop';

import { Button, SecondaryButton } from '../../button';
import './image-crop-dialog.css';

export type ImageCropDialogProps = {
  imageUrl: string;
  ratioWidth: number;
  ratioHeight: number;
  initialCrop?: CropRect | null;
  onConfirm: (crop: CropRect) => void;
  onCancel: () => void;
};

const ImageCropDialog: FC<ImageCropDialogProps> = ({
  imageUrl,
  ratioWidth,
  ratioHeight,
  initialCrop = null,
  onConfirm,
  onCancel,
}) => {
  const { baseUrl } = parseImageCropUrl(imageUrl);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropRect | null>(
    initialCrop
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const [cropperEl, setCropperEl] = useState<HTMLDivElement | null>(null);
  const [cropSize, setCropSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [mediaSize, setMediaSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [minZoom, setMinZoom] = useState(1);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const aspect = ratioWidth / ratioHeight;

  useEffect(() => {
    if (!cropperEl) return;
    let width = cropperEl.clientWidth;
    let height = width / aspect;
    if (height > cropperEl.clientHeight) {
      height = cropperEl.clientHeight;
      width = height * aspect;
    }
    setCropSize({ width: Math.floor(width), height: Math.floor(height) });
  }, [cropperEl, aspect]);

  useEffect(() => {
    if (!cropSize || !mediaSize || !mediaSize.width || !mediaSize.height) {
      return;
    }
    const coverZoom = Math.max(
      cropSize.width / mediaSize.width,
      cropSize.height / mediaSize.height
    );
    const nextMinZoom = Math.max(1, coverZoom);
    setMinZoom(nextMinZoom);
    setZoom((prev) => (prev < nextMinZoom ? nextMinZoom : prev));
  }, [cropSize, mediaSize]);

  return (
    <div className="image-crop-dialog-overlay">
      <div
        className="image-crop-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Afbeelding bijsnijden"
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onCancel();
            return;
          }
          if (event.key !== 'Tab') return;
          const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusable || focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey) {
            if (
              document.activeElement === first ||
              document.activeElement === dialogRef.current
            ) {
              event.preventDefault();
              last.focus();
            }
          } else if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}>
        <div className="image-crop-dialog-cropper" ref={setCropperEl}>
          {cropSize && (
            <Cropper
              image={baseUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropSize={cropSize}
              minZoom={minZoom}
              maxZoom={Math.max(3, minZoom * 3)}
              initialCroppedAreaPixels={initialCrop || undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onMediaLoaded={(media: MediaSize) =>
                setMediaSize({ width: media.width, height: media.height })
              }
              onCropComplete={(
                croppedArea: Area,
                croppedAreaInPixels: Area
              ) => {
                const { x, y, width, height } = croppedAreaInPixels;
                if ([x, y, width, height].every(Number.isFinite)) {
                  setCroppedAreaPixels(croppedAreaInPixels);
                }
              }}
            />
          )}
        </div>
        <div className="image-crop-dialog-actions">
          <SecondaryButton type="button" onClick={onCancel}>
            Annuleren
          </SecondaryButton>
          <Button
            type="button"
            disabled={!croppedAreaPixels}
            onClick={() => croppedAreaPixels && onConfirm(croppedAreaPixels)}>
            Opslaan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropDialog;
