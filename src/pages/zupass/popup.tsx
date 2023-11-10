"use client";
import { useZupassPopupSetup } from "@/service/zupass/PassportPopup";

/**  This popup sends requests and receives PCDs from the passport. */
export default function PassportPopupRedirect() {
  const error = useZupassPopupSetup();
  return <div>{error}</div>;
}
