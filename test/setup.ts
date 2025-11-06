import '@testing-library/jest-dom';
import 'jest-canvas-mock';

//import { vi } from 'vitest';

// Object.defineProperty(window, 'matchMedia', {
//     writable: true,
//     value: jest.fn().mockImplementation((query) => ({
//         matches: false,
//         media: query,
//         onchange: null,
//         addListener: jest.fn(),
//         removeListener: jest.fn(),
//         addEventListener: jest.fn(),
//         removeEventListener: jest.fn(),
//         dispatchEvent: jest.fn()
//     }))
// })

console.log('Setup file loaded');
// Blob URL helpers so writeImage/ImageUploader don’t crash
global.URL.createObjectURL = jest.fn(() => 'blob://test');
global.URL.revokeObjectURL = jest.fn();