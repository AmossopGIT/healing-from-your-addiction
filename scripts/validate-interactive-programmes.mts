import { validateAllInteractiveProgrammes } from "../content/interactiveProgrammes/validate";
import { interactiveProgrammes } from "../content/interactiveProgrammes";

const issues = validateAllInteractiveProgrammes();
const errors = issues.filter((issue) => issue.level === "error");
const warnings = issues.filter((issue) => issue.level === "warning");

console.log(`Programmes: ${interactiveProgrammes.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

for (const issue of issues) {
  console.log(`[${issue.level}] ${issue.slug}: ${issue.message}`);
}

if (errors.length) {
  process.exitCode = 1;
}
