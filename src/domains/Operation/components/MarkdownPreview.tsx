import Markdown from 'react-markdown';

import { cn } from '@/shared/lib';

import { sanitizeMarkdownUrl } from '@/domains/Operation/utils/markdown';

type MarkdownPreviewProps = {
  markdown: string;
  className?: string;
};

const ALLOWED_MARKDOWN_ELEMENTS = ['a', 'br', 'li', 'ol', 'p', 'strong', 'ul'];

function isExternalHref(href?: string) {
  return href?.startsWith('http://') || href?.startsWith('https://');
}

export function MarkdownPreview({ markdown, className }: MarkdownPreviewProps) {
  return (
    <div
      className={cn(
        'space-y-2 text-sm leading-[18.2px] tracking-[-0.5px] text-gray-700',
        '[&_a]:font-medium [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2',
        '[&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5',
        '[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5',
        className
      )}
    >
      <Markdown
        skipHtml
        allowedElements={ALLOWED_MARKDOWN_ELEMENTS}
        urlTransform={(url) => sanitizeMarkdownUrl(url)}
        components={{
          a({ href, children }) {
            const external = isExternalHref(href);

            return (
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
