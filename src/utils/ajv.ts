// src/utils/ajv.ts
import addFormats from 'ajv-formats';
import Ajv2020 from 'ajv/dist/2020';

export const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
});

addFormats(ajv);
