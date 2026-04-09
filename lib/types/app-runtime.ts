export type DatabaseProvider = "mssql" | "postgres";
export type StorageProvider = "local-public" | "supabase-storage";
export type AnalysisProvider = "mock" | "openai";
export type AuthMode = "guest";
export type BillingMode = "disabled" | "prepared";

export type AppRuntimeConfig = {
  databaseProvider: DatabaseProvider;
  storageProvider: StorageProvider;
  analysisProvider: AnalysisProvider;
  authMode: AuthMode;
  billingMode: BillingMode;
};
