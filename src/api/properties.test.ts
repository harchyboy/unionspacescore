import { describe, it, expect, beforeEach, vi } from 'vitest';
import { listProperties, getProperty, createProperty, updateProperty, uploadDocument } from './properties';
import type { Property } from '../types/property';

let fetchMock: ReturnType<typeof vi.fn>;

describe('properties API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
  });

  describe('listProperties', () => {
    it('should fetch properties list with default params', async () => {
      const mockResponse = {
        properties: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await listProperties();

      expect(fetchMock).toHaveBeenCalledWith('/api/properties?', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('should include search params when provided', async () => {
      const mockResponse = {
        properties: [],
        total: 0,
        page: 1,
        limit: 10,
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await listProperties({
        search: 'test',
        marketingStatus: 'On Market',
        page: 2,
        limit: 20,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('search=test'),
        expect.any(Object)
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('marketingStatus=On+Market'),
        expect.any(Object)
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
    });

    it('should throw error on failed request', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(listProperties()).rejects.toThrow('API error: Not Found');
    });
  });

  describe('getProperty', () => {
    it('should fetch a single property by id', async () => {
      const mockProperty: Property = {
        id: 'test-id',
        name: 'Test Property',
        addressLine: '123 Test St',
        postcode: 'SW1A 1AA',
        city: 'London',
        country: 'United Kingdom',
        amenities: [],
        marketing: {
          visibility: 'Public',
          status: 'On Market',
          fitOut: 'Cat A',
        },
        units: [],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProperty,
      });

      const result = await getProperty('test-id');

      expect(fetchMock).toHaveBeenCalledWith('/api/properties/test-id', expect.any(Object));
      expect(result).toEqual(mockProperty);
    });
  });

  describe('createProperty', () => {
    it('should create a new property', async () => {
      const payload: Partial<Property> = {
        name: 'New Property',
        addressLine: '456 New St',
        postcode: 'EC1A 1BB',
        city: 'London',
        country: 'United Kingdom',
        amenities: [],
        marketing: {
          visibility: 'Private',
          status: 'Draft',
          fitOut: 'Shell',
        },
        units: [],
      };

      const mockCreated: Property = {
        id: 'new-id',
        ...payload,
      } as Property;

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCreated,
      });

      const result = await createProperty(payload);

      expect(fetchMock).toHaveBeenCalledWith('/api/properties', {
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(payload),
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('updateProperty', () => {
    it('should update an existing property', async () => {
      const updates: Partial<Property> = {
        name: 'Updated Property',
      };

      const mockUpdated: Property = {
        id: 'test-id',
        name: 'Updated Property',
        addressLine: '123 Test St',
        postcode: 'SW1A 1AA',
        city: 'London',
        country: 'United Kingdom',
        amenities: [],
        marketing: {
          visibility: 'Public',
          status: 'On Market',
          fitOut: 'Cat A',
        },
        units: [],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdated,
      });

      const result = await updateProperty('test-id', updates);

      expect(fetchMock).toHaveBeenCalledWith('/api/properties/test-id', {
        method: 'PATCH',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(updates),
      });
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document file', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        id: 'doc-123',
        url: '/documents/test-id/test.pdf',
        name: 'test.pdf',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadDocument('test-id', file);

      expect(fetchMock).toHaveBeenCalledWith('/api/properties/test-id/documents', {
        method: 'POST',
        body: expect.any(FormData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed upload', async () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Upload Failed',
      });

      await expect(uploadDocument('test-id', file)).rejects.toThrow('Upload error: Upload Failed');
    });
  });
});

