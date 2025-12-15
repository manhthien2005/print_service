import type { BrandResponse } from '@/types/api';

/**
 * Frontend Brand type (matching ManagePrintersContent interface)
 */
export interface Brand {
  brandId: string;
  brandName: string;
  countryOfOrigin: string;
  website: string;
  createdAt: string;
}

/**
 * Maps BrandResponse from backend to Brand for frontend
 */
export function mapBrandResponse(response: BrandResponse): Brand {
  return {
    brandId: response.brandId,
    brandName: response.brandName,
    countryOfOrigin: response.countryOfOrigin,
    website: response.website,
    createdAt: response.createdAt, // Already ISO string from JSON
  };
}

/**
 * Maps array of BrandResponse to Brand[]
 */
export function mapBrandsResponse(responses: BrandResponse[]): Brand[] {
  return responses.map(mapBrandResponse);
}



