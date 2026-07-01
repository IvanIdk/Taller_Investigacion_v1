#!/usr/bin/env node
/**
 * Ajusta rutas de cobertura para SonarCloud en monorepo (frontend/ + backend/).
 * Vitest/pytest emiten rutas relativas al paquete; Sonar indexa desde la raíz del repo.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const lcovPath = join(root, 'frontend/coverage/lcov.info');
if (existsSync(lcovPath)) {
  const original = readFileSync(lcovPath, 'utf8');
  const rewritten = original.replace(/^SF:(.+)$/gm, (_, rawPath) => {
    const path = rawPath.replace(/\\/g, '/');
    if (path.startsWith('frontend/')) return `SF:${path}`;
    return `SF:frontend/${path}`;
  });
  writeFileSync(lcovPath, rewritten, 'utf8');
  console.log('fix-sonar-coverage: lcov paths prefixed with frontend/');
} else {
  console.error('Missing frontend/coverage/lcov.info');
  process.exit(1);
}

const xmlPath = join(root, 'backend/coverage.xml');
if (existsSync(xmlPath)) {
  let xml = readFileSync(xmlPath, 'utf8');
  xml = xml.replace(/filename="(?!backend\/)([^"]+\.py)"/g, 'filename="backend/$1"');
  xml = xml.replace(/<source>[\s\S]*?<\/source>/, '<source>.</source>');
  writeFileSync(xmlPath, xml, 'utf8');
  console.log('fix-sonar-coverage: coverage.xml paths prefixed with backend/');
} else {
  console.error('Missing backend/coverage.xml');
  process.exit(1);
}
