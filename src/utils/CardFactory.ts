import { cloneTemplate } from './utils';
import { ICard } from '../types';
import { IEvents } from '../components/base/Events';
import { ProductCard } from '../components/view/ProductCard';

/**
 * Фабричная функция для создания карточки товара
 * Создает DOM-элемент карточки на основе переданных данных и шаблона
 *
 * @param {ICard} cardData - Данные карточки товара (интерфейс ICard)
 * @param {IEvents} events - Объект для управления событиями (интерфейс IEvents)
 * @param {string} templateId - ID HTML-шаблона для создания карточки
 * @returns {HTMLElement} Готовый DOM-элемент карточки товара
 *
 * @example
 * const cardElement = createProductCard(
 *   { id: '1', title: 'Product', price: 100 },
 *   events,
 *   'card-template'
 * );
 */
export function createProductCard(
	cardData: ICard,
	events: IEvents,
	templateId: string
): HTMLElement {
	// Клонирование HTML-шаблона по указанному ID
	const element = cloneTemplate(templateId);

	// Создание экземпляра компонента ProductCard
	const card = new ProductCard(element, events);

	// Рендеринг карточки с переданными данными и возврат DOM-элемента
	return card.render({ ...cardData });
}
