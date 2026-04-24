import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowForge — HR Workflow Designer | Tredence Studio',
  description:
    'Next-generation HR Workflow Designer built on React Flow. Visually design, configure, and simulate HR processes like onboarding, leave approval, and document verification.',
  keywords: ['HR workflow', 'React Flow', 'workflow designer', 'Tredence Studio', 'AI agentic platform'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
