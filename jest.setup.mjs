import '@testing-library/jest-dom';

global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

import { ReadableStream } from 'node:stream/web';
global.ReadableStream = ReadableStream;
import { MessagePort } from 'node:worker_threads';
global.MessagePort = MessagePort;

// Mock Request and FormData for Jest environment
global.Request = class Request {};
global.FormData = class FormData {
  constructor() {
    this.data = {};
  }
  get(key) {
    return this.data[key];
  }
  getAll(key) {
    return [this.data[key]];
  }
  append(key, value) {
    this.data[key] = value;
  }
};