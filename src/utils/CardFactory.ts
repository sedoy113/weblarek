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
	templateId: string,
	handlers?: { onClick?: () => void }
): HTMLElement {
	const element = cloneTemplate(templateId);
	const card = new ProductCard(element, events, handlers);

	card.inBasket = cardData.inBasket;

	// Рендерим карточку с переданными данными
	// Свойство inBasket автоматически обновит состояние кнопки через сеттер
	return card.render({ ...cardData });
}
