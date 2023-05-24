export interface Address {
  address: string;
  port: number;
}
export function parseAddress(address: string): Address {
  const [addr, port] = address.split(":");
  if (port === undefined) {
    throw new Error(`invalid address: ${address}`);
  }
  return { address: addr, port: parseInt(port) };
}
