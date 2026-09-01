import { NextResponse } from 'next/server';

/**
 * La lógica comercial de WhatsApp vive en NestJS (módulo `whatsapp`), no acá — ver v1 sección 14.
 * Este stub existe solo para reservar la ruta; se implementa en Fase 2 como proxy de verificación
 * hacia la API, nunca con lógica de negocio propia.
 */
export async function GET() {
  return NextResponse.json({ message: 'WhatsApp webhook — disponible en Fase 2' }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: 'WhatsApp webhook — disponible en Fase 2' }, { status: 501 });
}
