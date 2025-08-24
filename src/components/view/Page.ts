import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/eventst';

interface IPage {
	counter: number;
	gallery: HTMLElement[];
	locked: boolean;
}
/**
 * Компонент страницы, управляющий элементами интерфейса и взаимодействием с корзиной.
 */
export class Page extends Component<IPage> {
	/**
	 * Защищённый элемент счётчика товаров в корзине.
	 * @protected
	 */
	protected _counter: HTMLElement;

	/**
	 * Защищённый элемент галереи товаров.
	 * @protected
	 */
	protected _gallery: HTMLElement;

	/**
	 * Защищённый контейнер страницы.
	 * @protected
	 */
	protected _wrapper: HTMLElement;

	/**
	 * Защищённый элемент корзины.
	 * @protected
	 */
	protected _basket: HTMLElement;

	/**
	 * Конструктор класса Page.
	 * Инициализирует DOM-элементы и настраивает обработчики событий.
	 *
	 * @param container - Корневой контейнер компонента.
	 * @param events - Объект управления событиями.
	 */
	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Инициализация DOM-элементов
		this._counter = ensureElement<HTMLElement>('.header__basket-counter');
		this._gallery = ensureElement<HTMLElement>('.gallery');
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
		this._basket = ensureElement<HTMLElement>('.header__basket');

		// Обработчик клика на корзине
		this._basket.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	/**
	 * Устанавливает значение счётчика товаров в корзине.
	 *
	 * @param value - Числовое значение количества товаров.
	 */
	set counter(value: number) {
		this.setText(this._counter, String(value));
	}

	/**
	 * Обновляет элементы галереи.
	 *
	 * @param items - Массив DOM-элементов товаров.
	 */
	set gallery(items: HTMLElement[]) {
		this._gallery.replaceChildren(...items);
	}

	/**
	 * Управляет блокировкой прокрутки страницы.
	 *
	 * @param value - Флаг блокировки (true - заблокировать, false - разблокировать).
	 */
	set locked(value: boolean) {
		this._wrapper.classList.toggle('page__wrapper_locked', value);
	}
}
