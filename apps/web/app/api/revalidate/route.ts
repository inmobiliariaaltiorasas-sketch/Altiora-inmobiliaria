import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? 'dev-revalidate-secret';

/** Llamado por NestJS tras cambios de precio/disponibilidad — ver WebRevalidationService (v1 sección 22). */
export async function POST(request: Request): Promise<NextResponse> {
  if (request.headers.get('x-revalidate-secret') !== REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { paths?: string[] };
  const paths = body.paths ?? [];

  for (const path of paths) {
    for (const locale of ['es-CO', 'en-US']) {
      revalidatePath(`/${locale}${path}`);
    }
  }

  return NextResponse.json({ revalidated: paths });
}
