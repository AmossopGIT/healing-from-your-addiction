import { seedInteractiveProgrammes } from "../lib/dashboard/interactiveProgrammeSeed.ts";

async function main() {
  const result = await seedInteractiveProgrammes({ publish: true });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
