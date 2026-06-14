import os from "os";

export function getLocalNetworkIp(): string | null {
  const interfaces = os.networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return entry.address;
      }
    }
  }

  return null;
}

export function getPortFromHost(host: string | null): string {
  if (!host) return process.env.PORT ?? "3000";
  const colonIndex = host.lastIndexOf(":");
  if (colonIndex === -1) return "3000";
  return host.slice(colonIndex + 1) || "3000";
}

export function buildCustomerLoginUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/login`;
}

export function getCustomerLinks(host: string | null) {
  const port = getPortFromHost(host);
  const localIp = getLocalNetworkIp();
  const publicBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  return {
    publicLink: publicBase ? buildCustomerLoginUrl(publicBase) : null,
    localLink: localIp
      ? buildCustomerLoginUrl(`http://${localIp}:${port}`)
      : null,
    isDeployed: Boolean(publicBase),
  };
}
