var Cart = {
	storeTime: 18000 * 1000,

	now: (new Date()).getTime(),

	init: function() {
		this.cart = this.readStorage();

		if (!this.cart || (this.cart && this.cart.time < this.now)) {
			this.cart = {
				items: {},
				total: 0,
				time: (this.now + this.storeTime)
			};

			this.save();
		}
	},

	readStorage: function() {
		return JSON.parse(window.localStorage.getItem('cart'));
	},

	read: function() {
		return this.cart;
	},

	save: function() {
		window.localStorage.setItem('cart', JSON.stringify(this.cart));
	},

	addItem: function(name, params) {
		if (!this.cart.items[name]) {
			this.cart.items[name] = {
				count: 0,
				params: params
			};
		}

		this.cart.items[name].count++;
		this.cart.total++;

		this.save();
	},

	getItem: function(name) {
		return this.cart.items[name] || {};
	},

	updateItem: function(name, count) {
		count *= 1;
		this.cart.total -= this.cart.items[name].count;

		var status = 1;

		if (count <= 0) {
			delete this.cart.items[name];
			status = 2;
		}
		else {
			this.cart.items[name].count = count;
			this.cart.total += count;
		}

		this.save();

		return status;
	},

	removeItem: function(name) {
		if (this.cart.items[name]) {
			this.cart.total -= this.cart.items[name].count;
			delete this.cart.items[name];
		}

		this.save();
	},

	clear: function() {
		this.cart = null;
		this.save();
	}
};

var CartDom = {
	updateTotal: function(total) {
		$('#cart_count').text(total);
	},

	showProducts: function(cart) {
		$('#cart_count').text(cart.total);

		if ($('#products_page').length) {
			for (var k in cart.items) {
				var item = $('[data-item="' + k + '"]');
				item.parent().parent().addClass('active');
				item.find('span').text(cart.items[k].count);
				$('#cart_' + k).removeClass('d-none');
			}
		}
	},

	drawProducts: function(cart) {
		var table = $('#cart_table tbody');
		if (!table.length) return;

		if (cart.total === 0) {
			table.append('<tr><td colspan="6" class="text-left">No items</td></tr>');
		}
		else {
			var cart_total = 0;

			for (var k in cart.items) {
				var item = cart.items[k];
				var amount = (item.params.price * item.count).toFixed(2);

				cart_total += parseFloat(amount);

				table.append(
					'<tr id="row_' + k + '">' +
					'<td class="product-thumbnail"><a><img src="/img/' + k + '.jpg" alt=""></a></td>' +
					'<td class="product-name">' + item.params.title + '</td>' +
					'<td class="product-price"><span class="unit-amount">$<span>' + item.params.price + '</span></span></td>' +
					'<td class="product-quantity"><input type="number" class="form-control text-center" data-item="' + k + '" value="' + item.count + '"></td>' +
					'<td class="product-subtotal"><span class="subtotal-amount">$<span>' + amount + '</span></span></td>' +
					'<td class="product-remove"><a href="#" data-item="' + k + '"><i class="icofont-ui-delete"></i></a></td>' +
					'</tr>'
				);
			}

			$('.cart-total').text(cart_total.toFixed(2));
		}
	},

	updatePrice: function(item, count, price) {
		$('#row_' + item + ' .subtotal-amount span').text((count * price).toFixed(2));
	},

	removeProduct: function(name) {
		$('#row_' + name).remove();

		var tbody = $('#cart_table tbody');
		if (!tbody.find('tr').length) {
			tbody.append('<tr><td colspan="6" class="text-left">No items</td></tr>');
		}
	},

	recalcTotals: function(cart) {
		var cart_total = 0;

		for (var k in cart.items) {
			var item = cart.items[k];
			cart_total += parseFloat((item.params.price * item.count).toFixed(2));
		}

		$('.cart-total').text(cart_total.toFixed(2));
	},

	drawCheckout: function(cart) {
		var table = $('#checkout_table tbody');
		if (!table.length) return;

		var cart_total = 0;

		for (var k in cart.items) {
			var item = cart.items[k];
			var amount = (item.count * item.params.price).toFixed(2);
			cart_total += parseFloat(amount);

			table.append(
				'<tr>' +
				'<td class="product-name"><a>' + item.params.title + '</a></td>' +
				'<td class="product-total"><span class="subtotal-amount">$' + amount + '</span></td>' +
				'</tr>'
			);
		}

		$('.order-subtotal-amount span').text(cart_total);
		$('.subtotal-amount span').text(cart_total + 5);
		$('#inp_amount').val(cart_total + 5);
	}
};

(function($){
	"use strict";

	jQuery(document).on('ready', function () {
		// Mean Menu
		jQuery('.mean-menu').meanmenu({
			meanScreenWidth: "991"
		});

		// Header Sticky
		$(window).on('scroll',function() {
            if ($(this).scrollTop() > 80){
                $('.crake-nav').addClass("is-sticky");
            }
            else{
                $('.crake-nav').removeClass("is-sticky");
            }
		});

		// Clear cart
		var returnPage = $('#return_page');
		if (returnPage.length) {
			Cart.clear();
		}

		// Product Items
		$('.add-to-cart-btn').click(function(e) {
			e.preventDefault();

			var self = $(this);
			self.parent().parent().addClass('active');
			self.find('span').text(self.find('span').text() * 1 + 1);
			$('#cart_count').text($('#cart_count').text() * 1 + 1);
			$('#cart_' + self.data('item')).removeClass('d-none');

			Cart.addItem(self.data('item'), {
				title: self.data('title'),
				price: self.data('price')
			});

			CartDom.updateTotal(Cart.read().total);
		});

		// Cart
		Cart.init();
		CartDom.showProducts(Cart.read());
		CartDom.drawProducts(Cart.read());

		$('.product-remove a').click(function(e) {
			e.preventDefault();

			var self = $(this);

			Cart.removeItem(self.data('item'));
			CartDom.removeProduct(self.data('item'));

			CartDom.updateTotal(Cart.read().total);
			CartDom.recalcTotals(Cart.read());
		});
		$('#update_cart').click(function(e) {
			e.preventDefault();

			$('#cart_table input').each(function(i, inp) {
				var name = $(inp).data('item');
				var status = Cart.updateItem(name, inp.value);

				if (status === 2) {
					CartDom.removeProduct(name);
				}
				else {
					CartDom.updatePrice(name, Cart.getItem(name).count, Cart.getItem(name).params.price);
				}

				CartDom.updateTotal(Cart.read().total);
				CartDom.recalcTotals(Cart.read());
			});
		});

		//Checkout
		CartDom.drawCheckout(Cart.read());
    });
}(jQuery));