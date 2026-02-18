"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PostPage() {
  const router = useRouter();

  const [type, setType] = useState<"audio" | "image" | "video">("audio");
  const [title, setTitle] = useState("");

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Reset files when switching type
  useEffect(() => {
    setAudioFile(null);
    setCoverFile(null);
    setMediaFile(null);
  }, [type]);

  const compressToSquare480 = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result as string;
      };

      img.onload = () => {
        const size = 480;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = size;
        canvas.height = size;

        // Crop center square
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx?.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            resolve(new File([blob], file.name, { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.9 // compression quality
        );
      };

      reader.readAsDataURL(file);
    });
  };

  // Force boolean return
  const canUpload =
    type === "audio"
      ? Boolean(audioFile && coverFile && title.trim())
      : Boolean(mediaFile && title.trim());

  const uploadToStorage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage.from("media").getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleUpload = async () => {
    if (!canUpload || uploading) return;

    setUploading(true);
    console.log("Upload started");

    try {
      if (type === "audio") {
        console.log("Uploading audio + cover");

        const compressedCover = await compressToSquare480(coverFile!);
        const audioUrl = await uploadToStorage(audioFile!);
        const coverUrl = await uploadToStorage(compressedCover);

        const { error } = await supabase.from("posts").insert([
          {
            type: "audio",
            title: title.trim(),
            media_url: audioUrl,
            cover_url: coverUrl,
          },
        ]);

        if (error) throw error;
      }

      if (type === "image") {
        console.log("Uploading image");

        const compressedImage = await compressToSquare480(mediaFile!);
        const mediaUrl = await uploadToStorage(compressedImage);

        const { error } = await supabase.from("posts").insert([
          {
            type: "image",
            title: title.trim(),
            media_url: mediaUrl,
          },
        ]);

        if (error) throw error;
      }

      console.log("Redirecting...");
      router.push("/feed");
      router.refresh();
    } catch (err) {
      console.error("Upload failed:", err);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 space-y-6">
      <h1 className="text-xl">create post</h1>

      {/* Title */}
      <input
        type="text"
        placeholder="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-neutral-900 p-2 w-full max-w-md"
      />

      {/* Type Selector */}
      <div className="flex space-x-4">
        {["audio", "image"].map((t) => (
          <button
            key={t}
            onClick={() => setType(t as any)}
            className={`px-4 py-2 border ${
              type === t
                ? "border-white"
                : "border-neutral-700 text-neutral-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* AUDIO */}
      {type === "audio" && (
        <>
          <div className="w-full max-w-md">
            <p className="text-sm mb-2">upload mp3</p>
            <input
              type="file"
              accept=".mp3,.m4a,audio/mpeg,audio/mp4"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                if (file.size > 15 * 1024 * 1024) {
                  alert("Audio must be under 15MB");
                  return;
                }

                setAudioFile(file);
              }}
            />
          </div>

          <div className="w-full max-w-md">
            <p className="text-sm mb-2">upload cover image (square)</p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                console.log("Cover selected:", file);
                setCoverFile(file);
              }}
            />
          </div>
        </>
      )}

      {/* IMAGE */}
      {type === "image" && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            console.log("Image selected:", file);
            setMediaFile(file);
          }}
        />
      )}

      {/* VIDEO */}
      {type === "video" && (
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            console.log("Video selected:", file);
            setMediaFile(file);
          }}
        />
      )}

      {/* Upload */}
      <button
        disabled={!canUpload || uploading}
        onClick={handleUpload}
        className={`px-6 py-2 ${
          canUpload && !uploading
            ? "bg-white text-black"
            : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
        }`}
      >
        {uploading ? "uploading..." : "upload"}
      </button>
    </div>
  );
}
