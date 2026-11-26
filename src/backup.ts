import { normalizeDesign, type DesignConfig } from './catalog';
import { encodeWorkspace, normalizeWorkspace, type Workspace } from './records';

export type Backup = {
  schemaVersion: 1; exportedAt: string; design: DesignConfig; workspace: Workspace;
};
export function encodeBackup(design: DesignConfig, workspace: Workspace, exportedAt: string): string {
  return JSON.stringify({ schemaVersion: 1, exportedAt,
    design: normalizeDesign(design), workspace: normalizeWorkspace(workspace) } satisfies Backup, null, 2);
}
export function decodeBackup(raw: string): Pick<Backup, 'design'|'workspace'> {
  if (raw.length < 20 || raw.length > 200000) throw new Error('BACKUP_SIZE_INVALID');
  const data = JSON.parse(raw) as unknown;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('BACKUP_INVALID');
  const obj = data as Record<string, unknown>;
  if (obj.schemaVersion !== 1 || !obj.design || typeof obj.design !== 'object' ||
    !obj.workspace || typeof obj.workspace !== 'object') throw new Error('BACKUP_UNSUPPORTED');
  const design = obj.design as Record<string, unknown>;
  const workspace = obj.workspace as Record<string, unknown>;
  if (design.version !== 2 || workspace.version !== 2) throw new Error('BACKUP_VERSION_UNSUPPORTED');
  if (Array.isArray(workspace.designs) && workspace.designs.length > 30 ||
      Array.isArray(workspace.cart) && workspace.cart.length > 30 ||
      Array.isArray(workspace.quotes) && workspace.quotes.length > 30) throw new Error('BACKUP_TOO_MANY_ITEMS');
  // All IDs, names, amounts and configurations are normalized; totals are recalculated from the code catalog.
  return { design: normalizeDesign(design), workspace: normalizeWorkspace(workspace) };
}
