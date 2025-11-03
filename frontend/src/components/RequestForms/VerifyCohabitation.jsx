import React, { useEffect, useMemo, useState } from "react";
import CaloocanLogo from "../../assets/CaloocanLogo.png";
import Logo145 from "../../assets/Logo145.png";

function UnderlinedValue({ value, width = 180, italic = false, align = "center" }) {
  const displayText = value && String(value).trim() ? String(value) : "\u00A0";
  return (
    <span
      style={{
        display: "inline-block",
        minWidth: width,
        borderBottom: "1px solid #000",
        padding: "0 6px 2px 6px",
        fontStyle: italic ? "italic" : "normal",
        textAlign: align,
        lineHeight: 1.2,
      }}
    >
      {displayText}
    </span>
  );
}

function formatDateDisplay(dateString) {
  if (!dateString) return "";
  const dateOnly = dateString.includes("T") ? dateString.split("T")[0] : dateString;
  const [year, month, day] = dateOnly.split("-");
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return `${monthNames[parseInt(month,10)-1]} ${parseInt(day,10)}, ${year}`;
}

export default function VerifyCohabitation() {
  const apiBase = "http://localhost:5000";
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");

  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const id = search ? search.get("id") : null;

  useEffect(() => {
    async function fetchRecord() {
      if (!id) { setError("Missing id"); return; }
      try {
        // Try server first
        const res = await fetch(`${apiBase}/certificate-of-cohabitation/${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          const normalized = {
            certificate_of_cohabitation_id: data.certificate_of_cohabitation_id || id,
            resident1_id: data.resident1_id,
            resident2_id: data.resident2_id,
            full_name1: data.full_name1,
            dob1: data.dob1 ? data.dob1.split("T")[0] : "",
            full_name2: data.full_name2,
            dob2: data.dob2 ? data.dob2.split("T")[0] : "",
            address: data.address,
            date_started: data.date_started,
            date_issued: data.date_issued ? data.date_issued.split("T")[0] : "",
            witness1_name: data.witness1_name,
            witness2_name: data.witness2_name,
            transaction_number: data.transaction_number,
            is_active: data.is_active ?? 1,
            date_created: data.date_created,
          };
          setRecord(normalized);
          return;
        }
      } catch (_) {
        // fall through to local storage
      }

      // Fallback to localStorage for drafts
      try {
        const map = JSON.parse(localStorage.getItem("certificates") || "{}");
        const draft = map[id];
        if (draft) {
          setRecord(draft);
          return;
        }
      } catch (_) {}
      setError("Certificate not found");
    }
    fetchRecord();
  }, [id]);

  const display = useMemo(() => record || {}, [record]);

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: 'Poppins, sans-serif' }}>
        {error}
      </div>
    );
  }

  if (!record) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: 'Poppins, sans-serif' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", background: "#F1F0E9", padding: 20 }}>
      <div id="certificate-preview" style={{ position: "relative", width: "8.5in", height: "11in", boxShadow: "0 0 8px rgba(0,0,0,0.2)", background: "#fff", overflow: "hidden" }}>
        <img style={{ position: "absolute", width: "100px", height: "100px", top: "60px", left: "60px" }} src={CaloocanLogo} alt="Logo 1" />
        <img style={{ position: "absolute", width: "100px", height: "100px", top: "60px", right: "40px" }} src={Logo145} alt="Logo 3" />
        <img style={{ position: "absolute", opacity: 0.2, width: "550px", left: "50%", top: "270px", transform: "translateX(-50%)" }} src={Logo145} alt="Watermark" />

        <div style={{ position: "absolute", whiteSpace: "pre", textAlign: "center", width: "100%", fontSize: "20px", fontWeight: "bold", fontFamily: '"Lucida Calligraphy", cursive', top: "50px" }}>
          Republic of the Philippines
        </div>
        <div style={{ position: "absolute", whiteSpace: "pre", textAlign: "center", width: "100%", fontSize: "13pt", fontWeight: "bold", fontFamily: "Arial, sans-serif", top: "84px" }}>
          CITY OF CALOOCAN
        </div>
        <div style={{ position: "absolute", whiteSpace: "pre", textAlign: "center", width: "100%", fontSize: "15pt", fontWeight: "bold", fontFamily: '"Arial Black", sans-serif', top: "110px" }}>
          BARANGAY 145 ZONES 13 DIST. 1
        </div>
        <div style={{ position: "absolute", whiteSpace: "pre", textAlign: "center", width: "100%", fontSize: "15pt", fontWeight: "bold", fontFamily: '"Arial Black", sans-serif', top: "138px" }}>
          Tel. No. 8711 - 7134
        </div>
        <div style={{ position: "absolute", whiteSpace: "pre", textAlign: "center", width: "100%", fontSize: "12pt", fontWeight: "bold", fontFamily: '"Arial Black", sans-serif', top: "166px" }}>
          OFFICE OF THE BARANGAY CHAIRMAN
        </div>
        <div style={{ position: "absolute", top: "200px", width: "100%", textAlign: "center" }}>
          <span style={{ fontFamily: 'Times New Roman', fontSize: "20pt", fontWeight: "bold", display: "inline-block", color: "#0b7030", padding: "4px 70px", fontStyle: "italic", textDecoration: "underline" }}>
            CERTIFICATION
          </span>
        </div>

        <div style={{ position: "absolute", whiteSpace: "pre-wrap", top: "280px", left: "80px", width: "640px", textAlign: "justify", fontFamily: '"Times New Roman", serif', fontSize: "12pt", fontWeight: "bold", color: "black" }}>
          TO WHOM IT MAY CONCERN:

          <p style={{ textIndent: "50px" }}>
            This is to certify that <UnderlinedValue value={display.full_name1} italic width={220} />, born on <UnderlinedValue value={display.dob1 ? new Date(display.dob1).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : ""} width={160} /> and <UnderlinedValue value={display.full_name2} italic width={220} />, born on <UnderlinedValue value={display.dob2 ? new Date(display.dob2).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : ""} width={160} />, are cohabiting at <UnderlinedValue value={display.address} width={380} align="left" />, Barangay 145, Bagong Barrio, Caloocan City.
          </p>

          <p style={{ textIndent: "50px" }}>
            Upon the request of the subject residents and to the best knowledge of the Barangay, we certify that they have been living together at the aforementioned address since <UnderlinedValue value={display.date_started} width={100} />.
          </p>

          <p style={{ textIndent: "50px" }}>
            This shall serve as CERTIFICATE OF COHABITATION for whatever legal purpose it may serve.
          </p>

          <p style={{ textIndent: "50px" }}>
            Issued this <UnderlinedValue value={display.date_issued ? (() => { const date = new Date(display.date_issued); const day = date.getDate(); const month = date.toLocaleString("default", { month: "short" }); const year = date.getFullYear(); const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th"; return `${day}${suffix} day of ${month}, ${year}`; })() : ""} width={260} /> at Barangay 145 office, Bagong Barrio, Caloocan City.
          </p>

          <div style={{ textAlign: "center", fontWeight: "bold", marginTop: "40px", textDecoration: "underline" }}>
            WITNESS
          </div>

          <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", paddingLeft: "60px", paddingRight: "60px", fontFamily: '"Times New Roman", serif', fontSize: "12pt", fontWeight: "bold" }}>
            <UnderlinedValue value={display.witness1_name} width={220} />
            <UnderlinedValue value={display.witness2_name} width={220} />
          </div>
        </div>

        <div style={{ position: "absolute", top: "800px", left: "220px", width: "300px", textAlign: "left", fontFamily: '"Times New Roman", serif', fontSize: "12pt", fontWeight: "bold" }}>
          <div style={{ color: "black", fontFamily: "inherit" }}>Certified Correct:</div>
          <div style={{ color: "black", fontFamily: "inherit", fontSize: '14pt' }}>Roselyn Anore</div>
          <div style={{ color: "black", fontFamily: "inherit", fontStyle: 'italic' }}>Barangay Secretary</div>
        </div>

        <div style={{ position: "absolute", top: "800px", right: "20px", width: "300px", textAlign: "left", fontFamily: '"Times New Roman", serif', fontWeight: "bold" }}>
          <div style={{ color: "black", fontFamily: "inherit", fontSize: "12pt" }}>Attested: </div> <br /><br />
          <div style={{ color: "black", fontFamily: "inherit", fontSize: "16pt", fontStyle: "italic" }}>ARNOLD DONDONAYOS</div>
          <div style={{ color: "black", fontFamily: "inherit", fontSize: "12pt", fontStyle: "italic" }}>Barangay Chairman</div>
        </div>
      </div>

      <style>{`@media print { body * { visibility: hidden; } #certificate-preview, #certificate-preview * { visibility: visible; } #certificate-preview { position: absolute; left: 0; top: 0; width: 8.5in; height: 11in; transform: none !important; } @page { size: portrait; margin: 0; } #certificate-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`}</style>
    </div>
  );
}


