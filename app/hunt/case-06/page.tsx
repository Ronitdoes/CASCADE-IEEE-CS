import type { Metadata } from "next";
import CaseFile06 from "../../../components/case-file-06/CaseFile06";
import CaseGuard from "@/components/CaseGuard";
import "./case06.css";

export const metadata: Metadata = {
  title: "SYBIL // TERMINAL",
  description: "MEMORY INTEGRITY CHECK // SESSION 01",
};

export default function Case06Page() {
  return (
    <CaseGuard caseId="06">
      <div className="case-06-theme">
        <main style={{ height: "100%", width: "100%" }}>
          <CaseFile06 />
        </main>
      </div>
    </CaseGuard>
  );
}
