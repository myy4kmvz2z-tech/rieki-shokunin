import Link from "next/link";
import { s } from "../lib/styles";

export default function BackLink({ href = "/dashboard", children = "← 戻る" }) {
  return (
    <Link href={href} style={{ ...s.back, textDecoration: "none", display: "inline-block" }}>
      {children}
    </Link>
  );
}
