/**
 * POSIX no-clobber publication for durable files. POSIX expresses it with
 * link(2); hosts whose policy denies hard links (Android under SELinux, even
 * inside app-private storage) fall back to an exclusive copy, which keeps the
 * no-clobber contract but forfeits atomicity. There is no third option: rename()
 * would silently overwrite a concurrent publisher's file.
 * @module @deepseek-ai/dsh-session-persistence-jsonl/posix
 */

import { constants } from 'node:fs'
import { copyFile } from 'node:fs/promises'

/** Error codes that mean this host cannot create hard links at all. */
const LINK_UNAVAILABLE = new Set(['EACCES', 'EPERM', 'ENOSYS', 'ENOTSUP', 'EOPNOTSUPP'])

function hardLinkUnavailable(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException | null)?.code
  return code !== undefined && LINK_UNAVAILABLE.has(code)
}

/**
 * Publish `source` at `target` without overwriting an existing target.
 * @param source - staged file the caller owns and removes after success.
 * @param target - final path; an existing target rejects with EEXIST.
 * @param link - the host's hard-link operation, injected so callers keep their filesystem seam.
 * @returns A promise resolving once the target holds the published bytes.
 */
export async function publishNewFilePosix(
  source: string,
  target: string,
  link: (existingPath: string, newPath: string) => Promise<void>,
): Promise<void> {
  try {
    await link(source, target)
    return
  } catch (error) {
    if (!hardLinkUnavailable(error)) throw error
  }
  await copyFile(source, target, constants.COPYFILE_EXCL)
}
