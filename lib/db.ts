import { Db, MongoClient } from "mongodb";

import { env } from "@/lib/env";

type Cached = {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<Db> | null;
};

const globalWithMongo = globalThis as typeof globalThis & {
  __bjsMongo?: Cached;
};

const cached: Cached =
  globalWithMongo.__bjsMongo ?? {
    client: null,
    db: null,
    promise: null,
  };

if (!globalWithMongo.__bjsMongo) {
  globalWithMongo.__bjsMongo = cached;
}

export async function getDb(): Promise<Db> {
  if (cached.db) {
    return cached.db;
  }

  if (!cached.promise) {
    const client = new MongoClient(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    cached.promise = client
      .connect()
      .then((connectedClient) => {
        cached.client = connectedClient;
        cached.db = connectedClient.db("bjs-prep");
        return cached.db;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  return cached.promise;
}