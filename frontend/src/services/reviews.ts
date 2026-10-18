import axios from "axios";
import { authConfig } from "./http";

interface NuevaResena {
  booking: string;
  rating: number;
  comment: string;
}

const create = async (resena: NuevaResena) => {
  const response = await axios.post("/reviews", resena, authConfig());
  return response.data;
};

export default { create };