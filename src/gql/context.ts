import { Photon } from "@prisma/photon";
import { NextApiRequest } from "next";

const photon = new Photon();

export interface Context {
  photon: Photon;
  req: NextApiRequest;
}

export function createContext({ req }: { req: NextApiRequest }): Context {
  return {
    req,
    photon
  };
}
