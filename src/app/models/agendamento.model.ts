import { Animal } from "./animal.model";
import { Pessoa } from "./pessoa.model";

export interface Agendamento {
  id: number;
  campanhaId: number;
  data: string;
  hora: string;
  pessoaId: number;
  pessoa?: Pessoa,
  animalId: number;
  animal?: Animal;
  empresaId: number;
}
