import { NextResponse } from 'next/server';

export function badRequest(message = 'Faltan parámetros') {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(message = 'No autorizado') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function notFound(message = 'Recurso no encontrado') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function internalError(message = 'Error interno del servidor') {
  return NextResponse.json({ error: message }, { status: 500 });
}
