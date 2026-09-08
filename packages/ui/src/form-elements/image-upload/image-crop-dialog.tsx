import {
  CropRect,
  buildImagePreviewUrl,
  parseImageCropUrl,
} from '@openstad-headless/lib/image-crop/crop-url';
import React, { FC, useEffect, useRef, useState } from 'react';
import Cropper, { Area, MediaSize } from 'react-easy-crop';

import { Button, SecondaryButton } from '../../button';
import './image-crop-dialog.css';

const PREVIEW_MAX_SIZE = 1600;

export type ImageCropDialogProps = {
  imageUrl: string;
  ratioWidth: number;
  ratioHeight: number;
  initialCrop?: CropRect | null;
  onConfirm: (crop: CropRect) => void;
  onCancel: () => void;
  onLoadError: () => void;
};

const ImageCropDialog: FC<ImageCropDialogProps> = ({
  imageUrl,
  ratioWidth,
  ratioHeight,
  initialCrop = null,
  onConfirm,
  onCancel,
  onLoadError,
}) => {
  const { baseUrl } = parseImageCropUrl(imageUrl);
  const previewUrl = buildImagePreviewUrl(baseUrl, PREVIEW_MAX_SIZE);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<CropRect | null>(initialCrop);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
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

  useEffect(() => {
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => {
      if (!cancelled) setLoadStatus('ready');
    };
    probe.onerror = () => {
      if (!cancelled) setLoadStatus('error');
    };
    probe.src = previewUrl;

    return () => {
      cancelled = true;
      probe.onload = null;
      probe.onerror = null;
    };
  }, [previewUrl]);

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

  const hasLoadError = loadStatus === 'error';
  const maxZoom = Math.max(3, minZoom * 3);
  const zoomStep = 0.25;

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
            if (hasLoadError) {
              onLoadError();
            } else {
              onCancel();
            }
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
          {hasLoadError ? (
            <p className="image-crop-dialog-message" role="alert">
              Deze afbeelding kan niet worden weergegeven en is daarom niet
              toegevoegd. Probeer een ander bestand.
            </p>
          ) : (
            cropSize &&
            loadStatus === 'ready' && (
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropSize={cropSize}
                minZoom={minZoom}
                maxZoom={maxZoom}
                initialCroppedAreaPercentages={initialCrop || undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onMediaLoaded={(media: MediaSize) =>
                  setMediaSize({ width: media.width, height: media.height })
                }
                onCropComplete={(croppedAreaPercentages: Area) => {
                  const { x, y, width, height } = croppedAreaPercentages;
                  if ([x, y, width, height].every(Number.isFinite)) {
                    setCroppedArea(croppedAreaPercentages);
                  }
                }}
              />
            )
          )}
        </div>
        {!hasLoadError && loadStatus === 'ready' && cropSize && (
          <div className="image-crop-dialog-zoom">
            <SecondaryButton
              type="button"
              aria-label="Uitzoomen"
              disabled={zoom <= minZoom}
              onClick={() => setZoom(Math.max(minZoom, zoom - zoomStep))}>
              -
            </SecondaryButton>
            <input
              type="range"
              aria-label="Zoomniveau"
              min={minZoom}
              max={maxZoom}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <SecondaryButton
              type="button"
              aria-label="Inzoomen"
              disabled={zoom >= maxZoom}
              onClick={() => setZoom(Math.min(maxZoom, zoom + zoomStep))}>
              +
            </SecondaryButton>
          </div>
        )}
        <div className="image-crop-dialog-actions">
          {hasLoadError ? (
            <Button type="button" onClick={onLoadError}>
              Sluiten
            </Button>
          ) : (
            <>
              <SecondaryButton type="button" onClick={onCancel}>
                Annuleren
              </SecondaryButton>
              <Button
                type="button"
                disabled={!croppedArea}
                onClick={() => croppedArea && onConfirm(croppedArea)}>
                Opslaan
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCropDialog;
