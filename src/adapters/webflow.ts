/** Webflow adapter — stubbed interface for asset/CMS/site fetching */

export interface WebflowAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  dimensions?: { width: number; height: number };
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
  uploadAsset(siteId: string, file: File): Promise<WebflowAsset>;
}

export const webflowAdapter: WebflowAdapter = {
  async getAssets() {
    return [
      { id: 'a1', name: 'company-logo.png', url: 'https://placehold.co/200x60?text=Logo', type: 'image/png', dimensions: { width: 200, height: 60 } },
      { id: 'a2', name: 'email-banner.jpg', url: 'https://placehold.co/600x200?text=Banner', type: 'image/jpeg', dimensions: { width: 600, height: 200 } },
      { id: 'a3', name: 'team-photo.jpg', url: 'https://placehold.co/600x400?text=Team+Photo', type: 'image/jpeg', dimensions: { width: 600, height: 400 } },
      { id: 'a4', name: 'office-hero.jpg', url: 'https://placehold.co/600x300?text=Office+Hero', type: 'image/jpeg', dimensions: { width: 600, height: 300 } },
      { id: 'a5', name: 'social-icon.svg', url: 'https://placehold.co/48x48?text=Icon', type: 'image/svg+xml', dimensions: { width: 48, height: 48 } },
      { id: 'a6', name: 'product-screenshot.png', url: 'https://placehold.co/800x500?text=Product', type: 'image/png', dimensions: { width: 800, height: 500 } },
      { id: 'a7', name: 'cta-background.jpg', url: 'https://placehold.co/600x250?text=CTA+BG', type: 'image/jpeg', dimensions: { width: 600, height: 250 } },
      { id: 'a8', name: 'avatar-placeholder.png', url: 'https://placehold.co/120x120?text=Avatar', type: 'image/png', dimensions: { width: 120, height: 120 } },
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
  async uploadAsset(_siteId: string, file: File) {
    // Stub: simulate upload delay and return a mock asset
    await new Promise(r => setTimeout(r, 800));
    const id = `a_upload_${Date.now()}`;
    const url = URL.createObjectURL(file);
    return {
      id,
      name: file.name,
      url,
      type: file.type,
      dimensions: { width: 600, height: 400 },
    };
  },
};
