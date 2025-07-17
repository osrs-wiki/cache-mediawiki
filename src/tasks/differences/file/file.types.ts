import { Reader } from "../../../utils/cache2";

export interface DecodableWithGameVal {
  gameVal?: unknown;
  id: number;
}

export interface Decoder<T extends DecodableWithGameVal, ID> {
  decode(reader: Reader, id: ID): T;
}
