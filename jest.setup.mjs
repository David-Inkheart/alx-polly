import '@testing-library/jest-dom';

global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

import { ReadableStream } from 'node:stream/web';
global.ReadableStream = ReadableStream;
import { MessagePort } from 'node:worker_threads';
global.MessagePort = MessagePort;