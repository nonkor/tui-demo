import { test } from '@playwright/test';

export async function skipWithWarning(reason: string): Promise<never> {
    const formattedReason = `[WARN][SKIP] ${reason}`;
    console.warn(formattedReason);

    test.info().annotations.push({
        type: 'warning',
        description: reason
    });

    await test.info().attach('skip-reason', {
        body: formattedReason,
        contentType: 'text/plain'
    });

    if (test.info().retry < test.info().project.retries) {
        throw new Error(formattedReason);
    }

    test.info().skip(true, reason);
    throw new Error('unreachable'); // satisfy TS return type
}
