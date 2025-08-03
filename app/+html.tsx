// File: app/+html.tsx
import { responsiveBackground } from './html/responsive-style';
import MetaTags from './html/MetaTags';
import ScrollReset from './html/ScrollReset';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <MetaTags />
        <ScrollReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
