import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/src/lib/admin-auth";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const unauthorized = await requireAdminRequest(request);
    if (unauthorized) {
      return unauthorized;
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Selecione uma imagem para upload." },
        { status: 400 },
      );
    }

    const extension = ALLOWED_TYPES.get(image.type);
    if (!extension) {
      return NextResponse.json(
        { error: "Formato invalido. Use JPG, PNG ou WEBP." },
        { status: 400 },
      );
    }

    if (image.size <= 0 || image.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "A imagem deve ter no maximo 5 MB." },
        { status: 400 },
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const filename = `product-${randomUUID()}${extension}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      imagePath: `/uploads/products/${filename}`,
    });
  } catch (error) {
    console.error("POST /api/admin/uploads error", error);
    return NextResponse.json(
      { error: "Falha ao enviar imagem." },
      { status: 500 },
    );
  }
}
