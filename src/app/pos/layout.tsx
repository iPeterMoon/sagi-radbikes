import type { Metadata } from "next";
import POSLayoutClient from "./components/POSLayoutClient";
 
export const metadata: Metadata = {
  title: "POS - RAD Bikes",
  description: "Punto de venta para RAD Bikes",
};
 
export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <POSLayoutClient>{children}</POSLayoutClient>;
}
 