import { Photon } from "@prisma/photon";
import { MicroRequest } from "apollo-server-micro/dist/types";

const photon = new Photon();

export interface Context {
  photon: Photon;
  request: MicroRequest;
}

export function createContext(request: MicroRequest): Context {
  return {
    request,
    photon
  };
}
