const express = require('express');
const app = express();
const router = express.Router();
const layouts = require('express-ejs-layouts');
const parser = require('body-parser');

app.use(function(req, res, next) {
	res.locals = {
		year: (new Date()).getFullYear(),
		home: false
	};
	next();
});

router.get('/', function(req, res) {
	res.locals.home = true;
	res.render('pages/index');
});
router.get('/cart', function(req, res) {
	res.render('pages/cart');
});
router.get('/checkout', function(req, res) {
	res.render('pages/checkout');
});
router.post('/return', function(req, res) {
	if (req.body.status == 'cancel') {
		res.render('pages/cancel');
	}
	else {
		res.render('pages/return');
	}
});

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(layouts);
app.set('views', './views');
app.set('layout', 'layouts/store');
app.use(parser.urlencoded({ extended: false }));
app.use('/', router);

app.use(function(req, res, next) {
	res.status(404).render('pages/404');
});

app.listen(process.env.PORT || 3000);