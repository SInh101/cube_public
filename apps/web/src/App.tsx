import { useEffect, useState } from 'react';

type HealthStatus = 'checking' | 'ok' | 'error';

export function App() {
  const [status, setStatus] = useState<HealthStatus>('checking');

  useEffect(() => {
    const controller = new AbortController();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

    fetch(`${apiBaseUrl}/api/health`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(`Health check failed: ${response.status}`);
        setStatus('ok');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        setStatus('error');
      });

    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>Rubik&apos;s Cube Learning</h1>
      <p>
        API status: <output data-status={status}>{status}</output>
      </p>
    </main>
  );
}
