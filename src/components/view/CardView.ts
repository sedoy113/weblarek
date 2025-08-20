// Импорт базового компонента и типа данных карточки
import { Component } from '../base/Component';
import { ICard } from '../../types';

// Класс представления карточки товара, наследуется от базового Component
export class CardView extends Component<ICard> {
	// Защищенные свойства для DOM-элементов карточки
	protected _title: HTMLElement | null; // Элемент заголовка карточки
	protected _category: HTMLElement | null; // Элемент категории товара
	protected _price: HTMLElement | null; // Элемент цены товара
	protected _image: HTMLImageElement | null; // Элемент изображения товара

	// Конструктор класса, принимает контейнер карточки
	constructor(protected container: HTMLElement) {
		super(container); // Вызов конструктора родительского класса

		// Инициализация DOM-элементов через поиск в контейнере
		this._title = container.querySelector('.card__title');
		this._category = container.querySelector('.card__category');
		this._price = container.querySelector('.card__price');
		this._image = container.querySelector('.card__image');
	}

	// Сеттер для установки заголовка карточки
	set title(value: string) {
		if (this._title) this.setText(this._title, value);
	}

	// Сеттер для установки категории товара с дополнительной логикой
	set category(value: string) {
		if (this._category) {
			// Очистка предыдущих классов категории
			this._category.classList.forEach((cls) => {
				if (cls.startsWith('card__category_')) {
					this._category.classList.remove(cls);
				}
			});

			// Нормализация значения категории для CSS-класса
			let normalized: string;

			// Преобразование русских названий категорий в английские аналоги
			switch (value) {
				case 'софт-скил':
					normalized = 'soft';
					break;
				case 'другое':
					normalized = 'other';
					break;
				case 'дополнительно':
					normalized = 'additional';
					break;
				case 'кнопка':
					normalized = 'button';
					break;
				case 'хард-скил':
					normalized = 'hard';
					break;
				default:
					normalized = 'other'; // Значение по умолчанию
			}

			// Добавление нового класса категории
			this._category.classList.add(`card__category_${normalized}`);

			// Установка текстового значения категории
			this.setText(this._category, value);
		}
	}

	// Сеттер для установки цены товара
	set price(price: number | null) {
		if (this._price) {
			// Если цена null, отображаем "Бесценно", иначе форматируем цену
			this.setText(
				this._price,
				price === null ? 'Бесценно' : `${price} синапсов`
			);
		}
	}

	// Сеттер для установки изображения товара
	set image(src: string) {
		if (this._image) this.setImage(this._image, src);
	}
}
