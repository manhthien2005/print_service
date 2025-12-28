import type { PrinterModelResponse } from '@/types/api';

/**
 * Frontend PrinterModel type (matching ManagePrintersContent interface)
 */
export interface PrinterModel {
  modelId: string;
  brandId?: string;
  brandName: string;
  modelName: string;
  description: string;
  maxPaperSize: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
  imageUrl2D?: string;
  imageUrl3D?: string;
  createdAt: string;
}

/**
 * Maps PrinterModelResponse from backend to PrinterModel for frontend
 */
export function mapModelResponse(response: PrinterModelResponse): PrinterModel {
  return {
    modelId: response.modelId,
    brandId: response.brandId,
    brandName: response.brandName,
    modelName: response.modelName,
    description: response.description || '',
    maxPaperSize: response.maxPaperSizeName, // Map maxPaperSizeName → maxPaperSize
    supportsColor: response.supportsColor,
    supportsDuplex: response.supportsDuplex,
    imageUrl2D: response.image2dUrl, // Map image2dUrl → imageUrl2D
    imageUrl3D: response.image3dUrl, // Map image3dUrl → imageUrl3D
    createdAt: response.createdAt, // Already ISO string from JSON
  };
}

/**
 * Maps array of PrinterModelResponse to PrinterModel[]
 */
export function mapModelsResponse(
  responses: PrinterModelResponse[]
): PrinterModel[] {
  return responses.map(mapModelResponse);
}
