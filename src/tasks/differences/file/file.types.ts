import { CacheProvider, Reader } from "../../../utils/cache2";

export interface DecodableWithGameVal {
  archiveId?: number;
  gameVal?: unknown;
  id: number;
}

export interface Decoder<T extends DecodableWithGameVal, ID> {
  decode(reader: Reader, id: ID): T;
}

export interface ParentArchiveDecoder<T extends DecodableWithGameVal> {
  loadDataWithChildren(
    cache: CacheProvider,
    archiveId: number
  ): Promise<{ parent: T; children: T[] } | undefined>;
}
