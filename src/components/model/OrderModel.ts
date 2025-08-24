import { IOrder, FormErrors } from '../../types';
import { IEvents } from '../base/Events';

// Определяем частичный заказ без полей items и total
type PartialOrder = Omit<IOrder, 'items' | 'total'>;

export class OrderModel {
	// Объект заказа с основными полями
	private order: PartialOrder = {
		payment: 'card', // Способ оплаты по умолчанию
		address: '', // Адрес доставки
		email: '', // Email покупателя
		phone: '', // Телефон покупателя
	};

	private errors: FormErrors = {}; // Объект для хранения ошибок валидации

	// Конструктор принимает только шину событий
	constructor(private events: IEvents) {}

	/**
	 * Устанавливает значение поля заказа
	 * @param field - название поля для установки
	 * @param value - значение поля
	 */
	setOrderField(
		field: keyof Omit<IOrder, 'items' | 'total'>,
		value: string
	): void {
		// Обрабатываем поле payment отдельно, так как оно имеет специфичный тип
		if (field === 'payment') {
			this.order[field] = value as 'card' | 'cash';
		} else {
			this.order[field] = value;
		}

		// Валидируем форму в зависимости от измененного поля
		if (field === 'email' || field === 'phone') {
			this.validateContacts(); // Валидация контактных данных
		} else {
			this.validateOrder(); // Валидация данных заказа
		}
	}

	/**
	 * Валидирует основные данные заказа (оплата и адрес)
	 */
	validateOrder(): void {
		const errors: FormErrors = {};

		// Проверка способа оплаты
		if (!this.order.payment) errors.payment = 'Выберите способ оплаты';

		// Проверка адреса доставки
		if (!this.order.address.trim()) errors.address = 'Укажите адрес доставки';

		const isValid = Object.keys(errors).length === 0;
		this.errors = errors;

		// Отправляем событие с результатами валидации
		this.events.emit('order:valid', { isValid, errors });
	}

	/**
	 * Валидирует контактные данные (email и телефон)
	 */
	validateContacts(): void {
		const errors: FormErrors = {};

		// Проверка email
		if (!this.order.email.trim()) errors.email = 'Укажите email';

		// Проверка телефона
		if (!this.order.phone.trim()) errors.phone = 'Укажите телефон';

		const isValid = Object.keys(errors).length === 0;
		this.errors = errors;

		// Отправляем событие с результатами валидации
		this.events.emit('contacts:valid', { isValid, errors });
	}

	/**
	 * Очищает данные заказа и сбрасывает ошибки
	 */
	clear(): void {
		// Сбрасываем заказ к значениям по умолчанию
		this.order = {
			payment: 'card',
			address: '',
			email: '',
			phone: '',
		};
		this.errors = {}; // Очищаем ошибки

		// Отправляем события о невалидности форм
		this.events.emit('order:valid', { isValid: false, errors: {} });
		this.events.emit('contacts:valid', { isValid: false, errors: {} });
	}

	/**
	 * Формирует полный объект заказа для отправки на сервер
	 * @param items - массив идентификаторов товаров
	 * @param total - общая сумма заказа
	 * @returns Полный объект заказа
	 */
	getOrder(items: string[], total: number): IOrder {
		return {
			...this.order, // Основные данные заказа
			items, // Добавляем товары
			total, // Добавляем общую сумму
		};
	}

	/**
	 * Геттер для получения текущих ошибок валидации
	 */
	getErrors(): FormErrors {
		return this.errors;
	}

	/**
	 * Геттер для получения текущего состояния заказа
	 */
	getOrderData(): PartialOrder {
		return { ...this.order };
	}
}
