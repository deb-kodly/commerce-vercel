import { getCategoryById } from 'lib/sfdc';

/**
 * Resolves the display name of the category at the current URL.
 * Uses a targeted SOQL query by Salesforce Id — does not fetch the full category tree.
 * Wrapped in Suspense at the call-site to stream the label independently.
 */
export async function CategoryLabelServer({ collection }: { collection: string }) {
  const name = await getCategoryById(collection);
  return <>{name ?? 'Products'}</>;
}
