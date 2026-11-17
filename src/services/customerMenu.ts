import type { SearchMenuItem } from '../data/searchMenuData';
import type { DemoMenuSeed } from '../backend/demoRepositories';
import type { Repositories } from '../backend/repositories';
import { menuEntity } from '../backend/firestore/mappers.ts';
import { validateCategory } from '../backend/validation.ts';

export const DEMO_MENU_SHOP = 'demo-desi-bites';
export type CustomerMenuRepository = Pick<Repositories, 'kind' | 'menu'>;

// JSON uses image paths; repository documents use the same paths as asset keys.
// Synthetic audit values are only for the private local demonstration store.
export function catalogMenuSeed(catalog: readonly SearchMenuItem[]): DemoMenuSeed {
  const names = [...new Set(catalog.map(item => item.category))];
  const audit = { createdAt: { seconds: 0, nanoseconds: 0 }, updatedAt: { seconds: 0, nanoseconds: 0 } };
  const categories = names.map((name, sortOrder) => ({
    id: `category-${sortOrder}`,
    data: { name, sortOrder, isActive: true, imageAssetKey: catalog.find(item => item.category === name)!.image, ...audit },
  }));
  const items = catalog.map((item, sortOrder) => {
    // The current JSON has no Hindi names. Fail rather than discard future data.
    if (item.hindiName !== undefined) throw new Error('Stage 1 cannot store hindiName.');
    return { id: item.id, data: {
      name: item.name, categoryId: categories[names.indexOf(item.category)].id,
      pricePaise: item.price * 100, currency: 'INR' as const, imageAssetKey: item.image,
      description: item.description, availabilityNote: item.availabilityNote,
      isVeg: item.isVeg, available: item.available, published: true, sortOrder, revision: 1, ...audit,
    } };
  });
  if (new Set(items.map(item => item.id)).size !== items.length) throw new Error('Duplicate catalog IDs.');
  return { shopId: DEMO_MENU_SHOP, items, categories };
}

export async function loadCustomerMenu(repository: CustomerMenuRepository, shopId: string, resolveImage: (key: string) => string): Promise<SearchMenuItem[]> {
  const [items, categories] = await Promise.all([repository.menu.list(shopId), repository.menu.categories(shopId)]);
  const categoryNames = new Map(categories.map(category => {
    validateCategory(category.data);
    return [category.id, category.data] as const;
  }));
  const seen = new Set<string>();
  return [...items].sort((a, b) => a.data.sortOrder - b.data.sortOrder || a.id.localeCompare(b.id)).flatMap(item => {
    const { data } = menuEntity(item.id, item.data);
    if (seen.has(item.id)) throw new Error('Duplicate repository menu ID.');
    seen.add(item.id);
    if (!data.published) return [];
    const category = categoryNames.get(data.categoryId);
    // Stage 1 only returns active categories. An absent category may be
    // inactive or missing; neither permits displaying this item. Do not
    // invent a category or fail otherwise valid active-category items.
    if (!category?.isActive) return [];
    return [{ id: item.id, name: data.name, category: category.name, price: data.pricePaise / 100,
      image: resolveImage(data.imageAssetKey), description: data.description,
      availabilityNote: data.availabilityNote, isVeg: data.isVeg, available: data.available }];
  });
}
