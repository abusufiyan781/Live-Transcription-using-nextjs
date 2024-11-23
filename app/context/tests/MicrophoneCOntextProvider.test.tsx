import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('Microphone access', () => {
  beforeAll(() => {
    // Mock getUserMedia to resolve with a mocked stream
    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue('mocked stream'),
      },
      writable: true,
    });
  });

  it('should successfully get microphone access', async () => {
    // Simulate a call to getUserMedia
    const mockFunction = navigator.mediaDevices.getUserMedia;
    const stream = await mockFunction({ audio: true });

    expect(stream).toBe('mocked stream');
    expect(mockFunction).toHaveBeenCalledWith({ audio: true });
  });
});

describe('Microphone access failure', () => {
    beforeAll(() => {
      // Mock getUserMedia to reject with an error
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
          getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied')),
        },
        writable: true,
      });
    });
  
    it('should reject microphone access on error', async () => {
      // Simulate a call to getUserMedia
      const mockFunction = navigator.mediaDevices.getUserMedia;
  
      await expect(mockFunction({ audio: true })).rejects.toThrow('Permission denied');
      expect(mockFunction).toHaveBeenCalledWith({ audio: true });
    });
  });
  