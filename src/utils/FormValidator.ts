import { IOrder, FormErrors } from '../types';

/**
 * Класс для валидации данных формы заказа
 * @class
 * @static
 */
export class FormValidator {
	/**
	 * Валидирует данные платежа и доставки заказа
	 * @static
	 * @param {Partial<IOrder>} order - Объект заказа с частичными данными
	 * @returns {FormErrors} Объект с ошибками валидации
	 * @example
	 * const errors = FormValidator.validateOrderPayment({ payment: 'card' });
	 */
	static validateOrderPayment(order: Partial<IOrder>): FormErrors {
		const errors: FormErrors = {};

		// Проверка способа оплаты
		if (!order.payment || !['card', 'cash'].includes(order.payment))
			errors.payment = 'Выберите способ оплаты';

		// Проверка адреса доставки
		if (!order.address) errors.address = 'Укажите адрес доставки';

		return errors;
	}

	/**
	 * Валидирует контактные данные заказа
	 * @static
	 * @param {Partial<IOrder>} order - Объект заказа с частичными данными
	 * @returns {FormErrors} Объект с ошибками валидации
	 * @example
	 * const errors = FormValidator.validateOrderContacts({ email: 'test@example.com' });
	 */
	static validateOrderContacts(order: Partial<IOrder>): FormErrors {
		const errors: FormErrors = {};

		// Проверка email
		if (!order.email) errors.email = 'Укажите email';

		// Проверка телефона
		if (!order.phone) errors.phone = 'Укажите телефон';

		return errors;
	}
}
