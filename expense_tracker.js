export default function createExpenseDb(db) {
    async function addExpense(categoryId, amount) {
      try {
        const category = await db.oneOrNone('SELECT * FROM categories WHERE id = $1', [categoryId]);
  
        if (!category) {
          throw new Error('Category not found');
        }
  
        await db.none(`
            INSERT INTO expenses (expense, amount, total, category_id)
            VALUES ($1, $2, $3, $4)
        `, [category.category_type, parseFloat(amount), parseFloat(amount), categoryId]);
  
        return { success: true, message: 'Expense added successfully' };
      } catch (error) {
        return { success: false, message: `Failed to add expense: ${error.message}` };
      }
    }
  
    async function allExpenses() {
      try {
        const expenses = await db.manyOrNone(`
            SELECT expenses.*, categories.category_type
            FROM expenses
            INNER JOIN categories ON expenses.category_id = categories.id
        `);
  
        return expenses;
      } catch (error) {
        return { success: false, message: `Failed to retrieve all expenses: ${error.message}` };
      }
    }
  
    async function expensesForCategory(categoryId) {
      try {
        const expenses = await db.manyOrNone(`
            SELECT expenses.*, categories.category_type
            FROM expenses
            INNER JOIN categories ON expenses.category_id = categories.id
            WHERE expenses.category_id = $1
        `, [categoryId]);
  
        return expenses;
      } catch (error) {
        return { success: false, message: `Failed to retrieve expenses for category: ${error.message}` };
      }
    }
  
    async function deleteExpense(expenseId) {
      try {
        const expense = await db.oneOrNone('SELECT * FROM expenses WHERE id = $1', [expenseId]);
  
        if (!expense) {
          throw new Error('Expense not found');
        }
  
        await db.none('DELETE FROM expenses WHERE id = $1', [expenseId]);
        return { success: true, message: 'Expense deleted successfully' };
      } catch (error) {
        return { success: false, message: `Failed to delete expense: ${error.message}` };
      }
    }
  
    async function categoryTotals() {
      try {
        const totals = await db.manyOrNone(`
            SELECT category_id, SUM(amount) AS total
            FROM expenses
            GROUP BY category_id
        `);
  
        return totals;
      } catch (error) {
        return { success: false, message: `Failed to calculate category totals: ${error.message}` };
      }
    }
  
    return {
      expenseTracker: {
        addExpense,
        allExpenses,
        expensesForCategory,
        deleteExpense,
        categoryTotals,
      },
    };
  }
  
