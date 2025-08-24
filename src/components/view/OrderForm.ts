import { Form } from './FormView';
import { IOrderForm } from '../../types';
import { IEvents } from '../base/eventst';
import { ensureElement } from '../../utils/utils';

/**
 * Форма заказа, расширяющая базовый класс Form.
 * Обрабатывает ввод адреса и выбор способа оплаты (картой или наличными).
 *
 * @typeparam IOrderForm - Тип данных формы заказа.
 */
export class OrderForm extends Form<IOrderForm> {
	/**
	 * Поле ввода адреса доставки.
	 * @protected
	 */
	protected addressInput: HTMLInputElement;

	/**
	 * Кнопка выбора оплаты картой.
	 * @protected
	 */
	protected paymentCard: HTMLButtonElement;

	/**
	 * Кнопка выбора оплаты наличными.
	 * @protected
	 */
	protected paymentCash: HTMLButtonElement;

	/**
	 * Создает экземпляр формы заказа.
	 * Инициализирует элементы формы и добавляет обработчики событий.
	 *
	 * @param container - Контейнер формы (HTMLFormElement)
	 * @param events - Менеджер событий приложения
	 */
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		// Инициализация элементов формы
		this.addressInput = ensureElement<HTMLInputElement>(
			'input[name=address]',
			this.container
		);
		this.paymentCard = ensureElement<HTMLButtonElement>(
			'button[name=card]',
			this.container
		);
		this.paymentCash = ensureElement<HTMLButtonElement>(
			'button[name=cash]',
			this.container
		);

		// Обработчик выбора оплаты картой
		this.paymentCard.addEventListener('click', () => {
			/**
			 * Событие выбора способа оплаты.
			 * @event order:payment
			 * @type {Object}
			 * @property {string} payment - Тип оплаты ('card' или 'cash')
			 */
			this.events.emit('order:payment', { payment: 'card' });
		});

		// Обработчик выбора оплаты наличными
		this.paymentCash.addEventListener('click', () => {
			/**
			 * Событие выбора способа оплаты.
			 * @event order:payment
			 * @type {Object}
			 * @property {string} payment - Тип оплаты ('card' или 'cash')
			 */
			this.events.emit('order:payment', { payment: 'cash' });
		});

		// Обработчик ввода адреса
		this.addressInput.addEventListener('input', () => {
			/**
			 * Событие ввода адреса.
			 * @event order:address
			 * @type {Object}
			 * @property {string} address - Введенный адрес
			 */
			this.events.emit('order:address', { address: this.addressInput.value });
		});
	}

	/**
	 * Устанавливает значение адреса в поле ввода.
	 *
	 * @param value - Адрес доставки
	 */
	set address(value: string) {
		this.addressInput.value = value;
	}

	/**
	 * Устанавливает выбранный способ оплаты.
	 * Добавляет/удаляет класс активности для соответствующей кнопки.
	 *
	 * @param value - Тип оплаты ('card' или 'cash')
	 */
	set payment(value: 'card' | 'cash') {
		this.paymentCard.classList.toggle('button_alt-active', value === 'card');
		this.paymentCash.classList.toggle('button_alt-active', value === 'cash');
	}
}
