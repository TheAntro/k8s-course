"use client";

import { useState } from "react";

export default function ImageClient() {
  const [imageErrored, setImageErrored] = useState(false);
  return !imageErrored ? (
    <img
      src="/api/pic"
      alt="Random image from Lorem Picsum"
      onError={() => setImageErrored(true)}
      onLoad={() => setImageErrored(false)}
      style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }}
    />
  ) : (
    <p>Image not available</p>
  );
}
