import { CropRect } from '@openstad-headless/lib/image-crop/crop-url';
import { FC } from 'react';
import './image-crop-dialog.css';
export type ImageCropDialogProps = {
    imageUrl: string;
    ratioWidth: number;
    ratioHeight: number;
    initialCrop?: CropRect | null;
    onConfirm: (crop: CropRect) => void;
    onCancel: () => void;
    onLoadError: () => void;
};
declare const ImageCropDialog: FC<ImageCropDialogProps>;
export default ImageCropDialog;
