/**
 * @fileoverview Types and lookups for generated/api.json, the delphi.ai API manifest.
 * Copyright 2026 Delphi Tech. All Rights Reserved.
 * Author: pstefanou12@
 */

import raw from './generated/api.json';

/** A constructor argument. */
export interface Param {
  name: string;
  type: string | null;
  default: string | null;
  kind: string;
  description: string;
}

/** A public method of a model. */
export interface Method {
  name: string;
  signature: string;
  summary: string;
  definedIn: string;
}

/** A hyperparameter: one field of a pydantic config. */
export interface ConfigField {
  name: string;
  group: string;
  declaredIn: string;
  type: string | null;
  default: string | null;
  required: boolean;
  description: string;
}

/** A pydantic config class and its fields. */
export interface Config {
  name: string;
  module: string;
  fields: ConfigField[];
}

/** Everything the docs know about one model class. */
export interface Model {
  key: string;
  module: string;
  className: string;
  summary: string;
  docstring: string;
  attributes: Record<string, string>;
  params: Param[];
  raises: Record<string, string>;
  estimateSuffixes: string[];
  methods: Method[];
  config: string | null;
}

interface Api {
  version: string | null;
  models: Record<string, Model>;
  configs: Record<string, Config>;
}

// Safe: extract_api.py writes exactly this shape, and `npm run
// typecheck:delphi` cannot check JSON against an interface.
const api = raw as Api;

/** The delphi.ai release the API was extracted from. */
export const version = api.version;

/** Returns a model's API record by its registry key. */
export function model(key: string): Model | undefined {
  return api.models[key];
}

/** Returns a config class by name. */
export function config(name: string | null): Config | undefined {
  return name ? api.configs[name] : undefined;
}
