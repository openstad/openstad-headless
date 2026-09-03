import { useProject } from '@/hooks/use-project';
import {
  CropRect,
  buildImageCropUrl,
  buildImagePreviewUrl,
  parseImageCropUrl,
} from '@openstad-headless/lib/image-crop/crop-url';
import React, { useEffect, useState } from 'react';
import Cropper, { Area, MediaSize } from 'react-easy-crop';

import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';

const PREVIEW_MAX_SIZE = 1600;

export const ImageCropDialog: React.FC<{
  imageUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
}> = ({ imageUrl, onSave, onClose }) => {
  const { data } = useProject();
  const { baseUrl, crop: initialCrop, hasCrop } = parseImageCropUrl(imageUrl);
  const previewUrl = buildImagePreviewUrl(baseUrl, PREVIEW_MAX_SIZE);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [ratioWidth, setRatioWidth] = useState<number>(
    data?.config?.project?.imageCropRatioWidth || 16
  );
  const [ratioHeight, setRatioHeight] = useState<number>(
    data?.config?.project?.imageCropRatioHeight || 9
  );
  const [croppedArea, setCroppedArea] = useState<CropRect | null>(initialCrop);
  const [ratioTouched, setRatioTouched] = useState(false);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  const projectRatioWidth = data?.config?.project?.imageCropRatioWidth || 16;
  const projectRatioHeight = data?.config?.project?.imageCropRatioHeight || 9;

  useEffect(() => {
    if (!ratioTouched) {
      setRatioWidth(projectRatioWidth);
      setRatioHeight(projectRatioHeight);
    }
  }, [projectRatioWidth, projectRatioHeight, ratioTouched]);

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

  const aspect =
    ratioWidth > 0 && ratioHeight > 0 ? ratioWidth / ratioHeight : 16 / 9;

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
    if (!cropperEl) return;
    let rafId = 0;
    let attempts = 0;

    const measureWhenStable = () => {
      const rect = cropperEl.getBoundingClientRect();
      const isStable =
        Math.abs(rect.width - cropperEl.clientWidth) < 1 &&
        Math.abs(rect.height - cropperEl.clientHeight) < 1;
      if (!isStable && attempts < 60) {
        attempts += 1;
        rafId = requestAnimationFrame(measureWhenStable);
        return;
      }
      let width = cropperEl.clientWidth;
      let height = width / aspect;
      if (height > cropperEl.clientHeight) {
        height = cropperEl.clientHeight;
        width = height * aspect;
      }
      setCropSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    rafId = requestAnimationFrame(measureWhenStable);
    return () => cancelAnimationFrame(rafId);
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
    const nextMaxZoom = Math.max(3, nextMinZoom * 3);
    setMinZoom(nextMinZoom);
    setZoom((prev) => Math.min(Math.max(prev, nextMinZoom), nextMaxZoom));
  }, [cropSize, mediaSize]);

  const hasLoadError = loadStatus === 'error';
  const maxZoom = Math.max(3, minZoom * 3);
  const zoomStep = 0.25;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <DialogContent className="max-w-xl">
        <DialogTitle>Afbeelding bijsnijden</DialogTitle>
        <div
          className="relative w-full h-80"
          ref={setCropperEl}
          style={{
            background:
              'repeating-conic-gradient(#c8c8c8 0% 25%, #e8e8e8 0% 50%) 0 0 / 16px 16px',
          }}>
          {hasLoadError ? (
            <p
              className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm"
              role="alert">
              Deze afbeelding kan niet worden weergegeven en kan daarom niet
              worden bijgesneden.
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
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Uitzoomen"
              disabled={zoom <= minZoom}
              onClick={() => setZoom(Math.max(minZoom, zoom - zoomStep))}>
              -
            </Button>
            <input
              type="range"
              className="flex-1"
              aria-label="Zoomniveau"
              min={minZoom}
              max={maxZoom}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Inzoomen"
              disabled={zoom >= maxZoom}
              onClick={() => setZoom(Math.min(maxZoom, zoom + zoomStep))}>
              +
            </Button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            Verhouding breedte
            <Input
              type="number"
              min={1}
              className="w-24"
              value={ratioWidth}
              onChange={(event) => {
                setRatioTouched(true);
                setRatioWidth(Number(event.target.value));
              }}
            />
          </label>
          <span className="pb-2" aria-hidden="true">
            x
          </span>
          <label className="flex flex-col gap-1 text-sm">
            Verhouding hoogte
            <Input
              type="number"
              min={1}
              className="w-24"
              value={ratioHeight}
              onChange={(event) => {
                setRatioTouched(true);
                setRatioHeight(Number(event.target.value));
              }}
            />
          </label>
        </div>
        <DialogFooter>
          {hasCrop && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onSave(baseUrl)}>
              Herstel origineel
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuleren
          </Button>
          <Button
            type="button"
            disabled={!croppedArea || hasLoadError}
            onClick={() =>
              croppedArea && onSave(buildImageCropUrl(imageUrl, croppedArea))
            }>
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
