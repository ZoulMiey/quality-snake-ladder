import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function Qr({ text, size }: { text: string; size?: number }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0b2a1f", light: "#ffffff" } })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [text]);
  return <div className="qr" style={size ? { width: size, height: size } : undefined} dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label={`QR code for ${text}`} />;
}
