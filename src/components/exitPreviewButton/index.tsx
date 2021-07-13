import Link from 'next/link';

import './exitPreviewButton.module.scss';

export function ExitPreviewButton(): JSX.Element {
  return (
    <aside>
      <Link href="/api/exit-preview">
        <a>Sair do modo preview</a>
      </Link>
    </aside>
  );
}
