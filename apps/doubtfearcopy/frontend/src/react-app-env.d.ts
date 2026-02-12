/// <reference types="react-scripts" />

declare module '*.tsx' {
  const content: React.FC;
  export default content;
}

declare module '*.ts' {
  const content: any;
  export default content;
} 