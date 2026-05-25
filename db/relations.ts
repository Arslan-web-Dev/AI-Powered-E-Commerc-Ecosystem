// Relations are handled via Drizzle's query API with schema references
// The fullSchema in connection.ts merges schema and relations
// For MySQL with planetscale mode, we use explicit joins in queries
// rather than defined relations objects
