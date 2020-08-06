declare module 'migrate/lib/template-generator' {
  interface TemplateGeneratorOptions {
    name: string;
    templateFile: string;
    migrationsDirectory: string;
    extension: string;
  }

  type TemplateGeneratorCb = (error: Error | null, path?: string) => void;

  export default function templateGenerator(opts: TemplateGeneratorOptions, cb: TemplateGeneratorCb): void;
}
