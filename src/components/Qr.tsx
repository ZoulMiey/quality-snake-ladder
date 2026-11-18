import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function Qr({ text, size = 320 }: { text: string; size?: number }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0b2a1f", light: "#ffffff" } })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [text]);
  return <div className="qr" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} role="img" aria-label={`QR code for ${text}`} />;
}
