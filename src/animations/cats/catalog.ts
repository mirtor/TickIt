export type CatAnimEntry = {
  name: string;
  load: () => Promise<any>;
};

// Carga lazy de todos los JSON de la carpeta
const modules = import.meta.glob("./*.json");

function fileToName(path: string) {
  const base = path.split("/").pop() || path;
  return base.replace(/\.json$/i, "");
}

export const catAnimations: CatAnimEntry[] = Object.keys(modules)
  .sort()
  .map((path) => ({
    name: fileToName(path),
    load: async () => {
      const mod: any = await (modules as any)[path]();
      return mod.default ?? mod;
    },
  }));
