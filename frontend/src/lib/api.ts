const aiApiUrl = process.env.NEXT_PUBLIC_AI_API_URL ?? "http://localhost:8000";

export async function lookupCase(cnr: string) {
  if (!/^[A-Za-z0-9]{16}$/.test(cnr)) throw new Error("CNR must be exactly 16 alphanumeric characters");
  const response = await fetch(`${aiApiUrl}/api/v1/cases/${encodeURIComponent(cnr)}`);
  if (!response.ok) throw new Error("Case lookup failed");
  return response.json();
}

