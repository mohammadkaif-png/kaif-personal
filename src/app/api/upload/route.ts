import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const blob = await put(file.name, file, {
        access: "public", allowOverwrite: true,
    });

    return NextResponse.json({ url: blob.url });
}
