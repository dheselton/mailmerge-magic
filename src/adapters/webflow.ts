/** Webflow adapter — stubbed interface for asset/CMS/site fetching */

export interface WebflowAsset {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface WebflowCMSItem {
  id: string;
  name: string;
  slug: string;
  fields: Record<string, unknown>;
}

export interface WebflowSite {
  id: string;
  name: string;
  domain: string;
}

export interface WebflowAdapter {
  getAssets(siteId: string): Promise<WebflowAsset[]>;
  getCMSItems(siteId: string, collectionId: string): Promise<WebflowCMSItem[]>;
  getSite(siteId: string): Promise<WebflowSite>;
}

export const webflowAdapter: WebflowAdapter = {
  async getAssets() {
    return [
      { id: 'a1', name: 'logo.png', url: 'https://placehold.co/200x60?text=Logo', type: 'image/png' },
      { id: 'a2', name: 'banner.jpg', url: 'https://placehold.co/600x200?text=Banner', type: 'image/jpeg' },
      { id: 'a3', name: 'icon.svg', url: 'https://placehold.co/48x48?text=Icon', type: 'image/svg+xml' },
    ];
  },
  async getCMSItems() {
    return [
      { id: 'c1', name: 'Senior Frontend Engineer', slug: 'senior-frontend', fields: { department: 'Engineering', location: 'Remote' } },
      { id: 'c2', name: 'Product Designer', slug: 'product-designer', fields: { department: 'Design', location: 'NYC' } },
    ];
  },
  async getSite() {
    return { id: 's1', name: 'Acme Careers', domain: 'careers.acme.com' };
  },
};
