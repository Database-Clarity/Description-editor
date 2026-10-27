import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const sources = {
  intermediate: ['Database-Clarity/Live-Clarity-Database', 'intermediate', 'intermediateDescriptions.json'],
  live: ['Database-Clarity/Live-Clarity-Database', 'converter', 'liveDescriptions.json'],
  generator: ['Database-Clarity/Description-data-generator', 'main', 'templates/descriptions.json'],
};
const provenance = { downloadedAt: new Date().toISOString(), sources: {} };
const databases = {};
for (const [name, [repository, branch, path]] of Object.entries(sources)) {
  const commitResponse = await fetch(`https://api.github.com/repos/${repository}/commits/${branch}`);
  if (!commitResponse.ok) throw new Error(`Commit lookup ${name}: HTTP ${commitResponse.status}`);
  const { sha } = await commitResponse.json();
  const url = `https://raw.githubusercontent.com/${repository}/${sha}/${path}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Fixture ${name}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 5_000_000) {
    throw new Error(`${name} exceeds 5 MB; add gzip support before refreshing`);
  }
  databases[name] = JSON.parse(bytes.toString('utf8'));
  await writeFile(new URL(`./fixtures/${name}.json`, import.meta.url), bytes);
  provenance.sources[name] = {
    repository, branch, commit: sha, path, url,
    bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}
await writeFile(
  new URL('./fixtures/provenance.json', import.meta.url),
  `${JSON.stringify(provenance, null, 2)}\n`,
);
await writeBranchDrift(databases.intermediate, databases.live);

async function writeBranchDrift(intermediate, live) {
  const authoredFields = ['editor'];
  const mainOnly = (perk) => {
    const result = structuredClone(perk);
    for (const text of Object.values(result.editor)) text.secondary = text.main;
    return result;
  };
  const differences = [];
  for (const [hash, entry] of Object.entries(live.perks)) {
    const source = mainOnly(intermediate.perks[hash]);
    const target = mainOnly(entry);
    const fields = authoredFields.filter((field) =>
      JSON.stringify(source[field]) !== JSON.stringify(target[field]),
    );
    if (fields.length === 0) continue;
    const select = (perk) => Object.fromEntries(fields.map((field) => [field, perk[field] ?? null]));
    differences.push({
      hash: Number(hash),
      reason: `Existing source-branch differences in ${fields.join(', ')}; preserve intermediate authored values.`,
      intermediate: select(source),
      live: select(target),
    });
  }
  await writeFile(
    new URL('./fixtures/branch-drift.json', import.meta.url),
    `${JSON.stringify(differences, null, 2)}\n`,
  );
}
