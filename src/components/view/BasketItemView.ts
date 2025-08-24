// Импорт базового класса CardView для наследования функциональности
import { CardView } from './CardView';
// Импорт интерфейса событий для работы с системой событий
import { IEvents } from '../base/Events';

// Класс BasketItemView представляет элемент корзины, наследуется от CardView
export class BasketItemView extends CardView {
	// Ссылка на DOM-элемент контейнера
	public container: HTMLElement;

	/**
	 * Конструктор класса BasketItemView
	 * @param container - DOM-элемент контейнера товара в корзине
	 * @param events - экземпляр системы событий для обработки взаимодействий
	 * @param id - уникальный идентификатор товара
	 * @param index - порядковый номер товара в корзине (начиная с 1)
	 */
	constructor(
		container: HTMLElement,
		private events: IEvents, // Приватное поле для хранения системы событий
		private id: string, // Приватное поле для хранения ID товара
		index: number // Позиция товара в списке корзины
	) {
		// Вызов конструктора родительского класса CardView
		super(container);

		// Сохранение ссылки на контейнер в публичное поле
		this.container = container;

		// Поиск элемента для отображения порядкового номера товара
		const indexEl = container.querySelector('.basket__item-index');

		// Если элемент найден, устанавливаем его текстовое содержимое
		if (indexEl) indexEl.textContent = String(index);

		// Поиск кнопки удаления товара из корзины
		const deleteButton = container.querySelector('.basket__item-delete');

		// Если кнопка удаления найдена, добавляем обработчик события
		if (deleteButton) {
			// Обработчик клика по кнопке удаления
			deleteButton.addEventListener('click', () => {
				// Генерация события удаления товара из корзины
				// Передача ID товара в данных события
				this.events.emit('basket:remove', { id: this.id });
			});
		}
	}
}
