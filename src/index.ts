export { createContext, buildIndex } from "./core/context.js";
export { runBenchmark } from "./core/benchmark.js";
export { installInstructions } from "./install/adapters.js";
export { runDoctor } from "./commands/doctor.js";
export type {
  Agent,
  AgentSelection,
  BenchmarkResult,
  ContextOptions,
  ContextResult,
  DoctorCheck,
  FileSummary,
  GitInfo,
  InstallScope,
  ProjectIndex
} from "./core/types.js";
