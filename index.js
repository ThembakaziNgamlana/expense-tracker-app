import express from 'express';
import exphbs from 'express-handlebars';
import bodyParser from 'body-parser';
import pgPromise from 'pg-promise';
import session from 'express-session';
import createExpenseDb from './expense_tracker.js';
import Handlebars from 'handlebars';
import flash from 'express-flash';




const app = express();
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));
app.use(flash());

Handlebars.registerHelper('eq', function (a, b, options) {
  return a === b;
});
const sessionOptions = {
  secret: 'your_secret_key', 
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));


const handlebars = exphbs.create({
    extname: '.handlebars',
    defaultLayout: false,
    layoutDir: './views/layouts',
  });

const pgp = pgPromise();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const connectionString = process.env.DATABASE_URL || 'postgres://axrmtrqq:tPEX1P5Jn_JX3PRdQO9l9_A-q49GP0ZR@ella.db.elephantsql.com/axrmtrqq?ssl=true';   
const db = pgp(connectionString);


const expenseTracker = createExpenseDb(db);

//Home route
app.get('/', async(req, res) => {
    const totals = await expenseTracker.categoryTotals();
    console.log(totals)
    res.render('index' , {expenseTotal:totals});
});

// Add Expense
app.post('/expenses', async (req, res) => {
    const { categoryId, amount , description} = req.body;
    
    try {
        await  expenseTracker.addExpense(categoryId, amount , description);

        const expenses = await expenseTracker.allExpenses(); // Fetch the updated list of expenses
        const message = 'Expense added successfully';
        res.redirect('/')
       // res.render('index', { expenses, message });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Get Expenses by Category
app.get('/expenses/:categoryId', async (req, res) => {
    const { categoryId } = req.params;
    try {
        const expenses = await expenseTracker.expensesForCategory(categoryId);
        if (expenses.length > 0) {
            res.render('categoryExpenses', { categoryId, expenses });
        } else {
            const message = 'No expenses found for this category';
            res.render('noExpenses', { message });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete Expense
app.delete('/expenses/:expenseId', async (req, res) => {
    const { expenseId } = req.params;
    try {
        const deleteResult = await expenseTracker.deleteExpense(expenseId);
        if (deleteResult.success) {
            res.status(200).send('Expense deleted successfully');
        } else {
            res.status(404).send('Expense not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Get Category Totals
// app.get('/categoryTotals', async (req, res) => {
//     try {
//         const totals = await expenseTracker.categoryTotals();
//         if (totals.length > 0) {
//             res.render('categoryTotals', { totals });
//         } else {
//             const message = 'No category totals available';
//             res.render('noCategoryTotals', { message });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});